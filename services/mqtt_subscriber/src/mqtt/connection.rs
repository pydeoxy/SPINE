//! MQTT connection management

use log::{error, info};
use rumqttc::{AsyncClient, Event, MqttOptions, Packet, QoS};
use std::collections::HashSet;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{mpsc, Mutex, RwLock};

use crate::models::{MessageMetrics, MqttMessage};
use crate::processor::handler::process_message;

/// Process incoming messages
async fn process_message_stream(mut rx: mpsc::Receiver<MqttMessage>) {
    while let Some(message) = rx.recv().await {
        if let Err(e) = process_message(&message).await {
            error!("Error processing message: {}", e);
        }
    }
}

/// Create a new MQTT connection
pub async fn create_connection(
    mqtt_options: MqttOptions,
    topics: Arc<RwLock<HashSet<String>>>,
    connection: Arc<Mutex<Option<AsyncClient>>>,
    event_loop_handle: Arc<Mutex<Option<tokio::task::JoinHandle<()>>>>,
    metrics: Arc<RwLock<MessageMetrics>>,
    qos: QoS,
) -> Result<(), String> {
    info!("Creating new MQTT connection");

    // Create MQTT client - directly use the return value
    let (client, mut eventloop) = AsyncClient::new(mqtt_options, 100);

    // Store the client
    {
        let mut connection_lock = connection.lock().await;
        *connection_lock = Some(client.clone());
    }

    // Get the current topics
    let current_topics = {
        let topics_read = topics.read().await;
        topics_read.iter().cloned().collect::<Vec<_>>()
    };

    // Subscribe to all topics
    for topic in &current_topics {
        match client.subscribe(topic, qos).await {
            Ok(_) => info!("Subscribed to topic: {}", topic),
            Err(e) => error!("Failed to subscribe to topic {}: {:?}", topic, e),
        }
    }

    // Create a channel for processing messages
    let (tx, rx) = mpsc::channel::<MqttMessage>(100);

    // Start message processor
    tokio::spawn(async move {
        process_message_stream(rx).await;
    });

    // Clone for use in the event loop
    let client_clone = client.clone();
    let topics_clone = Arc::clone(&topics);
    let metrics_clone = Arc::clone(&metrics);

    // Start event processing loop
    let handle = tokio::spawn(async move {
        info!("MQTT event loop started");

        loop {
            match eventloop.poll().await {
                Ok(notification) => {
                    match notification {
                        Event::Incoming(Packet::Publish(publish)) => {
                            let topic = publish.topic.clone();
                            let payload = publish.payload.to_vec();
                            let qos = publish.qos;
                            let retain = publish.retain;

                            // Update metrics
                            {
                                let mut metrics_guard = metrics_clone.write().await;
                                metrics_guard.messages_received += 1;
                            }

                            // Create message
                            let mqtt_message = MqttMessage {
                                topic: topic.clone(),
                                payload,
                                qos,
                                retain,
                                received_at: std::time::Instant::now(),
                            };

                            // Send to processor
                            if let Err(e) = tx.send(mqtt_message).await {
                                error!("Failed to send message to processor: {}", e);
                            }
                        }
                        Event::Incoming(packet) => {
                            info!("Received MQTT packet: {:?}", packet);
                        }
                        Event::Outgoing(packet) => {
                            if log::log_enabled!(log::Level::Debug) {
                                info!("Sent MQTT packet: {:?}", packet);
                            }
                        }
                    }
                }
                Err(e) => {
                    error!("MQTT connection error: {:?}", e);
                    tokio::time::sleep(Duration::from_secs(5)).await;

                    // Try to reconnect
                    let topics_to_resubscribe = {
                        let topics_read = topics_clone.read().await;
                        topics_read.iter().cloned().collect::<Vec<_>>()
                    };

                    if !topics_to_resubscribe.is_empty() {
                        info!(
                            "Reconnecting and resubscribing to {} topics",
                            topics_to_resubscribe.len()
                        );
                        for topic in topics_to_resubscribe {
                            match client_clone.subscribe(&topic, qos).await {
                                Ok(_) => info!("Resubscribed to topic: {}", topic),
                                Err(e) => error!("Failed to resubscribe to {}: {:?}", topic, e),
                            }
                        }
                    }
                }
            }
        }
    });

    // Store the event loop handle
    {
        let mut event_loop_lock = event_loop_handle.lock().await;
        *event_loop_lock = Some(handle);
    }

    info!("MQTT connection established");
    Ok(())
}
