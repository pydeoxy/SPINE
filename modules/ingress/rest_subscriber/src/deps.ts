import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";

// Types
import type {
    FastifyInstance,
    FastifyRequest,
    FastifyReply,
    FastifyPluginAsync,
  } from "fastify";

// Initialize services
import { KafkaProducer, ServiceSchemaManager } from "@spine/messaging";
import { EmpathicBuildingService } from "@spine/ingress";
import { getEmpathicBuildingConfig } from "./utils/config";

const kafkaProducer = new KafkaProducer();
const schemaManager = new ServiceSchemaManager();
const empathicBuildingService = new EmpathicBuildingService(getEmpathicBuildingConfig());

// Export dependencies
export {
    Fastify,
    cors,
    z,
    type FastifyInstance,
    type FastifyRequest,
    type FastifyReply,
    type FastifyPluginAsync,
    kafkaProducer,
    schemaManager,
    empathicBuildingService,
  };