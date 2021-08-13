// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Token.sol";

contract TokenCrowdsale {
    Token token;
    address payable wallet;
    uint rate;
    uint weiRaised;
    uint startTime;
    uint endTime;

    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint value, uint amount);

    constructor(Token _token, address payable _wallet, uint _rate, uint _startTime, uint _endTime) {
        require(address(_token) != address(0));
        require(_wallet != address(0));
        require(_rate > 0);
        require(_startTime >= block.timestamp);
        require(_endTime > _startTime);

        token = _token;
        wallet = _wallet;
        rate = _rate;
        startTime = _startTime;
        endTime = _endTime;
    }

    modifier validPurchase(address _beneficiary) {
        require(_beneficiary != address(0));
        require(msg.value != 0);
        require(block.timestamp >= startTime);
        require(block.timestamp <= endTime);
        _;
    }

    function buyTokens(address _beneficiary) external payable validPurchase(_beneficiary) {
        uint weiAmount = msg.value;
        weiRaised += weiAmount;

        // Transfer ETH to the fund collection wallet
        wallet.transfer(msg.value);

        // Calculate token amount
        uint tokens = weiAmount * rate;

        // Transfer tokens to beneficiary
        token.transfer(_beneficiary, tokens);
        
        emit TokenPurchase(msg.sender, _beneficiary, weiAmount, tokens);
    }
}