//! Shared data models for the MQTT subscriber service

use rumqttc::QoS;
use std::time::Instant;

/// MQTT Message with metadata
#[derive(Debug)]
#[allow(dead_code)] // Silence warning about unused fields
pub struct MqttMessage {
    pub topic: String,
    pub payload: Vec<u8>,
    pub qos: QoS,
    pub retain: bool,
    pub received_at: Instant,
}

/// Message processing metrics
#[derive(Debug, Clone)]
pub struct MessageMetrics {
    pub messages_received: usize,
    pub messages_processed: usize,
    pub messages_dropped: usize,
    pub processing_errors: usize,
}

impl MessageMetrics {
    /// Create a new metrics instance
    pub fn new() -> Self {
        Self {
            messages_received: 0,
            messages_processed: 0,
            messages_dropped: 0,
            processing_errors: 0,
        }
    }
}
