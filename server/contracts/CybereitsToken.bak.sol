pragma solidity ^0.4.18;

library SafeMath {
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract CybereitsToken {

  using SafeMath for uint256;

  string public name = "Cybereits Token";
  string public symbol = "CRE";
  uint public decimals;

  // 团队锁仓合约地址
  address public teamLockAddr;

  uint256                                             supply;
  mapping(address => uint256)                         balances;
  mapping (address => mapping (address => uint256))   approvals;

  function CybereitsToken(
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
      var multiplier = 10 ** decimals;
      // 发行总量
      supply = total * multiplier;
      var teamLockAmount = _teamLockPercent * supply / 100;
      // 创建团队锁仓合约
      teamLockAddr = new CybereitsTeamLock(
        teamLockAmount,
        _teamAddr1,
        _teamAddr2,
        _teamAddr3,
        _teamAddr4,
        _teamAddr5,
        _teamAddr6,
        this
      );
      // 团队代币锁定地址
      balances[teamLockAddr] = teamLockAmount;
      // 锁仓之外剩余所有代币
      balances[msg.sender] = supply - teamLockAmount;
  }

  function balanceOf(address owner) public constant returns (uint256 balance) {
    return balances[owner];
  }

  function allowance(address owner, address spender) public constant returns (uint256) {
    return approvals[owner][spender];
  }

  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[msg.sender]);
    require(balances[_to] < balances[_to].add(_value));

    // SafeMath.sub will throw if there is not enough balance.
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  function transferFrom(address from, address to, uint256 value) public returns (bool) {

        assert(balances[from] >= value);
        assert(approvals[from][msg.sender] >= value);
        
        approvals[from][msg.sender] = approvals[from][msg.sender].sub(value);
        balances[from] = balances[from].sub(value);
        balances[to] = balances[to].add(value);
        
        Transfer(from, to, value);
        return true;
  }

  function approve(address spender, uint256 value) public returns (bool) {
        approvals[msg.sender][spender] = value;
        Approval(msg.sender, spender, value);
        return true;
  }

  function totalSupply() public constant returns (uint) {
    return supply;
  }

  event Transfer(address from, address to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract CybereitsTeamLock {

    mapping (address => uint256) public allocations;
    mapping (address => uint256) public frozen;

    CybereitsToken public cre;

    function CybereitsTeamLock(
      uint256 lockAmount,
      address _teamAddr1,
      address _teamAddr2,
      address _teamAddr3,
      address _teamAddr4,
      address _teamAddr5,
      address _teamAddr6,
      CybereitsToken _cre
    ) public
    {
        cre = _cre;
        allocations[_teamAddr1] = lockAmount / 6;
        frozen[_teamAddr1] = now; // 6 * 30 days;
        allocations[_teamAddr2] = lockAmount / 6;
        frozen[_teamAddr2] = now + 10 minutes; // 12 * 30 days;
        allocations[_teamAddr3] = lockAmount / 6;
        frozen[_teamAddr3] = now + 15 minutes; // 18 * 30 days;
        allocations[_teamAddr4] = lockAmount / 6;
        frozen[_teamAddr4] = now + 20 minutes; // 24 * 30 days;
        allocations[_teamAddr5] = lockAmount / 6;
        frozen[_teamAddr5] = now + 25 minutes; // 30 * 30 days;
        allocations[_teamAddr6] = lockAmount / 6;
        frozen[_teamAddr6] = now + 30 minutes; // 36 * 30 days;
    }

    function unlock(address unlockAddr) public returns (uint256) {
        require(allocations[unlockAddr] != 0);
        require(now >= frozen[unlockAddr]);

        var amount = allocations[unlockAddr];
        allocations[unlockAddr] = 0;
        cre.transfer(unlockAddr, amount);
        Unlock(unlockAddr, amount);
        return cre.balanceOf(this);
    }

    event Unlock(address to, uint amount);
}
