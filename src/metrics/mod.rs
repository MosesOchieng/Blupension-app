use prometheus::{register_histogram_vec, register_int_counter_vec, HistogramVec, IntCounterVec};
use once_cell::sync::Lazy;

pub static HTTP_REQUEST_DURATION: Lazy<HistogramVec> = Lazy::new(|| {
    register_histogram_vec!(
        "http_request_duration_seconds",
        "HTTP request duration in seconds",
        &["method", "path", "status"]
    ).unwrap()
});

pub static TRANSACTION_COUNTER: Lazy<IntCounterVec> = Lazy::new(|| {
    register_int_counter_vec!(
        "transactions_total",
        "Total number of transactions",
        &["type", "status"]
    ).unwrap()
}); 