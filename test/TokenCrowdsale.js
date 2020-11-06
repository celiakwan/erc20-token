const Token = artifacts.require('Token');
const TokenCrowdsale = artifacts.require('TokenCrowdsale');

const BN = n => new web3.utils.BN(n);

const now = () => Math.floor(new Date().getTime() / 1000);

const sleep = t => new Promise(resolve => setTimeout(resolve, t));

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

        const startTime = now();
        const endTime = startTime + 24 * 60 * 60; // Lasts for one day
        tokenCrowdsale = await TokenCrowdsale.new(token.address, admin, rate, startTime, endTime);
    });

    it('Smart contract is deployed with correct values', async () => {
        const tokenContract = await tokenCrowdsale.token();
        const exchangeRate = BN(await tokenCrowdsale.rate());
        const startTime = await tokenCrowdsale.startTime();
        const endTime = await tokenCrowdsale.endTime();
        
        assert.equal(tokenContract, token.address, 'Correct token contract address');
        assert.equal(exchangeRate.toString(), rate.toString(), 'Correct exchange rate');
        assert.isAtMost(startTime.toNumber(), now(), 'Correct start time');
        assert.isAbove(endTime.toNumber(), now(), 'Correct end time');
    });

    it('Start crowdsale', async () => {
        const defaultEthInAccount = web3.utils.toWei('100', 'ether');
        const purchaserEthBalance = BN(await web3.eth.getBalance(purchaser));
        assert.equal(purchaserEthBalance.toString(), defaultEthInAccount.toString(), 'Correct ETH balance of the purchaser account');

        const beneficiaryBalance = BN(await token.balanceOf(beneficiary));
        assert.equal(beneficiaryBalance.toString(), '0', 'Correct token balance of the beneficiary account');

        const weiAmount = '1000';
        // The same as weiAmount since the exchange rate is 1
        const tokens = '1000';

        await token.transfer(tokenCrowdsale.address, totalSupply, {from: admin});

        const adminEthBalance = BN(await web3.eth.getBalance(admin));

        const buyTokens = await tokenCrowdsale.buyTokens(beneficiary, {
            from: purchaser,
            value: web3.utils.toWei(weiAmount, 'wei')
        });

        assert.isTrue(buyTokens.receipt.status, 'Purchased successfully');
        assert.equal(buyTokens.logs[0].args.purchaser, purchaser, 'Correct purchaser account');
        assert.equal(buyTokens.logs[0].args.beneficiary, beneficiary, 'Correct beneficiary account');
        assert.equal(BN(buyTokens.logs[0].args.value).toString(), weiAmount, 'Correct wei amount');
        assert.equal(BN(buyTokens.logs[0].args.amount).toString(), tokens, 'Correct number of tokens purchased');
        
        const adminEthBalanceAfter = BN(await web3.eth.getBalance(admin));
        const expectedAdminBalance = adminEthBalance.add(BN(weiAmount));
        assert.equal(adminEthBalanceAfter.toString(), expectedAdminBalance.toString(), 'Correct ETH balance of the admin account after purchase');

        const purchaserEthBalanceAfter = BN(await web3.eth.getBalance(purchaser));
        const tx = await web3.eth.getTransaction(buyTokens.tx);
        const buyTokensGasFee = BN(buyTokens.receipt.gasUsed).mul(BN(tx.gasPrice));
        const expectedPurchaserBalance = BN(defaultEthInAccount).sub(BN(weiAmount)).sub(buyTokensGasFee);
        assert.equal(purchaserEthBalanceAfter.toString(), expectedPurchaserBalance.toString(), 'Correct ETH balance of the purchaser account after purchase');

        const tokensAvailable = BN(await token.balanceOf(tokenCrowdsale.address));
        const expectedTokensAvailable = totalSupply.sub(BN(tokens));
        assert.equal(tokensAvailable.toString(), expectedTokensAvailable.toString(), 'Correct tokens available after purchase');

        const beneficiaryBalanceAfter = BN(await token.balanceOf(beneficiary));
        assert.equal(beneficiaryBalanceAfter.toString(), tokens, 'Correct token balance of the beneficiary account after purchase');
    });

    it('Purchase tokens after the end time of crowdsale', async () => {
        const startTime = now();
        const endTime = startTime + 5; // Lasts for five seconds
        const newTokenCrowdsale = await TokenCrowdsale.new(token.address, admin, rate, startTime, endTime);

        // Sleep for six seconds
        await sleep(6000);

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
