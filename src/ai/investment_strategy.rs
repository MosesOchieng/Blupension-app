use anyhow::Result;
use ndarray::{Array1, Array2};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use tch::{Device, Tensor, nn};
use chrono::{DateTime, Utc};
use crate::services::price_feed::PriceFeedService;

#[derive(Debug, Serialize, Deserialize)]
pub struct RiskProfile {
    age: u8,
    income: f64,
    risk_tolerance: RiskTolerance,
    investment_horizon: u8, // years
}

#[derive(Debug, Serialize, Deserialize)]
pub enum RiskTolerance {
    Conservative,
    Moderate,
    Aggressive,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AssetAllocation {
    pub stablecoin: f64,    // Percentage in stablecoins (e.g., USDC)
    pub growing_assets: f64, // Percentage in growing assets (e.g., Bitcoin)
}

impl AssetAllocation {
    pub fn from_risk_tolerance(risk_tolerance: &RiskTolerance) -> Self {
        match risk_tolerance {
            RiskTolerance::Conservative => Self {
                stablecoin: 80.0,
                growing_assets: 20.0,
            },
            RiskTolerance::Moderate => Self {
                stablecoin: 50.0,
                growing_assets: 50.0,
            },
            RiskTolerance::Aggressive => Self {
                stablecoin: 20.0,
                growing_assets: 80.0,
            },
        }
    }

    pub fn validate(&self) -> bool {
        (self.stablecoin + self.growing_assets - 100.0).abs() < 0.01 // Check if total is 100%
    }
}

pub struct InvestmentAI {
    model: tch::CModule,
    market_data: HashMap<String, f64>,
    price_feed: Option<PriceFeedService>,
}

impl InvestmentAI {
    pub fn new() -> Result<Self> {
        // Load the PyTorch model (you'll need to train this separately)
        let model = tch::CModule::load("models/investment_model.pt")?;
        
        Ok(Self {
            model,
            market_data: HashMap::new(),
            price_feed: None,
        })
    }

    pub async fn update_market_data(&mut self) -> Result<()> {
        let price_feed = self.price_feed.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Price feed not initialized"))?;

        // Fetch prices for relevant assets
        let btc_data = price_feed.get_price("BTC").await?;
        let usdc_data = price_feed.get_price("USDC").await?;

        // Update market data
        self.market_data = HashMap::from([
            ("btc_price".to_string(), btc_data.price),
            ("btc_volume".to_string(), btc_data.volume_24h),
            ("btc_change".to_string(), btc_data.percent_change_24h),
            ("usdc_price".to_string(), usdc_data.price),
            ("usdc_volume".to_string(), usdc_data.volume_24h),
        ]);

        Ok(())
    }

    pub fn generate_allocation(&self, profile: &RiskProfile) -> Result<AssetAllocation> {
        // Instead of using ML model, we'll use the predefined allocations
        Ok(AssetAllocation::from_risk_tolerance(&profile.risk_tolerance))
    }

    fn prepare_input(&self, profile: &RiskProfile) -> Result<tch::Tensor> {
        // Combine risk profile and market data into a single input tensor
        let mut features = Vec::new();
        
        // Add risk profile features
        features.push(profile.age as f64 / 100.0); // Normalize age
        features.push(profile.income / 100000.0);  // Normalize income
        features.push(match profile.risk_tolerance {
            RiskTolerance::Conservative => 0.0,
            RiskTolerance::Moderate => 0.5,
            RiskTolerance::Aggressive => 1.0,
        });
        features.push(profile.investment_horizon as f64 / 40.0); // Normalize horizon

        // Add market data features
        for key in ["stock_market_index", "bond_yields", "real_estate_index", "crypto_index"] {
            features.push(self.market_data.get(key).unwrap_or(&0.0) / 1000.0);
        }

        Ok(tch::Tensor::from_slice(&features))
    }
}

#[derive(Debug)]
pub struct PortfolioRebalancer {
    ai: InvestmentAI,
    rebalance_threshold: f64, // Percentage difference that triggers rebalancing
}

impl PortfolioRebalancer {
    pub fn new(rebalance_threshold: f64) -> Result<Self> {
        Ok(Self {
            ai: InvestmentAI::new()?,
            rebalance_threshold,
        })
    }

    pub async fn check_and_rebalance(
        &mut self,
        portfolio_id: Uuid,
        current_allocation: &AssetAllocation,
        risk_profile: &RiskProfile,
    ) -> Result<Option<AssetAllocation>> {
        // Update market data
        self.ai.update_market_data().await?;

        // Generate target allocation
        let target = self.ai.generate_allocation(risk_profile)?;

        // Check if rebalancing is needed
        if self.needs_rebalancing(current_allocation, &target) {
            Ok(Some(target))
        } else {
            Ok(None)
        }
    }

