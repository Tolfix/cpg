import EventEmitter from 'events';
import PQueue from 'p-queue';

type Task<TaskResultType> = (() => PromiseLike<TaskResultType>) | (() => TaskResultType);

export interface QueueOptions
{
  concurrency?: number;
}

export class Queue extends EventEmitter
{
  private queue: PQueue;

  constructor(options?: QueueOptions)
  {
    super();

    this.queue = new PQueue({
      concurrency: options?.concurrency || 1
    });
  }

  queueCommand<Result = unknown>(fn: Task<Result>): Promise<Result>
  {
    return this.queue.add(fn);
  }

  isProcessing(): boolean
  {
    return this.queue.size > 0;
  }

  empty(): Promise<void>
  {
    return this.queue.onIdle();
  }
}