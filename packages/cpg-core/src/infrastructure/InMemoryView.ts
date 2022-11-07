const applyUpdate = (view: any, update: any) =>
{
  const valueReturnedByUpdate = update(view);
  return valueReturnedByUpdate === undefined ?
    view :
    valueReturnedByUpdate;
};

export default class InMemoryView
{
  _ready: any;
  _map: any;
  _lockPromise: Promise<unknown> | undefined;
  _unlock: ((value?: unknown) => void) | undefined;

  /**
   * Whether the view is restored
   *
   * @type {boolean}
   */
  get ready()
  {
    return this._ready;
  }

  /**
   * Number of records in the View
   *
   * @type {number}
   * @readonly
   */
  get size()
  {
    return this._map.size;
  }

  /**
   * Creates an instance of InMemoryView
   */
  constructor()
  {
    /** @type {Map<Identifier, TRecord>} */
    this._map = new Map();

    // explicitly bind the `get` method to this object for easier using in Promises
    Object.defineProperty(this, this.get.name, {
      value: this.get.bind(this)
    });
  }

  /**
   * Lock the view to prevent concurrent modifications
   *
   * @returns {Promise<void>}
   */
  async lock()
  {
    if (this.ready === false)
      await this.once('ready');

    this._lockPromise = new Promise(resolve =>
    {
      this._unlock = resolve;
    });

    this._ready = false;
  }

  /**
   * Release the lock
   */
  unlock()
  {
    this._ready = true;
    if (typeof this._unlock === 'function')
      this._unlock();
  }

  async get(key: string, options: { nowait?: boolean } = {})
  {
    if (!key) throw new TypeError('key argument required');

    if (!this._ready && !(options && options.nowait))
      await this.once('ready');

    return this._map.get(key);
  }

  async getAll(filter?: (record: any, key: string) => boolean)
  {
    if (filter && typeof filter !== 'function')
      throw new TypeError('filter argument, when defined, must be a Function');

    if (!this._ready)
      await this.once('ready');

    const r = [];
    for (const entry of this._map.entries())
    {
      if (!filter || filter(entry[1], entry[0]))
        r.push(entry);
    }

    return r;
  }

  create(key: string, value = {})
  {
    if (!key) throw new TypeError('key argument required');
    if (typeof value === 'function') throw new TypeError('value argument must be an instance of an Object');

    if (this._map.has(key))
      throw new Error(`Key '${key}' already exists`);

    this._map.set(key, value);
  }

  update<T>(key: string, update: T)
  {
    if (!key) throw new TypeError('key argument required');
    if (typeof update !== 'function') throw new TypeError('update argument must be a Function');

    if (!this._map.has(key))
      throw new Error(`Key '${key}' does not exist`);

    this._update(key, update);
  }

  updateEnforcingNew(key: string, update: (value: any) => any)
  {
    if (!key) throw new TypeError('key argument required');
    if (typeof update !== 'function') throw new TypeError('update argument must be a Function');

    if (!this._map.has(key))
      return this.create(key, applyUpdate(undefined, update));

    return this._update(key, update);
  }

  updateAll(filter: (value: any) => boolean, update: (value: any) => any)
  {
    if (filter && typeof filter !== 'function') throw new TypeError('filter argument, when specified, must be a Function');
    if (typeof update !== 'function') throw new TypeError('update argument must be a Function');

    for (const [key, value] of this._map)
    {
      if (!filter || filter(value))
        this._update(key, update);
    }
  }

  /**
   * Update existing record
   *
   * @private
   * @param {Identifier} key
   * @param {function(TRecord): TRecord} update
   */
  _update<T>(key: string, update: T)
  {
    const value = this._map.get(key);
    this._map.set(key, applyUpdate(value, update));
  }

  /**
   * Delete record
   *
   * @param {Identifier} key
   */
  delete(key: string)
  {
    if (!key) throw new TypeError('key argument required');

    this._map.delete(key);
  }

  /**
   * Delete all records that match filter criteria
   *
   * @param {function(TRecord): boolean} [filter]
   */
  deleteAll(filter: (value: any) => boolean)
  {
    if (filter && typeof filter !== 'function') throw new TypeError('filter argument, when specified, must be a Function');

    for (const [key, value] of this._map)
    {
      if (!filter || filter(value))
        this._map.delete(key);
    }
  }

  /**
   * Create a Promise which will resolve to a first emitted event of a given type
   *
   * @param {"ready"} eventType
   * @returns {Promise<any>}
   */
  once(eventType: 'ready')
  {
    if (eventType !== 'ready')
      throw new TypeError(`Unexpected event type: ${eventType}`);

    return this._lockPromise;
  }

  /**
   * Get view summary as string
   *
   * @returns {string}
   */
  toString()
  {
    return `${this.size} record${this.size !== 1 ? 's' : ''}`;
  }
}