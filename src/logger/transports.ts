import fs from 'node:fs';
import path from 'node:path';

import { SonicBoom } from 'sonic-boom';

import {
  DEFAULT_LOG_FILE_ENABLED,
  DEFAULT_LOG_FILE_PATH,
  DEFAULT_LOG_STDOUT_ENABLED,
} from '../common/constants';
import {
  getBooleanEnv,
  getEnv,
} from '../common/env';

export interface FileTransportConfig {
  enabled: boolean;
  path: string;
}

export interface TransportConfig {
  stdout?: boolean;
  file?: FileTransportConfig;
}

function ensureDirectory(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), {
    recursive: true,
  });
}

function createStdoutTransport(): SonicBoom {
  return new SonicBoom({
    dest: 1,
    sync: false,
  });
}

function createFileTransport(
  filePath: string,
): SonicBoom {
  ensureDirectory(filePath);

  return new SonicBoom({
    dest: filePath,
    append: true,
    mkdir: true,
    sync: false,
  });
}

export function createTransports(
  config: TransportConfig = {},
): SonicBoom[] {
  const transports: SonicBoom[] = [];

  const stdoutEnabled =
    config.stdout ??
    getBooleanEnv(
      'LOG_STDOUT',
      DEFAULT_LOG_STDOUT_ENABLED,
    );

  if (stdoutEnabled) {
    transports.push(createStdoutTransport());
  }

  const fileEnabled =
    config.file?.enabled ??
    getBooleanEnv(
      'LOG_FILE_ENABLED',
      DEFAULT_LOG_FILE_ENABLED,
    );

  if (fileEnabled) {
    const filePath =
      config.file?.path ??
      getEnv(
        'LOG_FILE_PATH',
        DEFAULT_LOG_FILE_PATH,
      )!;

    transports.push(
      createFileTransport(filePath),
    );
  }

  return transports;
}