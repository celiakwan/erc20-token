// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Token.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract TokenCrowdsale {
    using SafeMath for uint256;

    Token public token;
    address payable public wallet;
    uint256 public rate;
    uint256 public weiRaised;
    uint256 public startTime;
    uint256 public endTime;

    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

    constructor(Token _token, address payable _wallet, uint256 _rate, uint256 _startTime, uint256 _endTime) public {
        require(address(_token) != address(0));
        require(_wallet != address(0));
        require(_rate > 0);
        require(_startTime >= now);
        require(_endTime > _startTime);

        token = _token;
        wallet = _wallet;
        rate = _rate;
        startTime = _startTime;
        endTime = _endTime;
    }

    modifier purchaseValid(address _beneficiary) {
        require(_beneficiary != address(0));
        require(msg.value != 0);
        require(now >= startTime);
        require(now <= endTime);
        _;
    }

    function buyTokens(address _beneficiary) public payable purchaseValid(_beneficiary) {
        uint256 weiAmount = msg.value;

        weiRaised = weiRaised.add(weiAmount);

        // Calculate token amount
        uint256 tokens = weiAmount.mul(rate);

        // Transfer tokens to beneficiary
        token.transfer(_beneficiary, tokens);
        emit TokenPurchase(msg.sender, _beneficiary, weiAmount, tokens);

        _forwardFunds();
    }

    function _forwardFunds() private {
        // Transfer ETH to the fund collection wallet
        wallet.transfer(msg.value);
    }
}