var Canon=require("./Canon/index.js");
//const Canon = require("./Canon");

var Categories = function (dbService, configService, loggerService) {
    this.configSvc = configService;
    this.categories = {
    }
    let accounts = this.configSvc.getAccounts();
    for(var account in accounts) {
        switch (accounts[account].categoryID) {
            case "CANON":
                this.categories[account] = new Canon(dbService, 
                    this.configSvc.getAccountConfigService(account), loggerService)
                break;
        } 
    }
    return this;
}

module.exports = Categories;
 
Categories.prototype.initialize = function () {
    for (var cat in this.categories) {
        this.categories[cat].initialize()
    }
}


Categories.prototype.init = function (account, mailObj, callback) {
    if (this.categories.hasOwnProperty(account)) {
        let hashMap = this.categories[account].getHashMap();
        hashMap["INIT_HANDLER"](this.categories[account], mailObj, callback);
        return;
    }
    callback( {
        status: false,
        message: "Category ID Not found"
    })
    return;
}

Categories.prototype.newMail = function (account, mailObj, callback) {
    if (this.categories.hasOwnProperty(account)) {
        let hashMap = this.categories[account].getHashMap();
        hashMap["NEW_MAIL_HANDLER"](this.categories[account], mailObj, callback);
        return;
    }
    callback( {
        status: false,
        message: "Category ID Not found"
    })
    return;
}

Categories.prototype.reply = function (account, mailObj, callback) {
    if (this.categories.hasOwnProperty(account)) {
        let hashMap = this.categories[account].getHashMap();
        hashMap["REPLY_HANDLER"](this.categories[account], mailObj, callback);
        return;
    }
    callback( {
        status: false,
        message: "Category ID Not found"
    })
    return;
}


