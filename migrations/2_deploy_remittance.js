const Remittance = artifacts.require("Remittance");

module.exports = function(deployer) {
  var setDeadline = + new Date();
  var _date = new Date(setDeadline);
  var futureDate  = _date.setMonth(_date.getMonth()+1);
  deployer.deploy(Remittance,true,setDeadline,futureDate);
};
