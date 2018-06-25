pragma solidity ^0.4.6;

import "Ownable.sol";

contract KnowYourCustomer is Ownable {

    string public name;

    mapping(address => uint256) internal kycs;
    mapping(address => uint256) internal balances;

    event Freeze(address addr);

    constructor(string _name) public {
        name = _name;
        kycs[msg.sender] = now;
    }

    function requestKyc(address _to, uint256 _value) public returns (bool){
        // 排除冻结账户
        require(kycs[_to] > 0);
        if(balances[_to] == 0){
            balances[_to] = _value;
            return true;
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
        kycs[addr] = now;
        balances[addr] = 0;
    }

    function freeze(address addr) public onlyOwner {
        kycs[addr] = 0;
        emit Freeze(addr);
    }

    function isVerified(address addr) public view returns(bool) {
        return kycs[addr] > 0;
    }

    function getVerifyAt(address addr) public view returns(uint256 verifyAt) {
        return kycs[addr];
    }

    function kill() public onlyOwner {
        selfdestruct(owner);
    }
}
