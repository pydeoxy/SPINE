/**
 * Extracts one record per sensor's last_measurement from EB payloads.
 * Passes last_measurement through as measurement; downstream interprets via sensorId.
 * Reuses types.RawMeasurement and types.KafkaOutputEvent.
 */
/**
 * Internal record before campusId is applied.
 * Reused by extractor and toKafkaOutputEvent.
 */
interface OutputMessage {
    campusId: string;
    sensorId: string;
    timestamp: number;
    measurement: Record<string, unknown>;
}

/** Default campus id when location mapping is missing */
const UNKNOWN_CAMPUS_ID = "unknown";

/** One record per sensor that has last_measurement; no interpretation of contents. */
function recordsFromSensor(
    sensor: Record<string, unknown>,
    campusId: string,
): OutputMessage[] {
    // FIXME: change this based on the actual sensor id in the BIM model
    const sensorId = sensor.uuid as string | undefined; // options: id, legacy_id or uuid
    
    if (!sensorId) return [];

    return [
        {
            campusId,
            sensorId,
            timestamp: Date.now(),
            measurement: sensor.last_measurement as Record<string, unknown>,
        },
    ];
}

/**
 * Parse EB payload into raw records. Supports:
 * - { organizationId, locationId, sensors: [...], sensorType } (batch)
 * - { sensors: [...] } with locationId from channel
 * - Single sensor object (use locationId from channel or payload)
 */
function extractMeasurements(
    data: unknown,
    campusId: string,
): OutputMessage[] {
    const out: OutputMessage[] = [];
    if (data == null) return out;

    if (Array.isArray(data)) {
        for (const item of data) {
            if (item && typeof item === "object") {
                out.push(...recordsFromSensor(item as Record<string, unknown>, campusId));
            }
        }
        return out;
    }

    if (typeof data !== "object") return out;
    const obj = data as Record<string, unknown>;
    const sensors = obj.sensors ?? obj.items ?? obj.data;
    if (Array.isArray(sensors)) {
        for (const s of sensors) {
            if (s && typeof s === "object") {
                out.push(...recordsFromSensor(s as Record<string, unknown>, campusId));
            }
        }
        return out;
    }

    out.push(...recordsFromSensor(obj, campusId));
    return out;
}

/** Resolve campusId from external locationId using O(1) map lookup. */
function resolveCampusId(
    locationId: string,
    map: Map<string, string>,
): string {
    return map.get(String(locationId)) ?? UNKNOWN_CAMPUS_ID;
}


export {
    type OutputMessage,
    UNKNOWN_CAMPUS_ID,
    extractMeasurements,
    resolveCampusId,
};