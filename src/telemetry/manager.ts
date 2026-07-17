import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  TelemetryAlreadyInitializedError,
  TelemetryNotInitializedError,
} from '../errors.js';

export class TelemetryManager {
  private sdk: NodeSDK | null = null;

  /**
   * Registers the running SDK instance.
   * Can only be called once.
   */
  public initialize(sdk: NodeSDK): void {
    if (this.sdk) {
      throw new TelemetryAlreadyInitializedError();
    }

    this.sdk = sdk;
  }

  /**
   * Returns the registered SDK.
   */
  public getSdk(): NodeSDK {
    if (!this.sdk) {
      throw new TelemetryNotInitializedError();
    }

    return this.sdk;
  }

  /**
   * Indicates whether telemetry has been initialized.
   */
  public isInitialized(): boolean {
    return this.sdk !== null;
  }

  /**
   * Shuts down the SDK and clears the singleton.
   */
  public async shutdown(): Promise<void> {
    if (!this.sdk) {
      return;
    }

    await this.sdk.shutdown();
    this.sdk = null;
  }
}

/**
 * Singleton instance used throughout the package.
 */
export const telemetryManager = new TelemetryManager();