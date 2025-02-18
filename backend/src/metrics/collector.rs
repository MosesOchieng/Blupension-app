use prometheus::{IntCounter, Registry};

pub struct MetricsCollector {
    pub registry: Registry,
    pub investments_total: IntCounter,
    pub transactions_total: IntCounter,
}

impl MetricsCollector {
    pub fn new() -> Self {
        let registry = Registry::new();
        
        let investments_total = IntCounter::new(
            "investments_total",
            "Total number of investments"
        ).expect("metric can be created");
        
        let transactions_total = IntCounter::new(
            "transactions_total", 
            "Total number of transactions"
        ).expect("metric can be created");

        registry.register(Box::new(investments_total.clone()))
            .expect("collector can be registered");
            
        registry.register(Box::new(transactions_total.clone()))
            .expect("collector can be registered");

        Self {
            registry,
            investments_total,
            transactions_total,
        }
    }
}
