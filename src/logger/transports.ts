import fs from 'node:fs';
import path from 'node:path';

import { SonicBoom } from 'sonic-boom';

export type TransportDestination = 'stdout' | 'file';

export interface FileTransportConfig {
  enabled: boolean;
  path: string;
}

export interface TransportConfig {
  stdout?: boolean;
  file?: FileTransportConfig;
}

function ensureDirectory(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function createStdoutTransport(): SonicBoom {
  return new SonicBoom({
    dest: 1,
    sync: false,
  });
}

function createFileTransport(filePath: string): SonicBoom {
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
    process.env.LOG_STDOUT !== 'false';

  if (stdoutEnabled) {
    transports.push(createStdoutTransport());
  }

  const fileEnabled =
    config.file?.enabled ??
    process.env.LOG_FILE_ENABLED === 'true';

  if (fileEnabled) {
    const filePath =
      config.file?.path ??
      process.env.LOG_FILE_PATH ??
      './logs/application.log';

    transports.push(createFileTransport(filePath));
  }

  return transports;
}