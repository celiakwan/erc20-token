# erc20-token
An example of creating an ERC-20 token and a crowdsale smart contract in Solidity along with a demonstration of how to deploy them and test their features on a local blockchain network using Truffle and Ganache.

### Version
- [Solidity](https://solidity.readthedocs.io/): 0.8.6
- [Truffle](https://www.trufflesuite.com/): 5.4.5
- [Ganache CLI](https://github.com/trufflesuite/ganache-cli): 6.12.2
- [Web3.js](https://web3js.readthedocs.io/): 1.5.1
- [Node.js](https://nodejs.org/en/): 16.6.1
- [@openzeppelin/contracts](https://openzeppelin.com/): 4.2.0

### Installation
Install Node.js.
```
brew install node
```

Install Truffle globally.
```
npm install truffle -g
```

Install Ganache CLI globally.
```
npm install ganache-cli -g
```

Install the required Node.js packages in this project including @openzeppelin/contracts.
```
npm install
```

### Configuration
By default, Ganache will create 10 accounts and preload each with 100 ETH on your local blockchain network. If you want to connect to other Ethereum networks, you will need to update the Truffle configuration file `truffle-config.js`.

### Deployment
1. Compile the smart contracts.
    ```
    truffle compile
    ```

2. Deploy the smart contracts.
    ```
    truffle migrate
    ```

### Testing
Start the Ganache CLI.
```
ganache-cli -p 7545
```

Run test cases for the ERC-20 token in a new terminal.
```
truffle test test/Token.js
```

Run test cases for crowdsale in a new terminal.
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