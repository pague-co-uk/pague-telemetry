import {
  DynamicModule,
  Global,
  Module,
  Provider,
} from '@nestjs/common';

import { TelemetryInterceptor } from './interceptor';
import { TelemetryLogger } from './logger';

export interface NestTelemetryOptions {
  /**
   * Enable controller tracing.
   */
  tracing?: boolean;

  /**
   * Enable telemetry logging.
   */
  logging?: boolean;

  /**
   * Reserved for future metrics configuration.
   */
  metrics?: boolean;
}

export const TELEMETRY_OPTIONS = Symbol(
  'TELEMETRY_OPTIONS',
);

@Global()
@Module({})
export class TelemetryModule {
  static forRoot(
    options: NestTelemetryOptions = {},
  ): DynamicModule {
    const optionsProvider: Provider = {
      provide: TELEMETRY_OPTIONS,
      useValue: options,
    };

    return {
      module: TelemetryModule,

      providers: [
        optionsProvider,
        TelemetryLogger,
        TelemetryInterceptor,
      ],

      exports: [
        TelemetryLogger,
        TelemetryInterceptor,
        optionsProvider,
      ],
    };
  }
}