    fn needs_rebalancing(
        &self,
        current: &AssetAllocation,
        target: &AssetAllocation,
    ) -> bool {
        let diff_stocks = (current.stablecoin - target.stablecoin).abs();
        let diff_growing_assets = (current.growing_assets - target.growing_assets).abs();

        diff_stocks > self.rebalance_threshold
            || diff_growing_assets > self.rebalance_threshold
    }
} 

// Instead of using Result<()>, create custom error types
#[derive(Debug, thiserror::Error)]
pub enum InvestmentError {
    #[error("Market data fetch failed: {0}")]
    MarketDataError(String),
    #[error("Model prediction failed: {0}")]
    ModelError(String)
}

#[derive(Debug, Deserialize)]
pub struct InvestmentConfig {
    model_path: String,
    market_indices: Vec<String>,
    normalization_factors: HashMap<String, f64>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserProfile {
    pub age: u8,
    pub income: f64,
    pub risk_tolerance: RiskTolerance,
    pub investment_horizon: u8,
    pub employment_status: EmploymentStatus,
    pub dependents: u8,
    pub financial_goals: Vec<FinancialGoal>,
    pub market_knowledge: MarketKnowledge,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MarketConditions {
    pub btc_volatility: f64,
    pub stablecoin_liquidity: f64,
    pub market_trend: MarketTrend,
    pub economic_indicators: EconomicIndicators,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InvestmentRecommendation {
    pub stablecoin_allocation: f64,
    pub growing_assets_allocation: f64,
    pub rebalancing_frequency: RebalancingFrequency,
    pub risk_assessment: RiskAssessment,
    pub expected_returns: ExpectedReturns,
    pub confidence_score: f64,
}

impl InvestmentAI {
    pub async fn generate_recommendation(
        &self,
        user_profile: &UserProfile,
        market_conditions: &MarketConditions,
        historical_performance: &[PortfolioPerformance],
    ) -> Result<InvestmentRecommendation> {
        // Prepare input features
        let features = self.prepare_features(user_profile, market_conditions, historical_performance)?;
        
        // Run prediction through both models
        let allocation_prediction = self.allocation_model.forward(&features)?;
        let risk_prediction = self.risk_model.forward(&features)?;
        
        // Process predictions
        let (stablecoin, growing) = self.process_allocation_prediction(&allocation_prediction)?;
        let risk_assessment = self.process_risk_prediction(&risk_prediction)?;
        
        // Calculate confidence score based on market conditions and prediction certainty
        let confidence = self.calculate_confidence_score(
            &allocation_prediction,
            &risk_prediction,
            market_conditions,
        )?;

        // Generate expected returns
        let expected_returns = self.calculate_expected_returns(
            stablecoin,
            growing,
            market_conditions,
            &risk_assessment,
        )?;

        Ok(InvestmentRecommendation {
            stablecoin_allocation: stablecoin,
            growing_assets_allocation: growing,
            rebalancing_frequency: self.determine_rebalancing_frequency(
                &risk_assessment,
                market_conditions,
            ),
            risk_assessment,
            expected_returns,
            confidence_score: confidence,
        })
    }

    async fn detect_market_anomalies(&self) -> Result<Vec<MarketAnomaly>> {
        // Implement anomaly detection using isolation forest algorithm
        let recent_data = self.fetch_recent_market_data().await?;
        let anomalies = self.anomaly_detector.detect(&recent_data)?;
        Ok(anomalies)
    }

    async fn optimize_portfolio(&self, current_allocation: &PortfolioAllocation) -> Result<PortfolioAdjustment> {
        // Implement portfolio optimization using modern portfolio theory
        let market_data = self.fetch_market_data().await?;
        let efficient_frontier = self.calculate_efficient_frontier(&market_data)?;
        let optimal_point = self.find_optimal_allocation(
            &efficient_frontier,
            current_allocation,
            &self.risk_constraints,
        )?;
        
        Ok(PortfolioAdjustment {
            target_allocation: optimal_point,
            suggested_trades: self.generate_trade_suggestions(
                current_allocation,
                &optimal_point,
            )?,
            expected_improvement: self.calculate_improvement_metrics(
                current_allocation,
                &optimal_point,
            )?,
        })
    }

    async fn predict_market_trends(&self) -> Result<MarketPrediction> {
        // Implement time series forecasting using LSTM
        let historical_data = self.fetch_historical_data().await?;
        let preprocessed_data = self.preprocess_time_series(&historical_data)?;
        let prediction = self.time_series_model.predict(&preprocessed_data)?;
        
        Ok(MarketPrediction {
            trend: self.interpret_trend_prediction(&prediction)?,
            confidence_intervals: self.calculate_confidence_intervals(&prediction)?,
            risk_factors: self.identify_risk_factors(&prediction)?,
        })
    }
}

// Helper structs for sophisticated market analysis
#[derive(Debug, Serialize, Deserialize)]
pub struct MarketAnomaly {
    pub timestamp: DateTime<Utc>,
    pub anomaly_type: AnomalyType,
    pub severity: f64,
    pub affected_metrics: Vec<String>,
    pub suggested_actions: Vec<Action>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PortfolioAdjustment {
    pub target_allocation: PortfolioAllocation,
    pub suggested_trades: Vec<Trade>,
    pub expected_improvement: ImprovementMetrics,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MarketPrediction {
    pub trend: MarketTrend,
    pub confidence_intervals: ConfidenceIntervals,
    pub risk_factors: Vec<RiskFactor>,
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_asset_allocation_validation() {
        let allocation = AssetAllocation {
            stablecoin: 60.0,
            growing_assets: 40.0,
        };
        assert!(allocation.validate());
    }
}
