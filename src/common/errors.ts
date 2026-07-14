/**
 * Base class for all SDK errors.
 */
export class TelemetryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a telemetry component is accessed before initialization.
 */
export class NotInitializedError extends TelemetryError {
  constructor(component: string) {
    super(
      `${component} has not been initialized. Call initTelemetry() before using ${component}.`,
    );
  }
}

/**
 * Thrown when telemetry configuration is invalid.
 */
export class InvalidConfigurationError extends TelemetryError {
  constructor(message: string) {
    super(message);
  }
}