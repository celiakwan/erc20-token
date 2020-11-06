const Token = artifacts.require('Token');
const TokenCrowdsale = artifacts.require('TokenCrowdsale');

module.exports = async (deployer, network, accounts) => {
  const totalSupply = 100000000000;
  const fundReceiver = accounts[0];
  const rate = 1;
  const now = Math.floor(new Date().getTime() / 1000);
  const endTime = now + 7 * 24 * 60 * 60; // Lasts for one week

  await deployer.deploy(Token, totalSupply);
  await deployer.deploy(TokenCrowdsale, Token.address, fundReceiver, rate, now, endTime);
};
