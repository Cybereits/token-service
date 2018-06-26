pragma solidity ^0.4.6;

import "Ownable.sol";

contract KnowYourCustomer is Ownable {

    string public name;

    mapping(address => int8) internal kycs;
    mapping(address => uint256) internal balances;

    event RequestKyc(address addr, uint256 value);
    event Freeze(address addr);

    constructor(string _name) public {
        name = _name;
        kycs[msg.sender] = 1;
    }

    function requestKyc(address _to, uint256 _value) public {
        require(kycs[_to] >= 0);
        if(balances[_to] == 0){
            balances[_to] = _value;
            emit RequestKyc(_to, _value);
        } else {
            emit RequestKyc(_to, balances[_to]);
        }
    }

    function balanceOf() public view returns (uint256 balance) {
        // 用户需要查询自己的钱包账户 并回填到 KYC 网站
        return balances[msg.sender];
    }

    function queryBalance(address addr) public view onlyOwner returns (uint256 balance) {
        return balances[addr];
    }

    function verify(address addr) public onlyOwner {
        kycs[addr] = 1;
        balances[addr] = 0;
    }

    function freeze(address addr) public onlyOwner {
        kycs[addr] = -1;
        emit Freeze(addr);
    }

    function isVerified(address addr) public view returns(bool) {
        return kycs[addr] > 0;
    }

    function kill() public onlyOwner {
        selfdestruct(owner);
    }
}
