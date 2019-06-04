const Remittance = artifacts.require("Remittance");
module.exports = function(deployer) {
  deployer.deploy(Remittance,true,2100,10);
};