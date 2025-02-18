use actix_web::web;
use prometheus::{
    register_histogram_vec, register_int_counter_vec, 
    HistogramVec, IntCounterVec, HistogramOpts, Opts, Registry
};
use once_cell::sync::Lazy;
use lazy_static::lazy_static;

static HTTP_REQUEST_DURATION: Lazy<HistogramVec> = Lazy::new(|| {
    register_histogram_vec!(
        "http_request_duration_seconds",
        "HTTP request duration in seconds",
        &["method", "path", "status"]
    )
    .unwrap()
});

static TRANSACTION_COUNTER: Lazy<IntCounterVec> = Lazy::new(|| {
    register_int_counter_vec!(
        "transactions_total",
        "Total number of transactions",
        &["type", "status"]
    )
    .unwrap()
});

lazy_static! {
    pub static ref REGISTRY: Registry = Registry::new();

    pub static ref HTTP_REQUEST_DURATION: HistogramVec = HistogramVec::new(
        HistogramOpts::new(
            "http_request_duration_seconds",
            "HTTP request duration in seconds"
        ),
        &["method", "path", "status"]
    ).unwrap();

    pub static ref HTTP_REQUESTS_TOTAL: IntCounterVec = IntCounterVec::new(
        Opts::new(
            "http_requests_total",
            "Total number of HTTP requests"
        ),
        &["method", "path", "status"]
    ).unwrap();
}

pub fn init_metrics() -> web::Data<Metrics> {
    web::Data::new(Metrics::new())
}

pub struct Metrics {
    pub http_request_duration: &'static HistogramVec,
    pub transaction_counter: &'static IntCounterVec,
}

impl Metrics {
    pub fn new() -> Self {
        Self {
            http_request_duration: &HTTP_REQUEST_DURATION,
            transaction_counter: &TRANSACTION_COUNTER,
        }
    }

    pub fn record_transaction(&self, transaction_type: &str, status: &str) {
        self.transaction_counter
            .with_label_values(&[transaction_type, status])
            .inc();
    }
}

pub fn init() {
    REGISTRY.register(Box::new(HTTP_REQUEST_DURATION.clone())).unwrap();
    REGISTRY.register(Box::new(HTTP_REQUESTS_TOTAL.clone())).unwrap();
} 