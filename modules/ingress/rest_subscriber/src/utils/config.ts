import dotenv from "dotenv";
dotenv.config();

const NODE_ENV: "prod" | "dev" = (process.env.NODE_ENV || "prod") as
    | "prod"
    | "dev";
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

type SupportedMethod = "GET" | "POST";
type AuthType = "none" | "basic" | "bearer" | "apikey" | "oauth2";
type ApiKeyLocation = "header" | "query";
type PaginationMode = "none" | "page" | "cursor" | "link";

interface RestAuthConfig {
    type: AuthType;
    username?: string;
    password?: string;
    bearerToken?: string;
    apiKey?: string;
    apiKeyHeader?: string;
    apiKeyQueryParam?: string;
    apiKeyLocation?: ApiKeyLocation;
    customHeaders?: Record<string, string>;
    oauth?: {
        tokenUrl: string;
        clientId: string;
        clientSecret: string;
        scope?: string;
        audience?: string;
        grantType: string;
        refreshMarginSeconds: number;
    };
}

interface RestEndpointConfig {
    path: string;
    method: SupportedMethod;
    bodyTemplate?: unknown;
}

interface RestPaginationConfig {
    mode: PaginationMode;
    pageParam?: string;
    pageSizeParam?: string;
    pageSize?: number;
    maxPages?: number;
    cursorParam?: string;
    nextCursorField?: string;
    nextLinkField?: string;
}

interface RestPollingConfig {
    pollIntervalMs: number;
    timeoutMs: number;
    retryAttempts: number;
    retryDelayMs: number;
}

interface RestApiConfig {
    baseUrl: string;
    endpoints: RestEndpointConfig[];
    poller: RestPollingConfig;
    auth: RestAuthConfig;
    pagination: RestPaginationConfig;
    customHeaders: Record<string, string>;
    defaultMethod: SupportedMethod;
}

