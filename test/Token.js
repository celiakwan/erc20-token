const Token = artifacts.require('Token');

const BN = n => new web3.utils.BN(n);

contract('Token', accounts => {
    const totalSupply = BN(100000000000);
    const admin = accounts[0];
    let token;

    beforeEach(async () => {
        token = await Token.new(totalSupply);
    });

    it('Smart contract is deployed with correct values', async () => {
        const name = await token.name.call();
        const symbol = await token.symbol.call();
        const supply = BN(await token.totalSupply.call());

        assert.equal(name, 'GoldenEggToken', 'Correct token name');
        assert.equal(symbol, 'GET', 'Correct token symbol');
        assert.equal(supply.toString(), totalSupply.toString(), 'Correct total supply');
    });

    it('Transfer tokens exceeding balance', async () => {
        const recipient = accounts[1];
        const amount = totalSupply.add(BN(1));
        let f;

        try {
            await token.transfer.call(recipient, amount, {from: admin});
        } catch(e) {
            f = () => {throw e};
        } finally {
            assert.throws(f, /transfer amount exceeds balance/, 'Cannot transfer tokens exceeding balance');
        }
    });

    it('Transfer tokens properly', async () => {
        const recipient = accounts[1];
        const amount = BN(20);

        const senderBalance = BN(await token.balanceOf(admin));
        const recipientBalance = BN(await token.balanceOf(recipient));

        assert.equal(senderBalance.toString(), totalSupply.toString(), 'Correct token balance of the sender account');
        assert.equal(recipientBalance.toString(), '0', 'Correct token balance of the recipient account');
        
        const transfer = await token.transfer(recipient, amount, {from: admin});

        assert.isTrue(transfer.receipt.status, 'Transferred successfully');
        assert.equal(transfer.logs[0].args.from, admin, 'Correct sender account');
        assert.equal(transfer.logs[0].args.to, recipient, 'Correct recipient account');
        assert.equal(BN(transfer.logs[0].args.value).toString(), amount.toString(), 'Correct transfer amount');

        const tokensAvailable = totalSupply.sub(amount);

        const senderBalanceAfter = BN(await token.balanceOf(admin));
        const recipientBalanceAfter = BN(await token.balanceOf(recipient));

        assert.equal(senderBalanceAfter.toString(), tokensAvailable.toString(), 'Correct token balance of the sender account after transfer');
        assert.equal(recipientBalanceAfter.toString(), amount.toString(), 'Correct token balance of the recipient account after transfer');
    });

    it('Authorized spender transfers tokens exceeding allowance', async () => {
        const spender = accounts[2];
        const recipient = accounts[3];
        const amountToSpend = BN(10);

        const approval = await token.approve(spender, amountToSpend, {from: admin});

        assert.isTrue(approval.receipt.status, 'Approved successfully');
        assert.equal(approval.logs[0].args.owner, admin, 'Correct owner account');
        assert.equal(approval.logs[0].args.spender, spender, 'Correct spender account');
        assert.equal(BN(approval.logs[0].args.value).toString(), amountToSpend.toString(), 'Correct transfer amount authorized to spender');

        const allowance = BN(await token.allowance(admin, spender));

        assert.equal(allowance.toString(), amountToSpend.toString(), 'Correct allowance for delegated transfer');

        const amountToTransfer = BN(11);
        let f;

        try {
            await token.transferFrom(admin, recipient, amountToTransfer, {from: spender});
        } catch(e) {
            f = () => {throw e};
        } finally {
            assert.throws(f, /transfer amount exceeds allowance/, 'Cannot transfer tokens exceeding allowance');
        }
    });

    it('Authorized spender transfers tokens properly', async () => {
        const spender = accounts[4];
        const recipient = accounts[5];
        const amount = BN(10);

        const approval = await token.approve(spender, amount, {from: admin});

        assert.isTrue(approval.receipt.status, 'Approved successfully');
        assert.equal(approval.logs[0].args.owner, admin, 'Correct owner account');
        assert.equal(approval.logs[0].args.spender, spender, 'Correct spender account');
        assert.equal(BN(approval.logs[0].args.value).toString(), amount.toString(), 'Correct transfer amount authorized to spender');

        const allowance = BN(await token.allowance(admin, spender));

        assert.equal(allowance.toString(), amount.toString(), 'Correct allowance for delegated transfer');

        const ownerBalance = BN(await token.balanceOf(admin));
        const recipientBalance = BN(await token.balanceOf(recipient));

        assert.equal(ownerBalance.toString(), totalSupply.toString(), 'Correct token balance of the owner account');
        assert.equal(recipientBalance.toString(), '0', 'Correct token balance of the recipient account');

        const transferFrom = await token.transferFrom(admin, recipient, amount, {from: spender});

        assert.isTrue(transferFrom.receipt.status, 'Transferred successfully');
        assert.equal(transferFrom.logs[0].args.from, admin, 'Correct owner account');
        assert.equal(transferFrom.logs[0].args.to, recipient, 'Correct recipient account');
        assert.equal(BN(transferFrom.logs[0].args.value).toString(), amount.toString(), 'Correct transfer amount');

        const tokensAvailable = totalSupply.sub(amount);

        const ownerBalanceAfter = BN(await token.balanceOf(admin));
        const recipientBalanceAfter = BN(await token.balanceOf(recipient));

        assert.equal(ownerBalanceAfter.toString(), tokensAvailable.toString(), 'Correct token balance of the owner account after transfer');
        assert.equal(recipientBalanceAfter.toString(), amount.toString(), 'Correct token balance of the recipient account after transfer');
    });
});
