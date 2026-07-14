import { HttpRequest } from '../http';

export const spanNaming = {
  http(request: HttpRequest): string {
    return `${request.method} ${request.path ?? request.url}`;
  },

  nest(
    controller: string,
    handler: string,
  ): string {
    return `${controller}.${handler}`;
  },

  rabbitmq(
    exchange: string,
    routingKey: string,
  ): string {
    return `RabbitMQ ${exchange}:${routingKey}`;
  },

  queue(queue: string): string {
    return `Queue ${queue}`;
  },

  smpp(command: string): string {
    return `SMPP ${command}`;
  },

  database(
    operation: string,
    table?: string,
  ): string {
    return table
      ? `DB ${operation} ${table}`
      : `DB ${operation}`;
  },

  cache(
    operation: string,
    key?: string,
  ): string {
    return `Cache ${operation}`;
  },

  externalHttp(
    method: string,
    host: string,
  ): string {
    return `${method} ${host}`;
  },

  custom(name: string): string {
    return name;
  },
};