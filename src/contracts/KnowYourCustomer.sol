pragma solidity ^0.4.6;

import "SafeMath.sol";

contract KycContract is SafeMath {

    address public owner = msg.sender;
    string public name;
    string public symbol;
    uint256 public constant DECIMALS = 9;
    uint256 public totalSupply;

    struct Kyc {
        bytes hash;
        uint token;
        bool verify;
        uint verifyAt;
    }

    struct Fzn {
        bytes hash;
        bool frozen;
        uint frozenAt;
    }

    mapping(address => Kyc) internal kycs;
    mapping(address => Fzn) internal fzns;

    mapping (address => uint256) public balances;

    event RequestKyc(int _ret, address indexed _to, uint256 _value, bytes _hash);
    event Frozen(int _value);
    event Verify(int _value);

    constructor(uint256 initSupply, string tokenName, string tokenSymbol) public {
        name = tokenName; // 名称
        symbol = tokenSymbol; // 符号
        totalSupply = initSupply * (10 ** DECIMALS);
        balances[msg.sender] = initSupply * (10 ** DECIMALS);

        kycs[owner] = Kyc({
            hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
            token: totalSupply,
            verify: true,
            verifyAt: now
        });
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function totalSupply() public view returns (uint256 _totalSupply) {
        return totalSupply;
    }

    function sendToken (address _to, uint256 _value) public payable {
        if (msg.sender == owner) {
            if (kycs[_to].hash.length > 0) {
                emit RequestKyc(-1, _to, _value, msg.data);
            } else {
                if (balanceOf(msg.sender) < _value) {
                    emit RequestKyc(-2, _to, _value, msg.data);
                } else {
                    kycs[_to] = Kyc({
                        hash: msg.data,
                        token: _value,
                        verify: false,
                        verifyAt: now
                    });
                    balances[_to] = add(balanceOf(_to), _value);
                    balances[msg.sender] = sub(balanceOf(msg.sender), _value);
                    emit RequestKyc(1, _to, _value, msg.data);
                }
            }
        } else {
            emit RequestKyc(-3, _to, _value, msg.data);
        }
    }

    function increaseToken (uint256 _value) public {
        assert(msg.sender == owner);
        totalSupply = add(totalSupply, _value);
        balances[msg.sender] = add(balances[msg.sender], _value);
    }

    function verify(address addr, uint256 _value) public payable {
        if (msg.sender == owner) {
            if (kycs[addr].hash.length == 0) {
                emit Verify(-1);
            } else {
                if (balanceOf(addr) == _value) {
                    emit Verify(1);
                    kycs[addr].verify = true;
                    kycs[addr].verifyAt = now;
                } else {
                    emit Verify(-2);
                }
            }
        } else {
            emit Verify(0);
        }
    }

    function freeze(address addr) public payable {
        if (msg.sender == owner) {
            fzns[addr] = Fzn({
                hash: msg.data,
                frozen: true,
                frozenAt: now
            });

            if (kycs[addr].verify) {
                kycs[addr].verify = false;
                kycs[addr].verifyAt = now;
                emit Frozen(2);
            } else {
                emit Frozen(1);
            }
        } else {
            emit Frozen(0);
        }
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function isFrozen(address addr) public view returns(bool) {
        return fzns[addr].frozen;
    }

    function isVerified(address addr) public view returns(bool) {
        if (kycs[addr].hash.length == 0) {
            return false;
        } else {
            return kycs[addr].verify;
        }
    }

    function getVerifiedHash(address _addr) public view returns(bytes) {
        return kycs[_addr].hash;
    }

    function getFrozenHash(address _addr) public view returns(bytes) {
        return fzns[_addr].hash;
    }

    function getVerifyAt(address _addr) public view returns(uint verifyAt) {
        return kycs[_addr].verifyAt;
    }

    function getFrozenAt(address _addr) public view returns(uint verifyAt) {
        return fzns[_addr].frozenAt;
    }

    function kill() public {
        assert(msg.sender == owner);
        selfdestruct(owner);
    }
}
