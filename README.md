# erc20-token
An example of creating an ERC-20 token and a crowdsale smart contract in Solidity along with a demonstration of how to deploy them and test their features on a local blockchain network using Truffle and Ganache.

### Version
- [Solidity](https://solidity.readthedocs.io/): 0.6.0
- [Truffle](https://www.trufflesuite.com/): 5.1.50
- [Ganache](https://www.trufflesuite.com/ganache): 2.4.0
- [Web3.js](https://web3js.readthedocs.io/): 1.2.9
- [Node.js](https://nodejs.org/en/): 15.0.1
- [@openzeppelin/contracts](https://openzeppelin.com/): 3.2.0

### Installation
Install Ganache from https://www.trufflesuite.com/ganache.

Install Node.js.
```
brew install node
```
Install Truffle globally.
```
npm install truffle -g
```
Install the required Node.js packages in this project including @openzeppelin/contracts.
```
npm install
```

### Configuration
By default, Truffle comes bundled with a local development blockchain server which provides 10 accounts and preloads each of them with 100 ETH. For testing purposes, we can use it without modifying the network settings. However, you will need to update the Truffle configuration file `truffle-config.js` if you are connecting to other Ethereum networks.

### Deployment
1. Compile the smart contracts.
    ```
    truffle compile
    ```

2. Before migrating to our local blockchain, we should open Ganache first.

3. Deploy the smart contracts.
    ```
    truffle migrate
    ```

### Testing
Run test cases for the ERC-20 token.
```
truffle test test/Token.js
```
Run test cases for crowdsale.
```
truffle test test/TokenCrowdsale.js
```

Some useful functions you can play with using Truffle testing framework or console.

- Get token balance of an account.
    ```
    token.balanceOf(accounts[0])
    ```
- Get ETH balance of an account.
    ```
    web3.eth.getBalance(accounts[0])
    ```
- Transfer tokens from one account to another account.
    ```
    token.transfer(accounts[1], 10, {from: accounts[0]})
    ```
- Authorize an account to spend a certain amount of tokens on behalf of an owner account.
    ```
    token.approve(accounts[1], 10, {from: accounts[0]})
    ```
- Get the allowance that can be spent by a spender account from an owner account.
    ```
    token.allowance(accounts[0], accounts[1])
    ```
- Transfer tokens by a spender account from an owner account.
    ```
    token.transferFrom(accounts[0], accounts[2], 10, {from: accounts[1]})
    ```