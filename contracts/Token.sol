// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(uint256 _totalSupply)
    public ERC20("GoldenEggToken", "GET") {
        _mint(msg.sender, _totalSupply);
        _setupDecimals(18);
    }
}