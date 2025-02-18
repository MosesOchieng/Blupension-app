pub mod auth;
pub mod investments;
pub mod transactions;

use actix_web::web;

pub fn config(cfg: &mut web::ServiceConfig) {
    auth::config(cfg);
    investments::config(cfg);
    transactions::config(cfg);
} 