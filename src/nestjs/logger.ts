import {
  Injectable,
  LoggerService,
} from '@nestjs/common';

import { Logger } from 'pino';

import { getLogger } from '../logger';

@Injectable()
export class TelemetryLogger
  implements LoggerService
{
  private logger?: Logger;

  private nestLogger(): Logger {
    if (!this.logger) {
      this.logger = getLogger().child({
        component: 'nestjs',
      });
    }

    return this.logger;
  }

  log(
    message: unknown,
    context?: string,
  ): void {
    this.nestLogger().info(
      {
        ...(context && {
          nestContext: context,
        }),
      },
      String(message),
    );
  }

  error(
    message: unknown,
    stack?: string,
    context?: string,
  ): void {
    this.nestLogger().error(
      {
        ...(stack && {
          stack,
        }),

        ...(context && {
          nestContext: context,
        }),
      },
      String(message),
    );
  }

  warn(
    message: unknown,
    context?: string,
  ): void {
    this.nestLogger().warn(
      {
        ...(context && {
          nestContext: context,
        }),
      },
      String(message),
    );
  }

  debug(
    message: unknown,
    context?: string,
  ): void {
    this.nestLogger().debug(
      {
        ...(context && {
          nestContext: context,
        }),
      },
      String(message),
    );
  }

  verbose(
    message: unknown,
    context?: string,
  ): void {
    this.nestLogger().trace(
      {
        ...(context && {
          nestContext: context,
        }),
      },
      String(message),
    );
  }

  fatal?(
    message: unknown,
    context?: string,
  ): void {
    this.nestLogger().fatal(
      {
        ...(context && {
          nestContext: context,
        }),
      },
      String(message),
    );
  }
}