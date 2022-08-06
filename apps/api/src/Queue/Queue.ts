import amqlib from "amqplib/callback_api";
import { IInvoice } from "interfaces/Invoice.interface";
import { RabbitMQ_URI } from "../Config";

export interface Queues
{
    invoice_paid: IInvoice;
    send_email: any;
}

export default class Queue
{
    private static initialized: boolean = false;
    private static connection: amqlib.Connection | undefined;
    private static channel: amqlib.Channel | undefined;

    private static init()
    {
        if (this.initialized) return;
        return new Promise((resolve) =>
        {
            amqlib.connect(RabbitMQ_URI, async (err, conn) =>
            {
                if (err) throw err;
                this.connection = conn;
                // @ts-ignore
                this.channel = await conn.createChannel();
                (["invoice_paid"] as const).forEach(async (queue) =>
                {
                    await this.channel?.assertQueue(queue, { durable: true });
                });
                this.initialized = true;
                resolve(true);
            });
        });
    }

    public static async listen<K extends keyof Queues>(queue: K, callback: (message: Queues[K]) => void)
    {
        if (!this.initialized) await this.init();
        this.channel?.consume(queue, async (msg) =>
        {
            if (msg)
            {
                try 
                {
                    const message = JSON.parse(msg.content.toString());
                    callback(message);
                    this.channel?.ack(msg);
                }
                catch (err)
                {
                    console.error(err);
                }
            }
        }, { noAck: false });
    }

    public static async send<K extends keyof Queues>(queue: K, json: Queues[K] extends Array<infer U> ? U : never)
    {
        if (!this.initialized) await this.init();
        const data = JSON.stringify(json);
        this.channel?.sendToQueue(queue, Buffer.from(data));
    }

}