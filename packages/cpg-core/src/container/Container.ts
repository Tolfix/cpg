import { ContainerBuilder } from 'di0';
import { Aggregate } from '../aggregate';
import AggregateCommandHandler from '../aggregate/AggregateCommandHandler';
import { CommandBus } from '../commands';
import { EventStore } from '../events';
import Projection from '../projection/Projection';

const KNOWN_METHOD_NAMES = new Set([
  'subscribe'
]);

// @ts-ignore
function getInheritedPropertyNames(prototype)
{
  const parentPrototype = prototype && Object.getPrototypeOf(prototype);
  if (!parentPrototype)
    return [];

  const propDescriptors = Object.getOwnPropertyDescriptors(parentPrototype);
  const propNames = Object.keys(propDescriptors);

  return [
    ...propNames,
    ...getInheritedPropertyNames(parentPrototype)
  ];
}

// @ts-ignore
function getMessageHandlerNames(observerInstanceOrClass)
{
  if (!observerInstanceOrClass)
    throw new TypeError('observerInstanceOrClass argument required');

  const prototype = typeof observerInstanceOrClass === 'function' ?
    observerInstanceOrClass.prototype :
    Object.getPrototypeOf(observerInstanceOrClass);

  if (!prototype)
    throw new TypeError('prototype cannot be resolved');

  const inheritedProperties = new Set(getInheritedPropertyNames(prototype));

  const propDescriptors = Object.getOwnPropertyDescriptors(prototype);
  const propNames = Object.keys(propDescriptors);

  return propNames.filter(key =>
    !key.startsWith('_') &&
    !inheritedProperties.has(key) &&
    !KNOWN_METHOD_NAMES.has(key) &&
    typeof propDescriptors[key].value === 'function');
}

// @ts-ignore
export function getHandledMessageTypes(observerInstanceOrClass: Aggregate | Projection)
{
  if (!observerInstanceOrClass)
    throw new TypeError('observerInstanceOrClass argument required');

  if (observerInstanceOrClass.handles)
    return observerInstanceOrClass.handles;

  const prototype = Object.getPrototypeOf(observerInstanceOrClass);
  if (prototype && prototype.constructor && prototype.constructor.handles)
    return prototype.constructor.handles;

  return getMessageHandlerNames(observerInstanceOrClass);
}

// eslint-disable-next-line @typescript-eslint/ban-types
function isClass(func: Function)
{
  return typeof func === 'function'
    && Function.prototype.toString.call(func).startsWith('class');
}

declare module 'di0' {
  interface Container
  {
    commandBus: CommandBus;
    eventStore: EventStore;
  }
}

export class Container<
  Projectors extends Projection[] = Projection[],
> extends ContainerBuilder
{

  // @ts-ignore
  public commandBus: CommandBus;
  // @ts-ignore
  public eventStore: EventStore;

  constructor(options?: any)
  {
    super(options);
    this.register(EventStore).as('eventStore');
    this.register(CommandBus).as('commandBus');
  }

  registerCommandHandler(typeOrFactory: any)
  {
    return super.register(
      container =>
      {
        const handler = container.createInstance(typeOrFactory);
        handler.subscribe(container.commandBus);
        return handler;
      })
      .asSingleInstance();
  }

  registerProjection(ProjectionType: Projection, exposed?: string)
  {
    // @ts-ignore
    if (!isClass(ProjectionType))
      throw new TypeError('ProjectionType argument must be a constructor function');

    const projectionFactory = (container: any) =>
    {
      const projection = container.createInstance(ProjectionType);
      projection.subscribe(container.eventStore);

      if (exposed)
        return projection.view;

      return projection;
    };

    const t = super.register(projectionFactory).asSingleInstance();

    if (exposed)
      t.as(exposed);

    return t;
  }

  registerAggregate(AggregateType: Aggregate)
  {
    // @ts-ignore
    if (!isClass(AggregateType))
      throw new TypeError('AggregateType argument must be a constructor function');

    const commandHandlerFactory = (container: any) =>
      container.createInstance(AggregateCommandHandler, {
        aggregateType: (options: any) =>
          container.createInstance(AggregateType, options),
        handles: getHandledMessageTypes(AggregateType)
      });

    return this.registerCommandHandler(commandHandlerFactory);
  }
}

export default Container;