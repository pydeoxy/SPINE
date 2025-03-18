//! Message processing handlers

use log::{debug, info};
use std::str;

use crate::models::MqttMessage;

/// Process a single MQTT message
pub async fn process_message(message: &MqttMessage) -> Result<(), String> {
    // Get payload as string if it's valid UTF-8
    let payload_str = match str::from_utf8(&message.payload) {
        Ok(s) => s,
        Err(_) => {
            // If not valid UTF-8, just use a placeholder
            "[binary data]"
        }
    };

    // Log message details
    debug!(
        "Processing message from topic '{}': {}",
        message.topic,
        if payload_str.len() > 100 {
            format!("{}... (truncated)", &payload_str[..100])
        } else {
            payload_str.to_string()
        }
    );

    // In the future, this would send to Kafka
    // For now, just print to the console
    info!(
        "Would send to Kafka: Topic={}, Payload={}",
        message.topic, payload_str
    );

    // TODO: Implement Kafka producer
    // kafka_producer
    //     .send("mqtt-messages", &message.topic, &message.payload)
    //     .await?;

    Ok(())
}
