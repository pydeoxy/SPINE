//! Kafka integration for MQTT messages

use log::{error, info};
use rdkafka::config::ClientConfig;
use rdkafka::producer::{FutureProducer, FutureRecord};
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

/// Kafka producer for sending MQTT messages to Kafka
pub struct KafkaProducer {
    producer: FutureProducer,
    topic: String,
    is_connected: AtomicBool,
}

impl KafkaProducer {
    /// Create a new Kafka producer
    pub fn new(broker: &str, topic: &str) -> Self {
        let producer: FutureProducer = ClientConfig::new()
            .set("bootstrap.servers", broker)
            .set("client.id", "mqtt_subscriber")
            .set("message.timeout.ms", "5000")
            .create()
            .expect("Failed to create Kafka producer");

        info!("Kafka producer created for topic: {}", topic);

        Self {
            producer,
            topic: topic.to_string(),
            is_connected: AtomicBool::new(false),
        }
    }

    /// Check if Kafka is connected
    pub fn check_connection(&self) -> bool {
        self.is_connected.load(Ordering::Relaxed)
    }

    /// Send a message to Kafka with graceful fallback
    pub async fn send(&self, mqtt_topic: &str, payload: &[u8]) -> Result<(), String> {
        let record = FutureRecord::to(&self.topic)
            .key(mqtt_topic)
            .payload(payload);

        match self.producer.send(record, Duration::from_secs(1)).await {
            Ok(_) => {
                // Update connection status on success
                self.is_connected.store(true, Ordering::Relaxed);
                info!(
                    "Message sent to Kafka topic {}: mqtt_topic={}",
                    self.topic, mqtt_topic
                );
                Ok(())
            }
            Err((e, _)) => {
                // Update connection status on failure
                self.is_connected.store(false, Ordering::Relaxed);
                error!("Error sending to Kafka: {}", e);
                Err(format!("Failed to send to Kafka: {}", e))
            }
        }
    }
}
