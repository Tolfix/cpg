import Logger from "@cpg/logger";
import RabbitMqService from "@cpg/rabbitmq";
import { Command } from "../commands";
import { Event } from "../events";

const log = new Logger("cpg-core-infrastructure-messagebus");

export default class MessageBus
{

  private rabbitMqService: RabbitMqService;
  private handlers: Record<string, (command: Event) => void>;

  constructor()
  {
    this.rabbitMqService = new RabbitMqService();
    this.handlers = {};
  }

  send(command: Command): Promise<void>
  {
    log.debug(`Sending command ${command.type}`);
    return this.rabbitMqService.publish(command.type, JSON.stringify(command));
  }

  publish(event: Event): Promise<void>
  {
    log.debug(`Publishing event ${event.type}`);
    return this.rabbitMqService.publish(event.type, JSON.stringify(event));
  }

  on(messageType: string, handler: (command: Event) => void): void
  {
    log.debug(`Registering handler for command ${messageType}`);
    this.handlers[messageType] = handler;

    this.rabbitMqService.subscribe<Event>(messageType, async (message) =>
    {
      const command = message;
      await handler(command);
    });
  }

  off(messageType: string): void
  {
    log.debug(`Unregistering handler for command ${messageType}`);
    delete this.handlers[messageType];
  }
}