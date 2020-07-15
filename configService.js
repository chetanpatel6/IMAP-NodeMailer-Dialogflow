var config=require('./config.json');

var ConfigService=function() {

}

module.exports=ConfigService;

ConfigService.prototype.getAccountType = function(account) {
  return config.emailAccounts[account].type
}


ConfigService.prototype.getUserName = function(account) {
  return config.emailAccounts[account].user
}

ConfigService.prototype.getPassword = function(account) {
  return config.emailAccounts[account].password;
}

ConfigService.prototype.getHost = function(account) {
  return config.emailAccounts[account].host;
}

ConfigService.prototype.getPort = function(account) {
  return config.emailAccounts[account].port;
}

ConfigService.prototype.isTLS = function(account) {
  return config.emailAccounts[account].tls;
}

ConfigService.prototype.getProjectId= function(account){
  return config.emailAccounts[account].projectID;
}

ConfigService.prototype.getAccounts = function () {
  return config.emailAccounts;
}

ConfigService.prototype.getAccountConfigService = function(account) {
  return new SubConfigService(account);
}

SubConfigService = function (account) {
  this.account = account;
}

SubConfigService.prototype.getConfig = function() {
  return config.emailAccounts[this.account].custom;
}
