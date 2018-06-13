pragma solidity ^0.4.18;

import "Token.sol";
import "Ownable.sol";

contract CybereitsToken is Token, Ownable {
    string public name = "Cybereits Token";
    string public symbol = "CRE";
    uint public decimals;

    address public teamLockAddr;

    constructor(
        uint256 total,
        uint256 _decimals,
        uint256 _teamLockPercent,
        address _teamAddr1,
        address _teamAddr2,
        address _teamAddr3,
        address _teamAddr4,
        address _teamAddr5,
        address _teamAddr6
    ) public
    {
        decimals = _decimals;
        uint256 multiplier = 10 ** decimals;
        supply = total * multiplier;
        uint256 teamLockAmount = _teamLockPercent * supply / 100;
        teamLockAddr = new CybereitsTeamLock(
        teamLockAmount,
        _teamAddr1,
        _teamAddr2,
        _teamAddr3,
        _teamAddr4,
        _teamAddr5,
        _teamAddr6
        );
        balances[teamLockAddr] = teamLockAmount;
        balances[msg.sender] = supply - teamLockAmount;
    }
}

contract CybereitsTeamLock {

    event Unlock(address from, uint amount);

    mapping (address => uint256) allocations;
    mapping (address => uint256) frozen;

    CybereitsToken cre;

    constructor(
        uint256 lockAmount,
        address _teamAddr1,
        address _teamAddr2,
        address _teamAddr3,
        address _teamAddr4,
        address _teamAddr5,
        address _teamAddr6
    ) public
    {
        cre = CybereitsToken(msg.sender);
        allocations[_teamAddr1] = lockAmount / 6;
        frozen[_teamAddr1] = now + 6 * 30 days;
        allocations[_teamAddr2] = lockAmount / 6;
        frozen[_teamAddr2] = now + 12 * 30 days;
        allocations[_teamAddr3] = lockAmount / 6;
        frozen[_teamAddr3] = now + 18 * 30 days;
        allocations[_teamAddr4] = lockAmount / 6;
        frozen[_teamAddr4] = now + 24 * 30 days;
        allocations[_teamAddr5] = lockAmount / 6;
        frozen[_teamAddr5] = now + 30 * 30 days;
        allocations[_teamAddr6] = lockAmount / 6;
        frozen[_teamAddr6] = now + 36 * 30 days;
    }

    function unlock(address unlockAddr) external returns (bool) {
        require(allocations[unlockAddr] != 0);
        require(now >= frozen[unlockAddr]);

        uint256 amount = allocations[unlockAddr];
        assert(cre.transfer(unlockAddr, amount));
        allocations[unlockAddr] = 0;
        emit Unlock(unlockAddr, amount);
        return true;
    }
}
