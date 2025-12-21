// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./InvestmentPool.sol";
import "./PriceOracle.sol";

contract RiskManager is AccessControl, Pausable {
    using SafeMath for uint256;

    bytes32 public constant RISK_ANALYST_ROLE = keccak256("RISK_ANALYST_ROLE");
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");

    // Core contracts
    InvestmentPool public investmentPool;
    PriceOracle public priceOracle;

    // Risk parameters
    struct RiskParameters {
        uint256 maxDrawdown; // Maximum allowed drawdown (basis points)
        uint256 volatilityLimit; // Maximum volatility (basis points)
        uint256 concentrationLimit; // Maximum single asset concentration (basis points)
        uint256 correlationLimit; // Maximum correlation between assets
        uint256 leverageLimit; // Maximum leverage ratio
        uint256 liquidityRequirement; // Minimum liquidity requirement
    }

    RiskParameters public riskParams;

    // Risk metrics
    struct RiskMetrics {
        uint256 currentDrawdown;
        uint256 volatility;
        uint256 sharpeRatio;
        uint256 var95; // Value at Risk (95% confidence)
        uint256 maxDrawdown;
        uint256 correlation;
        uint256 liquidityScore;
        uint256 riskScore; // Overall risk score (0-100)
    }

    mapping(address => RiskMetrics) public userRiskMetrics;
    mapping(address => uint256) public lastRiskAssessment;

    // Risk alerts and actions
    struct RiskAlert {
        uint256 alertId;
        address user;
        string alertType;
        uint256 severity; // 1-5 scale
        uint256 timestamp;
        bool resolved;
        string description;
    }

    RiskAlert[] public riskAlerts;
    mapping(address => uint256[]) public userAlerts;

    // Risk limits and thresholds
    mapping(address => uint256) public userRiskLimits;
    mapping(string => uint256) public globalRiskLimits;

    // Events
    event RiskAssessmentUpdated(address indexed user, uint256 riskScore, uint256 timestamp);
    event RiskAlertCreated(uint256 indexed alertId, address indexed user, string alertType, uint256 severity);
    event RiskAlertResolved(uint256 indexed alertId, address indexed user);
    event RiskLimitExceeded(address indexed user, string limitType, uint256 currentValue, uint256 limit);
    event RiskParametersUpdated(uint256 maxDrawdown, uint256 volatilityLimit, uint256 concentrationLimit);
    event EmergencyActionExecuted(address indexed user, string action, uint256 timestamp);

    constructor(address _investmentPool, address _priceOracle) {
        investmentPool = InvestmentPool(_investmentPool);
        priceOracle = PriceOracle(_priceOracle);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RISK_ANALYST_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER_ROLE, msg.sender);

        // Initialize default risk parameters
        riskParams = RiskParameters({
            maxDrawdown: 2000, // 20%
            volatilityLimit: 3000, // 30%
            concentrationLimit: 2500, // 25%
            correlationLimit: 8000, // 80%
            leverageLimit: 15000, // 150%
            liquidityRequirement: 2000 // 20%
        });
    }

    // Risk Assessment Functions
    function assessUserRisk(address _user) external onlyRole(RISK_ANALYST_ROLE) {
        RiskMetrics memory metrics = calculateRiskMetrics(_user);
        userRiskMetrics[_user] = metrics;
        lastRiskAssessment[_user] = block.timestamp;

        // Check for risk alerts
        checkRiskAlerts(_user, metrics);

        emit RiskAssessmentUpdated(_user, metrics.riskScore, block.timestamp);
    }

    function calculateRiskMetrics(address _user) public view returns (RiskMetrics memory) {
        // Get user position from investment pool
        InvestmentPool.UserPosition memory position = investmentPool.getUserPosition(_user);
        
        if (position.shares == 0) {
            return RiskMetrics({
                currentDrawdown: 0,
                volatility: 0,
                sharpeRatio: 0,
                var95: 0,
                maxDrawdown: 0,
                correlation: 0,
                liquidityScore: 10000, // 100%
                riskScore: 0
            });
        }

        // Calculate various risk metrics
        uint256 drawdown = calculateDrawdown(_user);
        uint256 volatility = calculateVolatility(_user);
        uint256 sharpeRatio = calculateSharpeRatio(_user);
        uint256 var95 = calculateVaR(_user);
        uint256 correlation = calculateCorrelation(_user);
        uint256 liquidityScore = calculateLiquidityScore(_user);

        // Calculate overall risk score (0-100)
        uint256 riskScore = calculateOverallRiskScore(
            drawdown,
            volatility,
            sharpeRatio,
            var95,
            correlation,
            liquidityScore
        );

        return RiskMetrics({
            currentDrawdown: drawdown,
            volatility: volatility,
            sharpeRatio: sharpeRatio,
            var95: var95,
            maxDrawdown: drawdown, // Simplified - would track historical max
            correlation: correlation,
            liquidityScore: liquidityScore,
            riskScore: riskScore
        });
    }

    function calculateDrawdown(address _user) internal view returns (uint256) {
        // Simplified drawdown calculation
        // In reality, this would compare current value to peak value
        InvestmentPool.UserPosition memory position = investmentPool.getUserPosition(_user);
        if (position.totalDeposited == 0) return 0;
        
        uint256 currentValue = position.shares.mul(investmentPool.totalPoolValue()).div(investmentPool.totalShares());
        if (currentValue >= position.totalDeposited) return 0;
        
        return position.totalDeposited.sub(currentValue).mul(10000).div(position.totalDeposited);
    }

    function calculateVolatility(address _user) internal view returns (uint256) {
        // Simplified volatility calculation
        // In reality, this would use historical price data
        return 1500; // 15% volatility (example)
    }

    function calculateSharpeRatio(address _user) internal view returns (uint256) {
        // Simplified Sharpe ratio calculation
        // In reality, this would use risk-free rate and excess returns
        return 120; // 1.2 Sharpe ratio (example)
    }

    function calculateVaR(address _user) internal view returns (uint256) {
        // Simplified Value at Risk calculation
        // In reality, this would use Monte Carlo simulation or historical simulation
        InvestmentPool.UserPosition memory position = investmentPool.getUserPosition(_user);
        return position.shares.mul(500).div(10000); // 5% VaR
    }

    function calculateCorrelation(address _user) internal view returns (uint256) {
        // Simplified correlation calculation
        // In reality, this would calculate correlation between assets
        return 6000; // 60% correlation (example)
    }

    function calculateLiquidityScore(address _user) internal view returns (uint256) {
        // Simplified liquidity score calculation
        // In reality, this would assess market liquidity and trading volume
        return 8000; // 80% liquidity score
    }

    function calculateOverallRiskScore(
        uint256 _drawdown,
        uint256 _volatility,
        uint256 _sharpeRatio,
        uint256 _var95,
        uint256 _correlation,
        uint256 _liquidityScore
    ) internal view returns (uint256) {
        // Weighted risk score calculation
        uint256 score = 0;
        
        // Drawdown weight: 30%
        score = score.add(_drawdown.mul(30).div(10000));
        
        // Volatility weight: 25%
        score = score.add(_volatility.mul(25).div(10000));
        
        // Sharpe ratio weight: 20% (inverted - lower is riskier)
        score = score.add(uint256(100).sub(_sharpeRatio).mul(20).div(100));
        
        // VaR weight: 15%
        score = score.add(_var95.mul(15).div(10000));
        
        // Correlation weight: 10%
        score = score.add(_correlation.mul(10).div(10000));
        
        return score;
    }

    // Risk Alert Functions
    function checkRiskAlerts(address _user, RiskMetrics memory _metrics) internal {
        // Check drawdown limit
        if (_metrics.currentDrawdown > riskParams.maxDrawdown) {
            createRiskAlert(_user, "DRAWDOWN_EXCEEDED", 4, 
                "Portfolio drawdown exceeds maximum allowed limit");
        }

        // Check volatility limit
        if (_metrics.volatility > riskParams.volatilityLimit) {
            createRiskAlert(_user, "VOLATILITY_EXCEEDED", 3, 
                "Portfolio volatility exceeds maximum allowed limit");
        }

        // Check concentration limit
        if (_metrics.correlation > riskParams.correlationLimit) {
            createRiskAlert(_user, "CORRELATION_EXCEEDED", 3, 
                "Asset correlation exceeds maximum allowed limit");
        }

        // Check liquidity requirement
        if (_metrics.liquidityScore < riskParams.liquidityRequirement) {
            createRiskAlert(_user, "LIQUIDITY_INSUFFICIENT", 2, 
                "Portfolio liquidity below required threshold");
        }

        // Check overall risk score
        if (_metrics.riskScore > 7000) { // 70% risk score
            createRiskAlert(_user, "HIGH_RISK_SCORE", 5, 
                "Overall risk score is critically high");
        }
    }

    function createRiskAlert(
        address _user,
        string memory _alertType,
        uint256 _severity,
        string memory _description
    ) internal {
        uint256 alertId = riskAlerts.length;
        
        RiskAlert memory alert = RiskAlert({
            alertId: alertId,
            user: _user,
            alertType: _alertType,
            severity: _severity,
            timestamp: block.timestamp,
            resolved: false,
            description: _description
        });

        riskAlerts.push(alert);
        userAlerts[_user].push(alertId);

        emit RiskAlertCreated(alertId, _user, _alertType, _severity);
    }

    function resolveRiskAlert(uint256 _alertId) external onlyRole(RISK_ANALYST_ROLE) {
        require(_alertId < riskAlerts.length, "Alert not found");
        require(!riskAlerts[_alertId].resolved, "Alert already resolved");

        riskAlerts[_alertId].resolved = true;
        emit RiskAlertResolved(_alertId, riskAlerts[_alertId].user);
    }

    // Risk Mitigation Functions
    function executeRiskMitigation(address _user, string memory _action) external onlyRole(RISK_ANALYST_ROLE) {
        RiskMetrics memory metrics = userRiskMetrics[_user];
        
        if (keccak256(bytes(_action)) == keccak256(bytes("REDUCE_EXPOSURE"))) {
            // Reduce portfolio exposure
            reduceExposure(_user);
        } else if (keccak256(bytes(_action)) == keccak256(bytes("INCREASE_LIQUIDITY"))) {
            // Increase liquidity
            increaseLiquidity(_user);
        } else if (keccak256(bytes(_action)) == keccak256(bytes("HEDGE_POSITION"))) {
            // Hedge position
            hedgePosition(_user);
        } else if (keccak256(bytes(_action)) == keccak256(bytes("EMERGENCY_LIQUIDATION"))) {
            // Emergency liquidation
            emergencyLiquidation(_user);
        }

        emit EmergencyActionExecuted(_user, _action, block.timestamp);
    }

    function reduceExposure(address _user) internal {
        // Simplified exposure reduction
        // In reality, this would sell high-risk assets
        InvestmentPool.UserPosition memory position = investmentPool.getUserPosition(_user);
        if (position.shares > 0) {
            // Calculate reduction amount (e.g., 10% of position)
            uint256 reductionAmount = position.shares.mul(1000).div(10000);
            // This would trigger a withdrawal in the investment pool
        }
    }

    function increaseLiquidity(address _user) internal {
        // Simplified liquidity increase
        // In reality, this would rebalance to more liquid assets
    }

    function hedgePosition(address _user) internal {
        // Simplified hedging
        // In reality, this would open offsetting positions
    }

    function emergencyLiquidation(address _user) internal {
        // Simplified emergency liquidation
        // In reality, this would liquidate the entire position
        InvestmentPool.UserPosition memory position = investmentPool.getUserPosition(_user);
        if (position.shares > 0) {
            // This would trigger a full withdrawal
        }
    }

    // Compliance Functions
    function checkCompliance(address _user) external view returns (bool compliant, string memory reason) {
        RiskMetrics memory metrics = userRiskMetrics[_user];
        
        if (metrics.riskScore > 8000) {
            return (false, "Risk score exceeds compliance limit");
        }
        
        if (metrics.currentDrawdown > riskParams.maxDrawdown) {
            return (false, "Drawdown exceeds compliance limit");
        }
        
        if (metrics.volatility > riskParams.volatilityLimit) {
            return (false, "Volatility exceeds compliance limit");
        }
        
        return (true, "Compliant");
    }

    // View Functions
    function getUserRiskMetrics(address _user) external view returns (RiskMetrics memory) {
        return userRiskMetrics[_user];
    }

    function getRiskAlerts(address _user) external view returns (uint256[] memory) {
        return userAlerts[_user];
    }

    function getRiskAlert(uint256 _alertId) external view returns (RiskAlert memory) {
        require(_alertId < riskAlerts.length, "Alert not found");
        return riskAlerts[_alertId];
    }

    function getRiskParameters() external view returns (RiskParameters memory) {
        return riskParams;
    }

    // Admin Functions
    function updateRiskParameters(
        uint256 _maxDrawdown,
        uint256 _volatilityLimit,
        uint256 _concentrationLimit,
        uint256 _correlationLimit,
        uint256 _leverageLimit,
        uint256 _liquidityRequirement
    ) external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        riskParams.maxDrawdown = _maxDrawdown;
        riskParams.volatilityLimit = _volatilityLimit;
        riskParams.concentrationLimit = _concentrationLimit;
        riskParams.correlationLimit = _correlationLimit;
        riskParams.leverageLimit = _leverageLimit;
        riskParams.liquidityRequirement = _liquidityRequirement;

        emit RiskParametersUpdated(_maxDrawdown, _volatilityLimit, _concentrationLimit);
    }

    function setUserRiskLimit(address _user, uint256 _limit) external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        userRiskLimits[_user] = _limit;
    }

    function setGlobalRiskLimit(string memory _limitType, uint256 _limit) external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        globalRiskLimits[_limitType] = _limit;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
} 