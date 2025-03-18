//! API data models

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// Request for subscribing to a topic
#[derive(Deserialize, ToSchema)]
pub struct SubscribeRequest {
    /// MQTT topic to subscribe to
    pub topic: String,
}

/// Standard API response
#[derive(Serialize, ToSchema)]
pub struct ApiResponse {
    /// Whether the operation was successful
    pub success: bool,
    /// Response message
    pub message: String,
}

/// Response for topics endpoint
#[derive(Serialize, ToSchema)]
pub struct TopicsResponse {
    /// List of subscribed topics
    pub topics: Vec<String>,
}

/// Response for metrics endpoint
#[derive(Serialize, ToSchema)]
pub struct MetricsResponse {
    /// Total number of messages received
    pub messages_received: usize,
    /// Total number of messages processed
    pub messages_processed: usize,
    /// Number of messages dropped due to errors
    pub messages_dropped: usize,
    /// Number of processing errors
    pub processing_errors: usize,
    /// Number of active topics
    pub active_topics: usize,
}
