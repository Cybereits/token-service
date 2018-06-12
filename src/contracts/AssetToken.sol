pragma solidity ^0.4.18;

import "KnowYourCustomer.sol";
import "Token.sol";
import "Ownable.sol";

contract KakaCoin is Token, Ownable {
    string public name;
    string public symbol;

    uint public decimals;
    uint public fee = 0;

    KycContract kyc;

    address public migrationMaster = msg.sender;
    address public chargeAddress = msg.sender;

    event Transfer(address indexed from, address indexed to, uint value, uint fee);

    constructor(uint256 total, uint _decimals, string _name, string _symbol, address _kycContract) public {
        decimals = _decimals;
        uint256 multiplier = 10 ** decimals;
        supply = mul(total, multiplier);
        balances[msg.sender] = supply;
        name = _name;
        symbol = _symbol;
        initKyc(_kycContract);
    }

    function initKyc(address _addr) onlyOwner public {
        kyc = KycContract(_addr);
    }

    function changeChargeAddress(address _addr) onlyOwner public {
        chargeAddress = _addr;
    }

    function changeFee(uint256 _fee) onlyOwner public returns (uint256) {
        fee = _fee;
        return fee;
    }

    function transfer(address _to, uint _value) public returns (bool ok) {
        assert(!kyc.isFrozen(_to));
        assert(kyc.isVerified(_to));
        require(_value <= balances[msg.sender]);
        require(balances[_to] < add(balances[_to], _value));

        if (fee != 0 && msg.sender != migrationMaster ) {
            uint256 feeShouldTake = mul(_value, fee) / 10000;
            balances[_to] = add(balanceOf(_to), sub(_value, feeShouldTake));
            balances[chargeAddress] = add(balanceOf(chargeAddress), feeShouldTake);
            balances[msg.sender] = sub(balanceOf(msg.sender), _value);
            emit Transfer(msg.sender, _to, _value, feeShouldTake);
        } else {
            balances[_to] = add(balanceOf(_to), _value);
            balances[msg.sender] = sub(balanceOf(msg.sender), _value);
            emit Transfer(msg.sender, _to, _value, 0);
        }

        return true;
    }

    function transferFrom(address _from, address _to, uint _value) public returns (bool) {
        assert(!kyc.isFrozen(_from) && !kyc.isFrozen(_to));
        assert(kyc.isVerified(_from) && kyc.isVerified(_to));
        assert(balanceOf(_from) >= _value);
        assert(approvals[_from][msg.sender] >= _value);

        if (fee != 0 && _from != migrationMaster ) {
            uint256 feeShouldTake = mul(_value, fee) / 10000;
            balances[_to] = add(balanceOf(_to), sub(_value, feeShouldTake));
            balances[chargeAddress] = add(balanceOf(chargeAddress), feeShouldTake);
            balances[_from] = sub(balanceOf(_from), _value);
            approvals[_from][msg.sender] = sub(approvals[_from][msg.sender], _value);
            emit Transfer(msg.sender, _to, _value, feeShouldTake);
        } else {
            balances[_to] = add(balanceOf(_to), _value);
            balances[_from] = sub(balanceOf(_from), _value);
            approvals[_from][msg.sender] = sub(approvals[_from][msg.sender], _value);
            emit Transfer(_from, _to, _value, 0);
        }

        return true;
    }
}
