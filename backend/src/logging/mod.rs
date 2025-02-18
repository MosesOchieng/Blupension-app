use tracing_subscriber::{fmt, EnvFilter};

pub fn setup_logging() {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));
}
