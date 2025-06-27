import dotenv from "dotenv";

// Declare Jest globals for TypeScript
declare global {
  function beforeAll(fn: () => void | Promise<void>): void;
  function afterEach(fn: () => void | Promise<void>): void;
  function afterAll(fn: () => void | Promise<void>): void;
}

// Load test environment variables
dotenv.config({ path: "env.test" });

// Global test setup
beforeAll(async () => {
  console.log("Using existing databases for testing...");
  console.log("Platform DB:", process.env.DATABASE_URL_PLATFORM);
  console.log("TimescaleDB:", process.env.DATABASE_URL_TIMESCALE);

  // Test database connectivity
  try {
    const { platformDb } = await import("../src/db/platform");
    await platformDb.$queryRaw`SELECT 1`;
    console.log("✅ Platform database connection successful");
  } catch (error) {
    console.error("❌ Failed to connect to platform database:", error);
    throw new Error(
      "Platform database is not available. Please ensure databases are running."
    );
  }
});

// Clean up function that runs after each test
const cleanupTestData = async () => {
  const { platformDb } = await import("../src/db/platform");

  try {
    // Clean up in reverse dependency order to avoid foreign key constraints
    await platformDb.validator.deleteMany();
    await platformDb.connectorConfig.deleteMany();
    await platformDb.projectMember.deleteMany();
    await platformDb.pipeline.deleteMany();
    await platformDb.kafkaTopic.deleteMany();
    await platformDb.schema.deleteMany();
    await platformDb.project.deleteMany();
    await platformDb.user.deleteMany();

    console.log("🧹 Test data cleaned up successfully");
  } catch (error) {
    console.warn("⚠️  Warning: Error cleaning up test data:", error);
    // Don't throw here as this might be called during error handling
  }
};

// Clean up after each test
afterEach(async () => {
  await cleanupTestData();
});

// Global teardown - ensure cleanup even if tests fail
afterAll(async () => {
  console.log("Final cleanup...");
  await cleanupTestData();

  const { platformDb } = await import("../src/db/platform");
  await platformDb.$disconnect();
  console.log("Database connection closed");
});

// Handle uncaught exceptions and clean up
process.on("SIGINT", async () => {
  console.log("\n🛑 Test interrupted, cleaning up...");
  await cleanupTestData();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Test terminated, cleaning up...");
  await cleanupTestData();
  process.exit(0);
});
