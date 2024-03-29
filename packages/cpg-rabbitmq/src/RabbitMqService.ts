/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import amqp from "amqplib/callback_api";
import Logger from "@cpg/logger"

export default class RabbitMQService
{
  private _connection: amqp.Connection | undefined;
  private _channel: amqp.Channel | undefined;
  private _logger: Logger;
  private _isConnected: boolean;

  private host: string;
  private port: number;
  private username: string;
  private password: string;
  private exchange: string;
  private prefetch: number;
  private queue: string;
  private appId: string;

  constructor(host?: string, port?: number, username?: string, password?: string, exchange?: string)
  {
    this._logger = new Logger("cpg-rabbitmq-service");
    this._isConnected = false;
    this.host = host || process.env.RABBITMQ_HOST || "localhost";
    this.port = port || parseInt(process.env.RABBITMQ_PORT || "5672");
    this.exchange = exchange || "cpg";
    this.username = username || process.env.RABBITMQ_USERNAME || "guest";
    this.password = password || process.env.RABBITMQ_PASSWORD || "guest";
    this.prefetch = 1;
    this.queue = "";
    this.appId = "cpg";
  }

  setHost(host: string)
  {
    this.host = host;
    return this;
  }

  setPort(port: number)
  {
    this.port = port;
    return this;
  }

  setExchange(exchange: string)
  {
    this.exchange = exchange;
    return this;
  }

  setUsername(username: string)
  {
    this.username = username;
    return this;
  }

  setPassword(password: string)
  {
    this.password = password;
    return this;
  }

  setPrefetch(prefetch: number)
  {
    this.prefetch = prefetch;
    return this;
  }

  setQueue(queue: string)
  {
    this.queue = queue;
    return this;
  }

  setAppId(appId: string)
  {
    this.appId = appId;
    return this;
  }

  public async connect(): Promise<boolean>
  {
    return new Promise(async (resolve, reject) =>
    {
      if (this._isConnected)
      {
        return resolve(true);
      }

      try
      {
        this._connection = await new Promise((resolve) => amqp.connect(`amqp://${this.username}:${this.password}@${this.host}:${this.port}?heartbeat=30`, (err, conn) =>
        {
          if (err)
          {
            this._logger.error(err);
            return resolve(undefined);
          }
          return resolve(conn);
        }));
        this._channel = await new Promise((resolve) => this._connection?.createChannel((err, ch) =>
        {
          if (err)
          {
            this._logger.error(err);
            return reject(err);
          }
          resolve(ch);
        }));
        this._isConnected = true;
        this._logger.info("Connected to RabbitMQ");
        return resolve(true);
      }
      catch (error)
      {
        this._logger.error(error);
        return reject(error);
      }
    })
  }

  public async publish(routingKey: string, message: string): Promise<void>
  {
    if (!this._isConnected)
    {
      await this.connect();
    }

    try
    {
      this._channel?.assertExchange(this.exchange, "direct", { durable: false });
      this._channel?.publish(this.exchange, routingKey, Buffer.from(message));
      this._logger.info("Message sent");
    }
    catch (error)
    {
      this._logger.error(error);
    }
  }

  public subscribe<T = string>(routingKey: string, callback: (message: T) => void)
  {
    const sub = () =>
    {
      try
      {
        this._channel?.assertExchange(this.exchange, "direct", { durable: false });
        this._channel?.assertQueue('', {
          exclusive: true,
          autoDelete: true,
          durable: true,
          deadLetterExchange: `${this.exchange}.dead`,
          deadLetterRoutingKey: `${routingKey}.dead`,
        }, (err) =>
        {
          if (err)
          {
            this._logger.error(err);
          }
          this._channel?.bindQueue('', this.exchange, routingKey, {}, (err) =>
          {
            if (err)
            {
              this._logger.error(err);
            }
          })
          this._channel?.consume('', (message: any) =>
          {
            if (message)
            {
              callback(JSON.parse(message.content.toString()));
              this._channel?.ack(message);
            }
          }, { noAck: false }, (err) =>
          {
            if (err)
            {
              this._logger.error(err);
            }
          });
          this._logger.info("Subscribed to queue");
        });
      }
      catch (error)
      {
        this._logger.error(error);
      }
    }
    if (!this._isConnected)
      return this.connect().then(() => sub());
    sub();
  }
}