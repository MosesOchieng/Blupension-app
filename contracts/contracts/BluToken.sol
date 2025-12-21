// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract BluToken is ERC20, ERC20Burnable, AccessControl, Pausable, ERC20Permit {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Token distribution
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens with 18 decimals
    uint256 public constant PENSION_INCENTIVES = TOTAL_SUPPLY * 40 / 100;
    uint256 public constant ECOSYSTEM_DEV = TOTAL_SUPPLY * 20 / 100;
    uint256 public constant STAKING_REWARDS = TOTAL_SUPPLY * 15 / 100;
    uint256 public constant TEAM_ADVISORS = TOTAL_SUPPLY * 15 / 100;
    uint256 public constant PUBLIC_SALE = TOTAL_SUPPLY * 10 / 100;
    
    // Staking variables
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;
    uint256 public constant STAKING_REWARD_RATE = 5; // 5% annual reward rate
    uint256 public constant STAKING_PERIOD = 365 days;
    
    // Governance variables
    mapping(address => uint256) public votingPower;
    uint256 public constant VOTING_POWER_THRESHOLD = 1000 * 10**18; // 1000 BLU tokens
    
    // Events
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event TokensBurned(uint256 amount);
    
    constructor() ERC20("Blu Token", "BLU") ERC20Permit("Blu Token") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        // Initial token distribution
        _mint(msg.sender, PENSION_INCENTIVES);
        _mint(msg.sender, ECOSYSTEM_DEV);
        _mint(msg.sender, STAKING_REWARDS);
        _mint(msg.sender, TEAM_ADVISORS);
        _mint(msg.sender, PUBLIC_SALE);
    }
    
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) public override onlyRole(BURNER_ROLE) {
        _burn(msg.sender, amount);
        emit TokensBurned(amount);
    }
    
    function stake(uint256 amount) public whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        emit TokensStaked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) public whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        require(block.timestamp >= stakingTimestamp[msg.sender] + STAKING_PERIOD, "Staking period not completed");
        
        stakedBalance[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
        
        emit TokensUnstaked(msg.sender, amount);
    }
    
    function claimRewards() public whenNotPaused {
        require(stakedBalance[msg.sender] > 0, "No staked tokens");
        uint256 stakingDuration = block.timestamp - stakingTimestamp[msg.sender];
        uint256 rewards = calculateRewards(msg.sender, stakingDuration);
        
        require(rewards > 0, "No rewards available");
        _mint(msg.sender, rewards);
        stakingTimestamp[msg.sender] = block.timestamp;
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    function calculateRewards(address user, uint256 duration) public view returns (uint256) {
        uint256 stakedAmount = stakedBalance[user];
        uint256 rewardRate = STAKING_REWARD_RATE * 10**18 / 100;
        return (stakedAmount * rewardRate * duration) / (STAKING_PERIOD * 10**18);
    }
    
    function updateVotingPower(address user) public {
        votingPower[user] = balanceOf(user) + stakedBalance[user];
    }
    
    function canVote(address user) public view returns (bool) {
        return votingPower[user] >= VOTING_POWER_THRESHOLD;
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
} 