import { Fastify, cors, kafkaProducer, schemaManager, empathicBuildingService } from "./deps";
import * as configs from "./utils/config";
import { logger } from "@spine/shared";
import { healthRoutes } from "./routes/health";
import type { DecodedEvent } from "@spine/ingress";
import { ExcelService } from "./services/ExcelService";

async function setupServer() {
    const server = Fastify({
        maxParamLength: 5000,
        logger: configs.NODE_ENV === "dev"
            ? {
                transport: {
                    target: "pino-pretty",
                    options: {
                        colorize: true,
                        ignore: "pid,hostname",
                        translateTime: "HH:MM:ss.l",
                    },
                },
            } : false,
    });

    // Register error handler
    // server.register(errorHandlerPlugin);

    // Register CORS for cross-origin requests
    server.register(cors, {
        origin: true,
    });

    // Register health routes
    server.register(healthRoutes);

    // Root endpoint
    server.get("/", async () => {
        return {
            message: "REST Subscriber Service is running",
            health: "/health",
        };
    });

    // Start server
    await server.listen({ port: configs.PORT, host: configs.HOST});
}

// Initialize Excel service
const excelService = new ExcelService();

/**
 * Handle incoming Empathic Building events and save to Excel
 */
async function handleEmpathicBuildingEvent(event: DecodedEvent): Promise<void> {
    try {
        // Prepare message for Excel
        const message = {
            eventType: event.eventType,
            channel: event.channel,
            data: event.data,
            timestamp: event.timestamp,
            source: "empathic-building",
        };

        // Save to Excel file
        await excelService.saveEvent(message);

        logger.debug(
            `Empathic Building: Saved event ${event.eventType} to Excel`,
        );
    } catch (error) {
        logger.error(
            `Empathic Building: Failed to save event ${event.eventType} to Excel:`,
            error,
        );
    }
}

/**
 * Set up Empathic Building event handlers
 */
function setupEmpathicBuildingHandlers(): void {
    // Connection events
    empathicBuildingService.on("connected", () => {
        logger.info("Empathic Building service: Connected to Pusher");
    });

    empathicBuildingService.on("disconnected", () => {
        logger.warn("Empathic Building service: Disconnected from Pusher");
    });

    empathicBuildingService.on("subscribed", ({ channel }) => {
        logger.info(`Empathic Building service: Subscribed to channel ${channel}`);
    });

    // Handle all events and save to Excel
    empathicBuildingService.on("event", async (event: DecodedEvent) => {
        await handleEmpathicBuildingEvent(event);
    });

    // Handle specific event types (optional - for additional logging/processing)
    empathicBuildingService.on("sensor-modified", async (event: DecodedEvent) => {
        logger.debug("Empathic Building: Sensor modified event received");
        await handleEmpathicBuildingEvent(event);
    });

    empathicBuildingService.on("asset-created", async (event: DecodedEvent) => {
        logger.debug("Empathic Building: Asset created event received");
        await handleEmpathicBuildingEvent(event);
    });

    empathicBuildingService.on("asset-modified", async (event: DecodedEvent) => {
        logger.debug("Empathic Building: Asset modified event received");
        await handleEmpathicBuildingEvent(event);
    });

    empathicBuildingService.on("asset-deleted", async (event: DecodedEvent) => {
        logger.debug("Empathic Building: Asset deleted event received");
        await handleEmpathicBuildingEvent(event);
    });

    // Error handling
    empathicBuildingService.on("error", (error: unknown) => {
        logger.error("Empathic Building service error:", error);
    });

    empathicBuildingService.on("tokenRefreshError", (error: unknown) => {
        logger.error("Empathic Building token refresh error:", error);
    });
}

async function main() {
    // Connect to Kafka producer
    // TODO: Add reconncetion logic in to KafkaProducerService
    // if (!(await kafkaProducer.connect())) {
    //     throw new Error(`Kafka producer is not connected!`);
    // }

    // Initialize schema manager
    // if (!(await schemaManager.initialize())) {
    //     throw new Error(`Schema manager is not connected!`);
    // }

    // Set up Empathic Building event handlers
    setupEmpathicBuildingHandlers();

    // Initialize Empathic Building service
    try {
        logger.info("Empathic Building service: Initializing...");
        await empathicBuildingService.connect();
        logger.info("Empathic Building service: Initialized successfully");
        const status = empathicBuildingService.getStatus();
        logger.info("Empathic Building service status:", status);
    } catch (error) {
        logger.warn(`Empathic Building service failed to initialize, continuing without it:`, error);
    }

    // Handle graceful shutdown
    const shutdown = async () => {
        logger.info("\n\nShutting down REST Subscriber Service...");

        // Disconnect from Empathic Building service
        try {
            await empathicBuildingService.disconnect();
        } catch (error) {
            logger.error("Error disconnecting from Empathic Building service:", error);
        }

        // TODO: Disconnect from Kafka producer

        // TODO: Disconnect from schema manager

        logger.info("Service shutdown complete");
        process.exit(0);
    }

    // Set up signal handlers
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

await setupServer();
await main();