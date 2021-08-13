const BN = n => new web3.utils.BN(n);

const gasFee = async receipt => {
    const tx = await web3.eth.getTransaction(receipt.tx);
    const gasPrice = BN(tx.gasPrice);
    const gasUsed = BN(receipt.receipt.gasUsed);
    return gasUsed.mul(gasPrice);
};

const now = () => Math.floor(new Date().getTime() / 1000);

const sleep = t => new Promise(resolve => setTimeout(resolve, t));

module.exports = {
    gasFee,
    now,
    sleep
};