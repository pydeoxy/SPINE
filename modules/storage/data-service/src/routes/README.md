# API Reference

The Data Service exposes three main API domains, each optimized for its specific storage backend and data access patterns. All APIs follow REST conventions with consistent error handling and response formats.

## API Overview

```
http://localhost:3010/
├── api/platform/       # Platform metadata and configuration (PostgreSQL)
├── api/timescale/      # Time-series sensor data and analytics (TimescaleDB)
├── api/storage/        # File storage and bucket management (MinIO)
├── health              # Service health and status checks
└── api                 # API information and documentation
```

## Authentication & Security

All API endpoints require proper authentication. The service implements centralized access control:

- **Session-based Authentication**: Token validation coordinated with platform DataService
- **Role-based Access**: User permissions enforced at service layer
- **Request Validation**: Schema validation for all input data
- **Audit Logging**: All operations logged for governance compliance

## Response Formats

### Success Responses

```json
{
  "data": {
    /* response payload */
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Responses

```json
{
  "error": "Error message description",
  "code": 404,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Platform API (`/api/platform`)

PostgreSQL-based platform metadata management. These endpoints handle core platform configuration, user management, and system coordination.

### [Users API](platform/users.md)

User account management, authentication, and project relationships.

**Base Endpoints:**

- `GET /api/platform/users` - List all users
- `GET /api/platform/users/:id` - Get user by ID
- `GET /api/platform/user/email/:email` - Get user by email
- `POST /api/platform/users` - Create new user
- `PUT /api/platform/users/:id` - Update user
- `DELETE /api/platform/users/:id` - Delete user

**Relationship Endpoints:**

- `GET /api/platform/users/:id/projects` - Get user's projects

### [Projects API](platform/projects.md)

Project management, member coordination, and workspace organization.

**Base Endpoints:**

- `GET /api/platform/projects` - List all projects
- `GET /api/platform/projects/:id` - Get project by ID
- `GET /api/platform/projects/user/:userId` - Get projects by user
- `POST /api/platform/projects` - Create project
- `PUT /api/platform/projects/:id` - Update project
- `DELETE /api/platform/projects/:id` - Delete project

**Member Management:**

- `POST /api/platform/projects/:id/members` - Add project member
- `PUT /api/platform/projects/:projectId/members/:userId` - Update member role
- `DELETE /api/platform/projects/:projectId/members/:userId` - Remove member

### [Pipelines API](platform/pipelines.md)

Flink pipeline metadata, lifecycle management, and version control.

**Base Endpoints:**

- `GET /api/platform/pipelines` - List all pipelines
- `GET /api/platform/pipelines/:id` - Get pipeline by ID
- `GET /api/platform/pipelines/project/:projectId` - Get pipelines by project
- `POST /api/platform/pipelines` - Create pipeline
- `PUT /api/platform/pipelines/:id` - Update pipeline
- `DELETE /api/platform/pipelines/:id` - Delete pipeline

**Lifecycle Management:**

- `POST /api/platform/pipelines/:id/activate` - Activate pipeline
- `POST /api/platform/pipelines/:id/deactivate` - Deactivate pipeline
- `PUT /api/platform/pipelines/:id/version` - Increment pipeline version

### [Kafka Topics API](platform/kafka-topics.md)

Topic registration, schema attachment, and messaging coordination.

**Base Endpoints:**

- `GET /api/platform/kafka-topics` - List all topics
- `GET /api/platform/kafka-topics/:name` - Get topic by name
- `POST /api/platform/kafka-topics` - Create topic
- `PUT /api/platform/kafka-topics/:name` - Update topic
- `DELETE /api/platform/kafka-topics/:name` - Delete topic

**Schema Management:**

- `PUT /api/platform/kafka-topics/:topicName/schema` - Attach schema to topic
- `DELETE /api/platform/kafka-topics/:topicName/schema` - Detach schema from topic

### [Schemas API](platform/schemas.md)

Schema versioning, governance, and usage tracking.

**Base Endpoints:**

- `GET /api/platform/schemas` - List all schemas
- `GET /api/platform/schemas/:id` - Get schema by ID
- `GET /api/platform/schemas/name/:name` - Get schemas by name
- `POST /api/platform/schemas` - Create schema
- `PUT /api/platform/schemas/:id` - Update schema
- `DELETE /api/platform/schemas/:id` - Delete schema

**Version Management:**

- `GET /api/platform/schemas/name/:schemaName/latest` - Get latest version
- `GET /api/platform/schemas/name/:schemaName/versions` - List all versions
- `GET /api/platform/schemas/:id1/compare/:id2` - Compare versions

### [Connectors API](platform/connectors.md)

Ingress connector configuration, endpoint management, and protocol handling.

**Base Endpoints:**

- `GET /api/platform/connectors` - List all connectors
- `GET /api/platform/connectors/:id` - Get connector by ID
- `POST /api/platform/connectors` - Create connector
- `PUT /api/platform/connectors/:id` - Update connector
- `DELETE /api/platform/connectors/:id` - Delete connector

**Configuration Management:**

- `PUT /api/platform/connectors/:id/config` - Update connector configuration
- `PUT /api/platform/connectors/:id/endpoint` - Update connector endpoint
- `PUT /api/platform/connectors/:id/schema` - Attach schema to connector

### [Validators API](platform/validators.md)

Data validation rules, error strategies, and quality assurance.

**Base Endpoints:**

- `GET /api/platform/validators` - List all validators
- `GET /api/platform/validators/:id` - Get validator by ID
- `POST /api/platform/validators` - Create validator
- `PUT /api/platform/validators/:id` - Update validator
- `DELETE /api/platform/validators/:id` - Delete validator

**Strategy Management:**

- `PUT /api/platform/validators/:id/error-strategy` - Update error strategy
- `GET /api/platform/validators/chain/:topicName` - Get validation chain

## TimescaleDB API (`/api/timescale`)

Time-series sensor data management with optimized queries and analytics capabilities.

### [Sensor Data API](timescale/sensor-data.md)

High-performance sensor data ingestion, querying, and management.

**Data Operations:**

- `POST /api/timescale/sensor-readings` - Create sensor reading
- `POST /api/timescale/sensor-readings/bulk` - Bulk create readings
- `GET /api/timescale/sensor-readings` - Get readings with filters
- `GET /api/timescale/sensor-readings/:sensorId/:timestamp` - Get specific reading
- `DELETE /api/timescale/sensor-readings/:sensorId/:timestamp` - Delete reading

**Query Operations:**

- `GET /api/timescale/sensors/:sensorId/latest` - Get latest reading
- `GET /api/timescale/sensors/:sensorId/range` - Get readings in time range
- `GET /api/timescale/topics/:topic/readings` - Get readings by topic
- `GET /api/timescale/schemas/:schemaRef/readings` - Get readings by schema

### [Time-series Analytics API](timescale/analytics.md)

Advanced analytics, aggregations, and data quality assessment.

**Aggregation Operations:**

- `GET /api/timescale/timeseries/aggregations` - Time-bucketed aggregations
- `GET /api/timescale/timeseries/numeric-aggregations` - Numeric aggregations
- `GET /api/timescale/timeseries/frequency-analysis/:sensorId` - Frequency analysis

**Quality Assessment:**

- `GET /api/timescale/timeseries/data-quality` - Data quality metrics
- `GET /api/timescale/timeseries/gaps/:sensorId` - Data gap analysis
- `GET /api/timescale/timeseries/compression-info` - Compression statistics

## Storage API (`/api/storage`)

MinIO file storage management with S3-compatible operations and metadata tracking.

### [File Operations API](storage/files.md)

File upload, download, and lifecycle management.

**Basic Operations:**

- `POST /api/storage/files/upload` - Upload file (multipart)
- `POST /api/storage/files/upload-buffer` - Upload buffer (base64)
- `GET /api/storage/files/download/:bucket/:objectName` - Download file
- `DELETE /api/storage/files/:bucket/:objectName` - Delete file

**Advanced Operations:**

- `POST /api/storage/files/presigned-url/download` - Generate download URL
- `POST /api/storage/files/presigned-url/upload` - Generate upload URL
- `POST /api/storage/files/copy` - Copy file
- `GET /api/storage/files/exists/:bucket/:objectName` - Check existence

### [Bucket Management API](storage/buckets.md)

Bucket creation, configuration, and policy management.

**Basic Operations:**

- `GET /api/storage/buckets` - List all buckets
- `POST /api/storage/buckets` - Create bucket
- `DELETE /api/storage/buckets/:bucketName` - Delete bucket
- `GET /api/storage/buckets/:bucketName/exists` - Check existence

**Configuration Management:**

- `GET/PUT /api/storage/buckets/:bucketName/versioning` - Versioning config
- `GET/PUT /api/storage/buckets/:bucketName/lifecycle` - Lifecycle policies
- `GET/PUT /api/storage/buckets/:bucketName/encryption` - Encryption settings

## Health & Monitoring

### Health Check Endpoint

`GET /health` - Service health status and database connectivity

```json
{
  "status": "healthy",
  "services": {
    "platform": "connected",
    "timescale": "connected",
    "minio": "connected"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### API Information

`GET /api` - Service metadata and API version information

## Rate Limiting & Performance

- **Rate Limits**: Applied per user session to prevent abuse
- **Bulk Operations**: Available for high-volume data ingestion
- **Pagination**: Large result sets automatically paginated
- **Caching**: Implemented for frequently accessed metadata
- **Connection Pooling**: Database connections optimized for concurrent access

## Error Codes

| Code | Description    | Common Causes                                 |
| ---- | -------------- | --------------------------------------------- |
| 400  | Bad Request    | Invalid input data, malformed JSON            |
| 401  | Unauthorized   | Missing or invalid authentication             |
| 403  | Forbidden      | Insufficient permissions for operation        |
| 404  | Not Found      | Requested resource does not exist             |
| 409  | Conflict       | Resource already exists, constraint violation |
| 500  | Internal Error | Database connection issues, system errors     |
