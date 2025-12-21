// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract BlupensionToken is ERC20, Ownable, Pausable {
    // Mapping to track user contributions
    mapping(address => uint256) public contributions;
    mapping(address => uint256) public lastContributionTime;
    
    // Contribution limits
    uint256 public constant MIN_CONTRIBUTION = 100 * 10**18; // 100 tokens
    uint256 public constant MAX_CONTRIBUTION = 10000 * 10**18; // 10,000 tokens
    
    // Vesting parameters
    uint256 public constant VESTING_PERIOD = 365 days;
    uint256 public constant VESTING_CLIFF = 180 days;
    
    // Events
    event ContributionReceived(address indexed user, uint256 amount);
    event TokensVested(address indexed user, uint256 amount);
    event TokensClaimed(address indexed user, uint256 amount);
    
    constructor() ERC20("Blupension Token", "BLUP") {
        // Initial supply of 1 million tokens
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function contribute() external payable whenNotPaused {
        require(msg.value >= MIN_CONTRIBUTION, "Contribution too small");
        require(msg.value <= MAX_CONTRIBUTION, "Contribution too large");
        
        contributions[msg.sender] += msg.value;
        lastContributionTime[msg.sender] = block.timestamp;
        
        emit ContributionReceived(msg.sender, msg.value);
    }
    
    function vestTokens(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        emit TokensVested(msg.sender, amount);
    }
    
    function claimTokens() external whenNotPaused {
        require(contributions[msg.sender] > 0, "No contributions found");
        require(
            block.timestamp >= lastContributionTime[msg.sender] + VESTING_CLIFF,
            "Vesting cliff not reached"
        );
        
        uint256 vestedAmount = calculateVestedAmount(msg.sender);
        require(vestedAmount > 0, "No tokens vested yet");
        
        _transfer(address(this), msg.sender, vestedAmount);
        emit TokensClaimed(msg.sender, vestedAmount);
    }
    
    function calculateVestedAmount(address user) public view returns (uint256) {
        if (block.timestamp < lastContributionTime[user] + VESTING_CLIFF) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - lastContributionTime[user];
        if (timeElapsed >= VESTING_PERIOD) {
            return contributions[user];
        }
        
        return (contributions[user] * timeElapsed) / VESTING_PERIOD;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
} 