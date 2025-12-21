// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceOracle is AccessControl, Pausable {
    bytes32 public constant ORACLE_MANAGER_ROLE = keccak256("ORACLE_MANAGER_ROLE");
    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");

    // Price feed mapping
    mapping(address => address) public priceFeeds; // token => Chainlink aggregator
    mapping(address => uint256) public prices; // token => price (8 decimals)
    mapping(address => uint256) public lastUpdateTime; // token => timestamp
    mapping(address => uint256) public heartbeat; // token => heartbeat interval

    // Fallback price sources
    mapping(address => uint256) public fallbackPrices;
    mapping(address => bool) public useFallback;

    // Supported tokens
    address[] public supportedTokens;

    // Events
    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);
    event PriceFeedAdded(address indexed token, address indexed aggregator);
    event PriceFeedRemoved(address indexed token);
    event FallbackPriceSet(address indexed token, uint256 price);
    event HeartbeatUpdated(address indexed token, uint256 heartbeat);

    // Constants
    uint256 public constant PRICE_DECIMALS = 8;
    uint256 public constant DEFAULT_HEARTBEAT = 3600; // 1 hour
    uint256 public constant MAX_HEARTBEAT = 86400; // 24 hours

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_MANAGER_ROLE, msg.sender);
        _grantRole(PRICE_UPDATER_ROLE, msg.sender);
    }

    // Price Feed Management
    function addPriceFeed(
        address _token,
        address _aggregator,
        uint256 _heartbeat
    ) external onlyRole(ORACLE_MANAGER_ROLE) {
        require(_token != address(0), "Invalid token address");
        require(_aggregator != address(0), "Invalid aggregator address");
        require(_heartbeat <= MAX_HEARTBEAT, "Heartbeat too high");

        priceFeeds[_token] = _aggregator;
        heartbeat[_token] = _heartbeat;
        
        // Add to supported tokens if not already present
        bool exists = false;
        for (uint i = 0; i < supportedTokens.length; i++) {
            if (supportedTokens[i] == _token) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            supportedTokens.push(_token);
        }

        // Initialize price
        _updatePrice(_token);

        emit PriceFeedAdded(_token, _aggregator);
        emit HeartbeatUpdated(_token, _heartbeat);
    }

    function removePriceFeed(address _token) external onlyRole(ORACLE_MANAGER_ROLE) {
        require(priceFeeds[_token] != address(0), "Price feed not found");

        priceFeeds[_token] = address(0);
        heartbeat[_token] = 0;

        // Remove from supported tokens
        for (uint i = 0; i < supportedTokens.length; i++) {
            if (supportedTokens[i] == _token) {
                supportedTokens[i] = supportedTokens[supportedTokens.length - 1];
                supportedTokens.pop();
                break;
            }
        }

        emit PriceFeedRemoved(_token);
    }

    function setFallbackPrice(
        address _token,
        uint256 _price
    ) external onlyRole(ORACLE_MANAGER_ROLE) {
        fallbackPrices[_token] = _price;
        useFallback[_token] = true;
        emit FallbackPriceSet(_token, _price);
    }

    function disableFallback(address _token) external onlyRole(ORACLE_MANAGER_ROLE) {
        useFallback[_token] = false;
    }

    // Price Update Functions
    function updatePrice(address _token) external onlyRole(PRICE_UPDATER_ROLE) {
        _updatePrice(_token);
    }

    function updateAllPrices() external onlyRole(PRICE_UPDATER_ROLE) {
        for (uint i = 0; i < supportedTokens.length; i++) {
            _updatePrice(supportedTokens[i]);
        }
    }

    function _updatePrice(address _token) internal {
        address aggregator = priceFeeds[_token];
        
        if (aggregator != address(0)) {
            try AggregatorV3Interface(aggregator).latestRoundData() returns (
                uint80 roundId,
                int256 price,
                uint256 startedAt,
                uint256 updatedAt,
                uint80 answeredInRound
            ) {
                // Check if price is stale
                if (block.timestamp - updatedAt <= heartbeat[_token]) {
                    prices[_token] = uint256(price);
                    lastUpdateTime[_token] = updatedAt;
                    emit PriceUpdated(_token, uint256(price), updatedAt);
                } else {
                    // Price is stale, use fallback if available
                    if (useFallback[_token]) {
                        prices[_token] = fallbackPrices[_token];
                        lastUpdateTime[_token] = block.timestamp;
                        emit PriceUpdated(_token, fallbackPrices[_token], block.timestamp);
                    }
                }
            } catch {
                // Chainlink call failed, use fallback if available
                if (useFallback[_token]) {
                    prices[_token] = fallbackPrices[_token];
                    lastUpdateTime[_token] = block.timestamp;
                    emit PriceUpdated(_token, fallbackPrices[_token], block.timestamp);
                }
            }
        } else if (useFallback[_token]) {
            // No price feed, use fallback
            prices[_token] = fallbackPrices[_token];
            lastUpdateTime[_token] = block.timestamp;
            emit PriceUpdated(_token, fallbackPrices[_token], block.timestamp);
        }
    }

    // Price Retrieval Functions
    function getPrice(address _token) external view returns (uint256) {
        require(prices[_token] > 0, "Price not available");
        return prices[_token];
    }

    function getPriceWithTimestamp(address _token) external view returns (uint256 price, uint256 timestamp) {
        require(prices[_token] > 0, "Price not available");
        return (prices[_token], lastUpdateTime[_token]);
    }

    function getPrices(address[] calldata _tokens) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](_tokens.length);
        for (uint i = 0; i < _tokens.length; i++) {
            result[i] = prices[_tokens[i]];
        }
        return result;
    }

    function isPriceStale(address _token) external view returns (bool) {
        if (lastUpdateTime[_token] == 0) return true;
        return block.timestamp - lastUpdateTime[_token] > heartbeat[_token];
    }

    // Price Conversion Functions
    function convertPrice(
        address _fromToken,
        address _toToken,
        uint256 _amount
    ) external view returns (uint256) {
        require(prices[_fromToken] > 0, "From token price not available");
        require(prices[_toToken] > 0, "To token price not available");

        // Convert amount using price ratio
        return _amount.mul(prices[_fromToken]).div(prices[_toToken]);
    }

    function getTokenValueInUSD(
        address _token,
        uint256 _amount
    ) external view returns (uint256) {
        require(prices[_token] > 0, "Token price not available");
        
        // Assuming USD price feed is at index 0 or has a specific address
        // This is a simplified version - in reality you'd have a USD price feed
        return _amount.mul(prices[_token]).div(10**PRICE_DECIMALS);
    }

    // Batch Operations
    function batchUpdatePrices(address[] calldata _tokens) external onlyRole(PRICE_UPDATER_ROLE) {
        for (uint i = 0; i < _tokens.length; i++) {
            _updatePrice(_tokens[i]);
        }
    }

    function batchGetPrices(address[] calldata _tokens) external view returns (
        uint256[] memory pricesArray,
        uint256[] memory timestamps
    ) {
        pricesArray = new uint256[](_tokens.length);
        timestamps = new uint256[](_tokens.length);
        
        for (uint i = 0; i < _tokens.length; i++) {
            pricesArray[i] = prices[_tokens[i]];
            timestamps[i] = lastUpdateTime[_tokens[i]];
        }
    }

    // View Functions
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    function getPriceFeedInfo(address _token) external view returns (
        address aggregator,
        uint256 currentPrice,
        uint256 lastUpdate,
        uint256 heartbeatInterval,
        bool isStale,
        bool hasFallback
    ) {
        aggregator = priceFeeds[_token];
        currentPrice = prices[_token];
        lastUpdate = lastUpdateTime[_token];
        heartbeatInterval = heartbeat[_token];
        isStale = block.timestamp - lastUpdate > heartbeatInterval;
        hasFallback = useFallback[_token];
    }

    // Admin Functions
    function setHeartbeat(address _token, uint256 _heartbeat) external onlyRole(ORACLE_MANAGER_ROLE) {
        require(_heartbeat <= MAX_HEARTBEAT, "Heartbeat too high");
        heartbeat[_token] = _heartbeat;
        emit HeartbeatUpdated(_token, _heartbeat);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // Emergency Functions
    function emergencySetPrice(
        address _token,
        uint256 _price
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        prices[_token] = _price;
        lastUpdateTime[_token] = block.timestamp;
        emit PriceUpdated(_token, _price, block.timestamp);
    }

    // Utility Functions
    function getTokenDecimals(address _token) public pure returns (uint8) {
        // This would typically query the token contract
        // For now, return common decimals
        if (_token == address(0)) return 18; // ETH
        return 18; // Most ERC20 tokens
    }

    function calculatePriceImpact(
        address _token,
        uint256 _amount
    ) external view returns (uint256) {
        // Simplified price impact calculation
        // In reality, this would query DEX liquidity pools
        return _amount.mul(100).div(1000000); // 0.01% impact per $1M
    }
} 