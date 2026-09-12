import { NodeSDK } from '@opentelemetry/sdk-node';

import {
  TelemetryAlreadyInitializedError,
  TelemetryNotInitializedError,
} from '../errors.js';

export class TelemetryManager {
  private sdk: NodeSDK | null = null;

  /**
   * Registers the SDK instance.
   * Can only be called once until the SDK is shut down.
   */
  public initialize(sdk: NodeSDK): void {
    if (this.sdk) {
      throw new TelemetryAlreadyInitializedError();
    }

    this.sdk = sdk;
  }

  /**
   * Starts the registered SDK.
   *
   * If startup fails, ownership of the SDK is released and
   * shutdown is attempted to avoid leaving partially started
   * telemetry resources running.
   */
  public start(): void {
    const sdk = this.sdk;

    if (!sdk) {
      throw new TelemetryNotInitializedError();
    }

    try {
      sdk.start();
    } catch (error) {
      this.sdk = null;

      void sdk.shutdown().catch(() => {
        // The original startup error is more useful to the caller.
      });

      throw error;
    }
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
   *
   * The SDK reference is retained if shutdown fails so that the
   * lifecycle remains recoverable and the failure is not hidden.
   */
  public async shutdown(): Promise<void> {
    const sdk = this.sdk;

    if (!sdk) {
      return;
    }

    await sdk.shutdown();
    this.sdk = null;
  }
}

/**
 * Singleton instance used throughout the package.
 */
export const telemetryManager = new TelemetryManager();