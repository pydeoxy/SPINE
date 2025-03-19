//! Shared data models for the MQTT subscriber service

use rumqttc::QoS;
use std::time::{Instant, SystemTime};

/// MQTT Message with metadata
#[derive(Debug)]
#[allow(dead_code)] // Silence warning about unused fields
pub struct MqttMessage {
    pub topic: String,
    pub payload: Vec<u8>,
    pub qos: QoS,
    pub retain: bool,
    pub received_at: Instant,  // Kept for internal timing
    pub timestamp: SystemTime, // Added for absolute timestamp
}
