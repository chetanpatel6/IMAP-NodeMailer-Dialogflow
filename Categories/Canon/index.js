var Canon=function(dbService, configService, loggerService) {
	this.dbSvc = dbService;
	this.configSvc = configService;
	this.logger = loggerService;
}

module.exports = Canon


var hashMap = {
	"INIT_HANDLER": function (self, mailObj, callback) {
		return self.handleInit(mailObj, callback);
	},
	"NEW_MAIL_HANDLER": function (self, mailObj, callback) {
		self.handleNewMail(mailObj, callback)
	},
	"REPLY_HANDLER": function (self, mailObj, callback) {
		self.handleReply(mailObj, callback)
	}
}

Canon.prototype.getHashMap = function() {
	return hashMap;
}

/*****************************************************/

Canon.prototype.initialize = function () {
	console.log("Initializing canon");
}

Canon.prototype.handleInit = function (mailObj, callback) {
	callback({
		status:true
	});
}

Canon.prototype.handleNewMail = function (mailObj, callback) {
	console.log("Got a New mail")
	console.log(mailObj)
	callback({
		status: true,
		message: "Handled New Mail"
	})
}

Canon.prototype.handleReply = function (mailObj, callback) {
    var d=new Date(mailObj.date);
    d.setDate(d.getDate() + 2);
    // console.log(d.getDay());
    if (d.getDay() == 6 || d.getDay() == 0) {
        d.setDate(d.getDate() + 2)
    } else if (d.getDay() == 1) {
        d.setDate(d.getDate() + 1)
    }
    var n = d.toDateString();
    console.log(n);

    var text = 'Hi ' + mailObj.name + ',\n\nThank you for your email. We would love to help solve your issue.\nWe will get back to you in 2 days i.e., ('+ n +').';

	callback({
		status: true,
		reply: {
			to: [mailObj.email],
			cc: [],
			bcc:[],
			subject: "Re: " + mailObj.subject,
			body: text
			
		}
	})
}
