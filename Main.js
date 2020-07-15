var Imap = require('imap'),
    inspect = require('util').inspect,
    parser = require('addressparser'),
    config = require('./config.json'),
    dbService='',
    loggerService='';
const MailParser = require('mailparser').MailParser;
var nodemailer = require('nodemailer');
const simpleParser = require('mailparser').simpleParser;
var CategoryIntf = require("./Categories/categories.js");
var ConfigService = require("./configService.js")


function handleMail(categories, account, mail) {
    categories.init(account, mail.mail, function (statusObj) {
        if (statusObj.status) {
            categories.newMail(account, mail.mail, function (statusObj) {
                if (statusObj.status) {
                    categories.reply(account, mail.mail, function (statusObj) {
                        if (statusObj.status) {
                            sendMail(account, statusObj.reply, function(statusObj) {
                                console.log(statusObj.message)
                                
                                
                            })
                            // Use node mailer to send reply
                        }
                    })
                }
            });
        }
    })
}

function Test() {
    var configSvc = new ConfigService();
    let categories = new CategoryIntf(null, configSvc, null);
    categories.initialize();

    for (account in config.emailAccounts) {
        //(imap,newMails)
        fetchNewMails(account,configSvc, (newMails) => {
            for (var i = 0;i<newMails.length;i++) {
                handleMail(categories, account, newMails[i])
            }
        });
    }
}


function fetchNewMails(account,configSvc, callback) {

    var imap = new Imap({
        user: configSvc.getUserName(account),
        password: configSvc.getPassword(account),
        host: configSvc.getHost(account),
        port: configSvc.getPort(account),
        tls: configSvc.isTLS(account)
    });

    function openInbox(cb) {
        imap.openBox('INBOX', false, cb);
    }
    imap.once('ready', function () {
        openInbox(function (err, box) {
            if (err) throw err;
            console.log(box.messages.total + ' message(s) found!');

            // search
            imap.search(['UNSEEN'], function (err, results) {
                if (err) throw err;
                var f = imap.fetch(results, { bodies: '', markSeen: false });
                var newMails = [];
                var msgsToProcess=0;
                var allDone = false;

                f.on('message', function (msg, seqno) {
                    msg.on('body', function (stream, info) {
                        let parserr = new MailParser();
                        parserr.on('headers', headers => {
                            console.log('header',headers.get('subject'));
                        });
                        msgsToProcess++;
                        // console.log("Found Body: ", seqno, info)
                        simpleParser(stream, (err, mail) => {
                            // console.log("Text: ", mail.text)
                            var mailFields = {
                                subject: "",
                                date: "",
                                name: "",
                                email: "",
                                text: ""
                            }
                            // console.log("Parsed Body: ", seqno, info)
                            var from = mail.from.text;
                            var address = parser(from);
                            mailFields.subject = mail.subject;
                            mailFields.date = mail.date;
                            mailFields.name = address[0].name;
                            mailFields.email = address[0].address;
                            mailFields.text = mail.text;
                            newMails.push({
                                mail: mailFields,
                                // seqNo: seqno
                            });
                            if (msgsToProcess==newMails.length && allDone) {
                                callback(newMails);
                            }
                        });
                        // or, write to file
                        //stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
                    });
                    msg.once('attributes', function (attrs) {
                        //console.log('Attributes: %s', inspect(attrs, false, 8));
                        console.log('UID: %s', attrs.uid);
                        console.log('Flags:%s', attrs.flags);
                    });
                    msg.once('end', function () {

                        console.log('Finished');
                    });
                });

                f.once('error', function (err) {
                    // callback(imap, newMails);
                    callback( newMails);
                    console.log('Fetch error:' + err);
                });
                f.once('end', function () {
                    allDone = true;
                    // callback(imap, newMails);
                    if (msgsToProcess==newMails.length && allDone) {
                        callback( newMails);
                    }
                    console.log('Done fetching all messages!');
                    imap.end();
                });
            });
        });
    });

    imap.once('error', function (err) {
        console.log(err);
    });

    imap.once('end', function () {
        console.log('Connection ended');
    });
    imap.connect();
}

function sendMail(account, reply, callback) {
    var transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: config.emailAccounts[account].user,
            pass: config.emailAccounts[account].password
        }
    });
    

    var mailOptions = {
        from: config.emailAccounts[account].user,
        to: reply.to,
        cc: reply.cc,
        bcc: reply.bcc,
        subject: reply.subject,
        text: reply.body
    };
    console.log("sub: ", mailOptions.subject);
    console.log("text: ", mailOptions.text);

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            callback({
                status:false,
                message: error.message
            });
        } else {
            callback({
                status:true,
                message: "Successfully sent mail"
            });
            // console.log('Email sent: ' + info.response);
        }
    });
}


//-------------Function processMail-------------//

// function processMail(emailAccount, mail, callback) {

//     var msg = mail.msg;
//     // let imap=config.emailAccounts[account].type;

//     var mailFields = {

//         subject: "",
//         date: "",
//         name: "",
//         email: "",
//         text: ""
//     }
//     console.log("working");

//     msg.on('body', function (stream, info) {
//         simpleParser(stream, (err, mail) => {
//             var from = mail.from.text;
//             var address = parser(from);
//             console.log(mail.subject);
//             mailFields.subject = mail.subject;
//             mailFields.date = mail.date;
//             mailFields.name = address[0].name;
//             mailFields.email = address[0].address;
//             mailFields.text = mail.text;
//             callback(mailFields)
//         });

//         // or, write to file
//         //stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
//     });
//     msg.once('attributes', function (attrs) {
//         console.log('Attributes: %s', inspect(attrs, false, 8));
//         console.log('UID: %s', attrs.uid);
//     });
//     msg.once("error", function () {
//         console.log("Got an error");
//     })
//     msg.once('end', function () {
//         console.log('Finished');
//     });
//     console.log("Reached here");
// }

Test();
