const h = require('./helper.js');

const Token = artifacts.require('Token');
const TokenCrowdsale = artifacts.require('TokenCrowdsale');

const BN = n => new web3.utils.BN(n);

contract('TokenCrowdsale', accounts => {
    const totalSupply = BN(100000000000);
    const rate = 1;
    const admin = accounts[0];
    const purchaser = accounts[1];
    const beneficiary = accounts[2];
    let token;
    let tokenCrowdsale;

    before(async () => {
        token = await Token.new(totalSupply);

        const startTime = h.now();
        const endTime = startTime + 24 * 60 * 60; // Lasts for one day
        tokenCrowdsale = await TokenCrowdsale.new(token.address, admin, rate, startTime, endTime);
    });

    it('Start crowdsale', async () => {
        const defaultEthInAccount = web3.utils.toWei('100', 'ether');
        const purchaserEthBalance = BN(await web3.eth.getBalance(purchaser));
        assert.equal(purchaserEthBalance.toString(), defaultEthInAccount.toString(), 'Correct ETH balance of the purchaser account');

        const beneficiaryBalance = BN(await token.balanceOf(beneficiary));
        assert.equal(beneficiaryBalance.toString(), '0', 'Incorrect token balance of the beneficiary account');

        const weiAmount = '1000';
        // The same as weiAmount since the exchange rate is 1
        const tokens = '1000';

        await token.transfer(tokenCrowdsale.address, totalSupply, {from: admin});

        const adminEthBalance = BN(await web3.eth.getBalance(admin));

        const buyTokens = await tokenCrowdsale.buyTokens(beneficiary, {
            from: purchaser,
            value: web3.utils.toWei(weiAmount, 'wei')
        });

        assert.isTrue(buyTokens.receipt.status, 'Purchase failed');
        assert.equal(buyTokens.logs[0].args.purchaser, purchaser, 'Incorrect purchaser account');
        assert.equal(buyTokens.logs[0].args.beneficiary, beneficiary, 'Incorrect beneficiary account');
        assert.equal(BN(buyTokens.logs[0].args.value).toString(), weiAmount, 'Incorrect wei amount');
        assert.equal(BN(buyTokens.logs[0].args.amount).toString(), tokens, 'Incorrect number of tokens purchased');
        
        const adminEthBalanceAfter = BN(await web3.eth.getBalance(admin));
        const expectedAdminEthBalance = adminEthBalance.add(BN(weiAmount));
        assert.equal(adminEthBalanceAfter.toString(), expectedAdminEthBalance.toString(), 'Incorrect ETH balance of the admin account after purchase');

        const purchaserEthBalanceAfter = BN(await web3.eth.getBalance(purchaser));
        const buyTokensGasFee = await h.gasFee(buyTokens)
        const expectedPurchaserEthBalance = purchaserEthBalance.sub(BN(weiAmount)).sub(buyTokensGasFee);
        assert.equal(purchaserEthBalanceAfter.toString(), expectedPurchaserEthBalance.toString(), 'Incorrect ETH balance of the purchaser account after purchase');

        const beneficiaryBalanceAfter = BN(await token.balanceOf(beneficiary));
        assert.equal(beneficiaryBalanceAfter.toString(), tokens, 'Incorrect token balance of the beneficiary account after purchase');
        
        const tokensAvailable = BN(await token.balanceOf(tokenCrowdsale.address));
        const expectedTokensAvailable = totalSupply.sub(BN(tokens));
        assert.equal(tokensAvailable.toString(), expectedTokensAvailable.toString(), 'Incorrect tokens available after purchase');
    });

    it('Purchase tokens after the end time of crowdsale', async () => {
        const startTime = h.now();
        const endTime = startTime + 5; // Lasts for five seconds
        const newTokenCrowdsale = await TokenCrowdsale.new(token.address, admin, rate, startTime, endTime);

        // Sleep for six seconds
        await h.sleep(6000);

        let f;

        try {
            const weiAmount = '1000';

            await token.transfer(newTokenCrowdsale.address, totalSupply, {from: admin});
            
            await newTokenCrowdsale.buyTokens(beneficiary, {
                from: purchaser,
                value: web3.utils.toWei(weiAmount, 'wei')
            });
        } catch(e) {
            f = () => {throw e};
        } finally {
            assert.throws(f, /revert/, 'Cannot purchase tokens after the end time of crowdsale');
        }
    });
});