const parseNumber = (
    value: string | undefined,
    fallback: number,
): number => {
    if (!value) {
        return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const parseJSON = (value: string | undefined) => {
    if (!value) {
        return undefined;
    }
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

const parseCustomHeaders = (rawHeaders: string | undefined) => {
    if (!rawHeaders) {
        return {};
    }
    return rawHeaders.split(/[,;]+/u).reduce<Record<string, string>>(
        (acc, entry) => {
            const separatorIndex = entry.search(/[:=]/u);
            const headerKey =
                separatorIndex === -1
                    ? entry.trim()
                    : entry.slice(0, separatorIndex).trim();
            const headerValue =
                separatorIndex === -1
                    ? ""
                    : entry.slice(separatorIndex + 1).trim();
            if (headerKey && headerValue) {
                acc[headerKey] = headerValue;
            }
            return acc;
        },
        {},
    );
};

const parseMethod = (value: string | undefined, fallback: SupportedMethod) => {
    if (!value) {
        return fallback;
    }
    return value.toUpperCase() === "POST" ? "POST" : "GET";
};

const parseEndpoints = (
    rawEndpoints: string,
    fallbackMethod: SupportedMethod,
): RestEndpointConfig[] => {
    return rawEndpoints
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
            const [path, method, body] = entry.split("|").map((part) => part.trim());
            if (!path) {
                throw new Error("REST_API_ENDPOINTS contains an empty path");
            }
            return {
                path,
                method: parseMethod(method, fallbackMethod),
                bodyTemplate: parseJSON(body),
            };
        });
};

let restApiConfig: RestApiConfig | undefined = undefined;
const getRestApiConfig = (): RestApiConfig => {
    if (restApiConfig) {
        return restApiConfig;
    }
    const REST_API_BASE_URL = process.env.REST_API_BASE_URL;
    const REST_API_ENDPOINTS = process.env.REST_API_ENDPOINTS;
    const REST_API_DEFAULT_METHOD = parseMethod(
        process.env.REST_API_DEFAULT_METHOD,
        "GET",
    );
    const REST_API_POLL_INTERVAL = process.env.REST_API_POLL_INTERVAL;
    const REST_API_TIMEOUT = process.env.REST_API_TIMEOUT;
    const REST_API_RETRY_ATTEMPTS = process.env.REST_API_RETRY_ATTEMPTS;
    const REST_API_RETRY_DELAY = process.env.REST_API_RETRY_DELAY;
    const REST_API_CUSTOM_HEADERS = process.env.REST_API_CUSTOM_HEADERS;

    const REST_API_AUTH_TYPE = (process.env.REST_API_AUTH_TYPE ||
        "none") as AuthType;
    const REST_API_AUTH_USERNAME = process.env.REST_API_AUTH_USERNAME;
    const REST_API_AUTH_PASSWORD = process.env.REST_API_AUTH_PASSWORD;
    const REST_API_AUTH_BEARER_TOKEN = process.env.REST_API_AUTH_BEARER_TOKEN;
    const REST_API_AUTH_API_KEY = process.env.REST_API_AUTH_API_KEY;
    const REST_API_AUTH_API_KEY_HEADER =
        process.env.REST_API_AUTH_API_KEY_HEADER || "x-api-key";
    const REST_API_AUTH_API_KEY_LOCATION = (process.env.REST_API_AUTH_API_KEY_LOCATION ||
        "header") as ApiKeyLocation;
    const REST_API_AUTH_API_KEY_QUERY_PARAM =
        process.env.REST_API_AUTH_API_KEY_QUERY_PARAM || "api_key";

    const REST_API_AUTH_OAUTH_TOKEN_URL =
        process.env.REST_API_AUTH_OAUTH_TOKEN_URL;
    const REST_API_AUTH_OAUTH_CLIENT_ID =
        process.env.REST_API_AUTH_OAUTH_CLIENT_ID;
    const REST_API_AUTH_OAUTH_CLIENT_SECRET =
        process.env.REST_API_AUTH_OAUTH_CLIENT_SECRET;
    const REST_API_AUTH_OAUTH_SCOPE = process.env.REST_API_AUTH_OAUTH_SCOPE;
    const REST_API_AUTH_OAUTH_AUDIENCE =
        process.env.REST_API_AUTH_OAUTH_AUDIENCE;
    const REST_API_AUTH_OAUTH_GRANT_TYPE =
        process.env.REST_API_AUTH_OAUTH_GRANT_TYPE || "client_credentials";
    const REST_API_AUTH_OAUTH_REFRESH_MARGIN = parseNumber(
        process.env.REST_API_AUTH_OAUTH_REFRESH_MARGIN,
        60,
    );

    const REST_API_PAGINATION_TYPE = (process.env.REST_API_PAGINATION_TYPE ||
        "none") as PaginationMode;
    const REST_API_PAGINATION_PAGE_PARAM =
        process.env.REST_API_PAGINATION_PAGE_PARAM || "page";
    const REST_API_PAGINATION_PAGE_SIZE_PARAM =
        process.env.REST_API_PAGINATION_PAGE_SIZE_PARAM || "pageSize";
    const REST_API_PAGINATION_PAGE_SIZE = parseNumber(
        process.env.REST_API_PAGINATION_PAGE_SIZE,
        100,
    );
    const REST_API_PAGINATION_MAX_PAGES = parseNumber(
        process.env.REST_API_PAGINATION_MAX_PAGES,
        0,
    );
    const REST_API_PAGINATION_CURSOR_PARAM =
        process.env.REST_API_PAGINATION_CURSOR_PARAM || "cursor";
    const REST_API_PAGINATION_NEXT_CURSOR_FIELD =
        process.env.REST_API_PAGINATION_NEXT_CURSOR_FIELD || "nextCursor";
    const REST_API_PAGINATION_NEXT_LINK_FIELD =
        process.env.REST_API_PAGINATION_NEXT_LINK_FIELD || "next";

    if (!REST_API_BASE_URL || !REST_API_ENDPOINTS) {
        throw new Error(
            `REST API configuration is not set: 
                REST_API_BASE_URL=${REST_API_BASE_URL}, 
                REST_API_ENDPOINTS=${REST_API_ENDPOINTS}`,
        );
    }

    if (REST_API_AUTH_TYPE === "basic" &&
        (!REST_API_AUTH_USERNAME || !REST_API_AUTH_PASSWORD)) {
        throw new Error(
            `REST API authentication configuration is not set: 
                REST_API_AUTH_TYPE=${REST_API_AUTH_TYPE}, 
                REST_API_AUTH_USERNAME=${REST_API_AUTH_USERNAME}, 
                REST_API_AUTH_PASSWORD=${REST_API_AUTH_PASSWORD}`,
        );
    }

    if (REST_API_AUTH_TYPE === "bearer" && !REST_API_AUTH_BEARER_TOKEN) {
        throw new Error(
            `REST API authentication configuration is not set: 
                REST_API_AUTH_TYPE=${REST_API_AUTH_TYPE}, 
                REST_API_AUTH_BEARER_TOKEN=${REST_API_AUTH_BEARER_TOKEN}`,
        );
    }

    if (REST_API_AUTH_TYPE === "apikey" && !REST_API_AUTH_API_KEY) {
        throw new Error(
            `REST API authentication configuration is not set: 
                REST_API_AUTH_TYPE=${REST_API_AUTH_TYPE}, 
                REST_API_AUTH_API_KEY=${REST_API_AUTH_API_KEY}`,
        );
    }

    if (
        REST_API_AUTH_TYPE === "oauth2" &&
        (!REST_API_AUTH_OAUTH_TOKEN_URL ||
            !REST_API_AUTH_OAUTH_CLIENT_ID ||
            !REST_API_AUTH_OAUTH_CLIENT_SECRET)
    ) {
        throw new Error(
            `REST API OAuth configuration is not set: 
                REST_API_AUTH_OAUTH_TOKEN_URL=${REST_API_AUTH_OAUTH_TOKEN_URL}, 
                REST_API_AUTH_OAUTH_CLIENT_ID=${REST_API_AUTH_OAUTH_CLIENT_ID}, 
                REST_API_AUTH_OAUTH_CLIENT_SECRET=${REST_API_AUTH_OAUTH_CLIENT_SECRET}`,
        );
    }

    restApiConfig = {
        baseUrl: REST_API_BASE_URL,
        endpoints: parseEndpoints(REST_API_ENDPOINTS, REST_API_DEFAULT_METHOD),
        poller: {
            pollIntervalMs: parseNumber(REST_API_POLL_INTERVAL, 5000),
            timeoutMs: parseNumber(REST_API_TIMEOUT, 30000),
            retryAttempts: parseNumber(REST_API_RETRY_ATTEMPTS, 3),
            retryDelayMs: parseNumber(REST_API_RETRY_DELAY, 1000),
        },
        auth: {
            type: REST_API_AUTH_TYPE,
            username: REST_API_AUTH_USERNAME,
            password: REST_API_AUTH_PASSWORD,
            bearerToken: REST_API_AUTH_BEARER_TOKEN,
            apiKey: REST_API_AUTH_API_KEY,
            apiKeyHeader: REST_API_AUTH_API_KEY_HEADER,
            apiKeyQueryParam: REST_API_AUTH_API_KEY_QUERY_PARAM,
            apiKeyLocation: REST_API_AUTH_API_KEY_LOCATION,
            customHeaders: parseCustomHeaders(
                process.env.REST_API_AUTH_CUSTOM_HEADERS,
            ),
            oauth:
                REST_API_AUTH_TYPE === "oauth2"
                    ? {
                          tokenUrl: REST_API_AUTH_OAUTH_TOKEN_URL!,
                          clientId: REST_API_AUTH_OAUTH_CLIENT_ID!,
                          clientSecret: REST_API_AUTH_OAUTH_CLIENT_SECRET!,
                          scope: REST_API_AUTH_OAUTH_SCOPE,
                          audience: REST_API_AUTH_OAUTH_AUDIENCE,
                          grantType: REST_API_AUTH_OAUTH_GRANT_TYPE,
                          refreshMarginSeconds: REST_API_AUTH_OAUTH_REFRESH_MARGIN,
                      }
                    : undefined,
        },
        pagination: {
            mode: REST_API_PAGINATION_TYPE,
            pageParam: REST_API_PAGINATION_PAGE_PARAM,
            pageSizeParam: REST_API_PAGINATION_PAGE_SIZE_PARAM,
            pageSize: REST_API_PAGINATION_PAGE_SIZE,
            maxPages: REST_API_PAGINATION_MAX_PAGES,
            cursorParam: REST_API_PAGINATION_CURSOR_PARAM,
            nextCursorField: REST_API_PAGINATION_NEXT_CURSOR_FIELD,
            nextLinkField: REST_API_PAGINATION_NEXT_LINK_FIELD,
        },
        customHeaders: parseCustomHeaders(REST_API_CUSTOM_HEADERS),
        defaultMethod: REST_API_DEFAULT_METHOD,
    };

    return restApiConfig;
};

// Empathic Building API configuration
import type { EmpathicBuildingConfig } from "@spine/ingress";

let empathicBuildingConfig: EmpathicBuildingConfig | undefined = undefined;

const getEmpathicBuildingConfig = (): EmpathicBuildingConfig => {
    if (empathicBuildingConfig) {
        return empathicBuildingConfig;
    }

    const EB_BASE_URL = process.env.EB_BASE_URL || "https://eu-api.empathicbuilding.com";
    const EB_PUSHER_KEY = process.env.EB_PUSHER_KEY || "33d6c4f799c274f7e0bc";
    const EB_PUSHER_CLUSTER = process.env.EB_PUSHER_CLUSTER || "eu";
    const EB_BEARER_TOKEN = process.env.EB_BEARER_TOKEN;
    const EB_USERNAME = process.env.EB_USERNAME;
    const EB_PASSWORD = process.env.EB_PASSWORD;
    const EB_ORGANIZATION_IDS = process.env.EB_ORGANIZATION_IDS;
    const EB_LOCATION_IDS = process.env.EB_LOCATION_IDS;
    const EB_SUBSCRIBE_NOTIFICATIONS = process.env.EB_SUBSCRIBE_NOTIFICATIONS === "true";
    const EB_RECONNECT_DELAY_MS = process.env.EB_RECONNECT_DELAY_MS;
    const EB_MAX_RECONNECT_ATTEMPTS = process.env.EB_MAX_RECONNECT_ATTEMPTS;

    // Validate authentication: either bearerToken or username/password
    if (!EB_BEARER_TOKEN && (!EB_USERNAME || !EB_PASSWORD)) {
        throw new Error(
            `Empathic Building configuration is not set: Either EB_BEARER_TOKEN or both EB_USERNAME and EB_PASSWORD must be provided`,
        );
    }

    if (!EB_ORGANIZATION_IDS && !EB_LOCATION_IDS && !EB_SUBSCRIBE_NOTIFICATIONS) {
        throw new Error(
            `Empathic Building configuration is not set: At least one of EB_ORGANIZATION_IDS, EB_LOCATION_IDS, or EB_SUBSCRIBE_NOTIFICATIONS must be configured`,
        );
    }

    empathicBuildingConfig = {
        baseUrl: EB_BASE_URL,
        pusherKey: EB_PUSHER_KEY,
        pusherCluster: EB_PUSHER_CLUSTER,
        bearerToken: EB_BEARER_TOKEN,
        username: EB_USERNAME,
        password: EB_PASSWORD,
        organizationIds: EB_ORGANIZATION_IDS
            ? EB_ORGANIZATION_IDS.split(",").map((id) => id.trim())
            : undefined,
        locationIds: EB_LOCATION_IDS
            ? EB_LOCATION_IDS.split(",").map((id) => id.trim())
            : undefined,
        subscribeToNotifications: EB_SUBSCRIBE_NOTIFICATIONS,
        reconnectDelayMs: parseNumber(EB_RECONNECT_DELAY_MS, 5000),
        maxReconnectAttempts: parseNumber(EB_MAX_RECONNECT_ATTEMPTS, 10),
    };

    return empathicBuildingConfig;
};

export {
    NODE_ENV,
    HOST,
    PORT,
    getRestApiConfig,
    getEmpathicBuildingConfig,
    type RestApiConfig,
    type RestEndpointConfig,
    type RestPaginationConfig,
    type RestPollingConfig,
    type RestAuthConfig,
};