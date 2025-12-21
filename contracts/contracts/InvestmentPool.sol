// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./BluToken.sol";
import "./PriceOracle.sol";

contract InvestmentPool is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant REBALANCER_ROLE = keccak256("REBALANCER_ROLE");
    bytes32 public constant YIELD_FARMER_ROLE = keccak256("YIELD_FARMER_ROLE");

    // Core contracts
    BluToken public bluToken;
    PriceOracle public priceOracle;

    // Pool state
    uint256 public totalPoolValue;
    uint256 public totalShares;
    uint256 public lastRebalanceTime;
    uint256 public rebalanceThreshold = 500; // 5% threshold for rebalancing

    // Asset management
    struct Asset {
        address token;
        uint256 balance;
        uint256 targetAllocation; // Basis points (10000 = 100%)
        uint256 currentAllocation; // Basis points
        bool isActive;
        uint256 minAmount;
        uint256 maxAmount;
    }

    mapping(address => Asset) public assets;
    address[] public assetList;

    // User positions
    struct UserPosition {
        uint256 shares;
        uint256 lastDepositTime;
        uint256 lastWithdrawalTime;
        uint256 totalDeposited;
        uint256 totalWithdrawn;
    }

    mapping(address => UserPosition) public userPositions;

    // Yield farming
    struct YieldFarm {
        address protocol;
        address token;
        uint256 stakedAmount;
        uint256 rewardsEarned;
        bool isActive;
    }

    mapping(address => YieldFarm) public yieldFarms;
    address[] public yieldFarmList;

    // Events
    event AssetAdded(address indexed token, uint256 targetAllocation);
    event AssetRemoved(address indexed token);
    event AssetAllocationUpdated(address indexed token, uint256 newAllocation);
    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdrawal(address indexed user, uint256 shares, uint256 amount);
    event RebalanceExecuted(uint256 timestamp, uint256 totalValue);
    event YieldFarmingStarted(address indexed protocol, address indexed token, uint256 amount);
    event YieldFarmingStopped(address indexed protocol, address indexed token, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _bluToken, address _priceOracle) {
        bluToken = BluToken(_bluToken);
        priceOracle = PriceOracle(_priceOracle);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        _grantRole(REBALANCER_ROLE, msg.sender);
        _grantRole(YIELD_FARMER_ROLE, msg.sender);
    }

    // Asset Management Functions
    function addAsset(
        address _token,
        uint256 _targetAllocation,
        uint256 _minAmount,
        uint256 _maxAmount
    ) external onlyRole(MANAGER_ROLE) {
        require(_token != address(0), "Invalid token address");
        require(_targetAllocation <= 10000, "Allocation exceeds 100%");
        require(!assets[_token].isActive, "Asset already exists");

        assets[_token] = Asset({
            token: _token,
            balance: 0,
            targetAllocation: _targetAllocation,
            currentAllocation: 0,
            isActive: true,
            minAmount: _minAmount,
            maxAmount: _maxAmount
        });

        assetList.push(_token);
        emit AssetAdded(_token, _targetAllocation);
    }

    function removeAsset(address _token) external onlyRole(MANAGER_ROLE) {
        require(assets[_token].isActive, "Asset not found");
        require(assets[_token].balance == 0, "Asset has balance");

        assets[_token].isActive = false;
        
        // Remove from asset list
        for (uint i = 0; i < assetList.length; i++) {
            if (assetList[i] == _token) {
                assetList[i] = assetList[assetList.length - 1];
                assetList.pop();
                break;
            }
        }

        emit AssetRemoved(_token);
    }

    function updateAssetAllocation(
        address _token,
        uint256 _newAllocation
    ) external onlyRole(MANAGER_ROLE) {
        require(assets[_token].isActive, "Asset not found");
        require(_newAllocation <= 10000, "Allocation exceeds 100%");

        assets[_token].targetAllocation = _newAllocation;
        emit AssetAllocationUpdated(_token, _newAllocation);
    }

    // Deposit and Withdrawal Functions
    function deposit(uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(bluToken.balanceOf(msg.sender) >= _amount, "Insufficient balance");

        // Transfer BLU tokens from user
        bluToken.safeTransferFrom(msg.sender, address(this), _amount);

        // Calculate shares to mint
        uint256 sharesToMint;
        if (totalShares == 0) {
            sharesToMint = _amount;
        } else {
            sharesToMint = _amount.mul(totalShares).div(totalPoolValue);
        }

        // Update user position
        UserPosition storage position = userPositions[msg.sender];
        position.shares = position.shares.add(sharesToMint);
        position.lastDepositTime = block.timestamp;
        position.totalDeposited = position.totalDeposited.add(_amount);

        // Update pool state
        totalShares = totalShares.add(sharesToMint);
        totalPoolValue = totalPoolValue.add(_amount);

        // Update asset balance
        assets[address(bluToken)].balance = assets[address(bluToken)].balance.add(_amount);

        emit Deposit(msg.sender, _amount, sharesToMint);
    }

    function withdraw(uint256 _shares) external nonReentrant whenNotPaused {
        require(_shares > 0, "Shares must be greater than 0");
        
        UserPosition storage position = userPositions[msg.sender];
        require(position.shares >= _shares, "Insufficient shares");

        // Calculate withdrawal amount
        uint256 withdrawalAmount = _shares.mul(totalPoolValue).div(totalShares);

        // Update user position
        position.shares = position.shares.sub(_shares);
        position.lastWithdrawalTime = block.timestamp;
        position.totalWithdrawn = position.totalWithdrawn.add(withdrawalAmount);

        // Update pool state
        totalShares = totalShares.sub(_shares);
        totalPoolValue = totalPoolValue.sub(withdrawalAmount);

        // Update asset balance
        assets[address(bluToken)].balance = assets[address(bluToken)].balance.sub(withdrawalAmount);

        // Transfer BLU tokens to user
        bluToken.safeTransfer(msg.sender, withdrawalAmount);

        emit Withdrawal(msg.sender, _shares, withdrawalAmount);
    }

    // Rebalancing Functions
    function checkRebalanceNeeded() public view returns (bool) {
        for (uint i = 0; i < assetList.length; i++) {
            address token = assetList[i];
            Asset storage asset = assets[token];
            
            if (asset.isActive) {
                uint256 currentAllocation = calculateCurrentAllocation(token);
                uint256 difference = currentAllocation > asset.targetAllocation ? 
                    currentAllocation.sub(asset.targetAllocation) : 
                    asset.targetAllocation.sub(currentAllocation);
                
                if (difference > rebalanceThreshold) {
                    return true;
                }
            }
        }
        return false;
    }

    function executeRebalance() external onlyRole(REBALANCER_ROLE) whenNotPaused {
        require(checkRebalanceNeeded(), "Rebalance not needed");

        // Calculate current allocations
        updateCurrentAllocations();

        // Execute rebalancing trades
        for (uint i = 0; i < assetList.length; i++) {
            address token = assetList[i];
            Asset storage asset = assets[token];
            
            if (asset.isActive) {
                uint256 targetValue = totalPoolValue.mul(asset.targetAllocation).div(10000);
                uint256 currentValue = getAssetValue(token);
                
                if (currentValue > targetValue) {
                    // Sell excess
                    uint256 excessAmount = currentValue.sub(targetValue);
                    executeTrade(token, address(bluToken), excessAmount, false);
                } else if (targetValue > currentValue) {
                    // Buy more
                    uint256 deficitAmount = targetValue.sub(currentValue);
                    executeTrade(address(bluToken), token, deficitAmount, true);
                }
            }
        }

        lastRebalanceTime = block.timestamp;
        emit RebalanceExecuted(block.timestamp, totalPoolValue);
    }

    function updateCurrentAllocations() internal {
        for (uint i = 0; i < assetList.length; i++) {
            address token = assetList[i];
            if (assets[token].isActive) {
                assets[token].currentAllocation = calculateCurrentAllocation(token);
            }
        }
    }

    function calculateCurrentAllocation(address _token) public view returns (uint256) {
        if (totalPoolValue == 0) return 0;
        uint256 assetValue = getAssetValue(_token);
        return assetValue.mul(10000).div(totalPoolValue);
    }

    function getAssetValue(address _token) public view returns (uint256) {
        Asset storage asset = assets[_token];
        if (!asset.isActive) return 0;
        
        uint256 price = priceOracle.getPrice(_token);
        return asset.balance.mul(price).div(10**18);
    }

    // Yield Farming Functions
    function startYieldFarming(
        address _protocol,
        address _token,
        uint256 _amount
    ) external onlyRole(YIELD_FARMER_ROLE) whenNotPaused {
        require(assets[_token].isActive, "Asset not found");
        require(assets[_token].balance >= _amount, "Insufficient balance");

        // Create or update yield farm
        if (!yieldFarms[_protocol].isActive) {
            yieldFarms[_protocol] = YieldFarm({
                protocol: _protocol,
                token: _token,
                stakedAmount: _amount,
                rewardsEarned: 0,
                isActive: true
            });
            yieldFarmList.push(_protocol);
        } else {
            yieldFarms[_protocol].stakedAmount = yieldFarms[_protocol].stakedAmount.add(_amount);
        }

        // Transfer tokens to protocol
        IERC20(_token).safeTransfer(_protocol, _amount);
        assets[_token].balance = assets[_token].balance.sub(_amount);

        emit YieldFarmingStarted(_protocol, _token, _amount);
    }

    function stopYieldFarming(
        address _protocol,
        uint256 _amount
    ) external onlyRole(YIELD_FARMER_ROLE) whenNotPaused {
        require(yieldFarms[_protocol].isActive, "Yield farm not found");
        require(yieldFarms[_protocol].stakedAmount >= _amount, "Insufficient staked amount");

        // Withdraw from protocol (simplified - in reality would call protocol's withdraw function)
        address token = yieldFarms[_protocol].token;
        IERC20(token).safeTransferFrom(_protocol, address(this), _amount);

        // Update yield farm
        yieldFarms[_protocol].stakedAmount = yieldFarms[_protocol].stakedAmount.sub(_amount);
        if (yieldFarms[_protocol].stakedAmount == 0) {
            yieldFarms[_protocol].isActive = false;
        }

        // Update asset balance
        assets[token].balance = assets[token].balance.add(_amount);

        emit YieldFarmingStopped(_protocol, token, _amount);
    }

    function claimRewards(address _protocol) external onlyRole(YIELD_FARMER_ROLE) {
        require(yieldFarms[_protocol].isActive, "Yield farm not found");
        
        // Calculate and claim rewards (simplified)
        uint256 rewards = calculateRewards(_protocol);
        if (rewards > 0) {
            yieldFarms[_protocol].rewardsEarned = yieldFarms[_protocol].rewardsEarned.add(rewards);
            bluToken.mint(msg.sender, rewards);
            
            emit RewardsClaimed(msg.sender, rewards);
        }
    }

    function calculateRewards(address _protocol) public view returns (uint256) {
        // Simplified reward calculation
        // In reality, this would query the specific protocol's reward contract
        return yieldFarms[_protocol].stakedAmount.mul(5).div(100); // 5% APY
    }

    // Internal Functions
    function executeTrade(
        address _fromToken,
        address _toToken,
        uint256 _amount,
        bool _isBuy
    ) internal {
        // Simplified trade execution
        // In reality, this would integrate with DEX like Uniswap
        
        if (_isBuy) {
            assets[_fromToken].balance = assets[_fromToken].balance.sub(_amount);
            assets[_toToken].balance = assets[_toToken].balance.add(_amount);
        } else {
            assets[_fromToken].balance = assets[_fromToken].balance.add(_amount);
            assets[_toToken].balance = assets[_toToken].balance.sub(_amount);
        }
    }

    // View Functions
    function getUserPosition(address _user) external view returns (UserPosition memory) {
        return userPositions[_user];
    }

    function getAssetList() external view returns (address[] memory) {
        return assetList;
    }

    function getYieldFarmList() external view returns (address[] memory) {
        return yieldFarmList;
    }

    function getPoolStats() external view returns (
        uint256 _totalPoolValue,
        uint256 _totalShares,
        uint256 _lastRebalanceTime,
        bool _rebalanceNeeded
    ) {
        return (
            totalPoolValue,
            totalShares,
            lastRebalanceTime,
            checkRebalanceNeeded()
        );
    }

    // Admin Functions
    function setRebalanceThreshold(uint256 _threshold) external onlyRole(MANAGER_ROLE) {
        require(_threshold <= 1000, "Threshold too high"); // Max 10%
        rebalanceThreshold = _threshold;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function emergencyWithdraw(address _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(msg.sender, balance);
    }
} 