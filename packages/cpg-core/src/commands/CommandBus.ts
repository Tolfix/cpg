/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Logger } from "mongodb";
import { ICommand, Command } from ".";
import MessageBus from "../infrastructure/MessageBus";
import { Event } from "../events";

const service = 'CommandBus';

const log = new Logger(`cpg-core-commands-commandbus`);

export default class CommandBus
{

  private bus: MessageBus
  constructor()
  {
    this.bus = new MessageBus();
  }

  /**
   * Set up a command handler
   *
   * @param {string} commandType
   * @param {IMessageHandler} handler
   * @returns {any}
   */
  on(commandType: string, handler: (command: Event) => void): void
  {
    if (typeof commandType !== 'string' || !commandType.length) throw new TypeError('commandType argument must be a non-empty String');
    if (typeof handler !== 'function') throw new TypeError('handler argument must be a Function');

    return this.bus.on(commandType, handler);
  }

  send(command: Command)
  {
    const { type } = command;
    if (typeof type !== 'string' || !type.length)
      throw new TypeError('type argument must be a non-empty String');
    return this.sendRaw(command);
  }


  sendRaw(command: Omit<ICommand, 'id' | 'date'>)
  {
    if (!command) throw new TypeError('command argument required');
    if (!command.type) throw new TypeError('command.type argument required');

    log.debug(`sending '${command.type}' command...`, { service });

    return this.bus.send(command as Command).then(r =>
    {
      log.debug(`'${command.type}' processed`, { service });
      return r;
    }, (error: any) =>
    {
      log.error(`'${command.type}' processing has failed: ${error.message}`, { service, stack: error.stack });
      throw error;
    });
  }
}

module.exports = CommandBus;