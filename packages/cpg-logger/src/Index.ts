import dateFormat from "date-and-time";
import debug from "debug";

export enum LogLevel
{
    Debug,
    Info,
    Warn,
    Error,
}

let logLevel: LogLevel = LogLevel.Error;

export function setGlobalLogLevel(level: LogLevel): void
{
    // Set the global log level
    logLevel = level;
}

export default class Logger
{
    private name: string;
    private log: ReturnType<typeof debug>;

    constructor(name: string)
    {
        this.name = name;
        this.log = debug(name || "cpg-logger");
    }

    static getDate(): string
    {
        const D_CurrentDate = new Date();
        return dateFormat.format(D_CurrentDate, "YYYY-MM-DD HH:mm:ss");
    }

    private static isBelowLogLevel(levelKey: keyof typeof LogLevel): boolean
    {
        return logLevel > LogLevel[levelKey];
    }

    public static log<T extends any[]>(...body: T): void
    {
        const time = this.getDate();
        if (this.isBelowLogLevel('Info'))
            return;
        this.log(time + " | " + "log:", ...body)
    }

    public debug<T extends any[]>(...body: T): void
    {
        const time = Logger.getDate();
        if (Logger.isBelowLogLevel('Debug'))
            return;
        this.log(`${time} | debug:`, ...body)
    }

    public info<T extends any[]>(...body: T): void
    {
        const time = Logger.getDate();
        if (Logger.isBelowLogLevel('Info'))
            return;
        this.log(`${time} | info:`, ...body)
    }

    public warn<T extends any[]>(...body: T): void
    {
        const time = Logger.getDate();
        if (Logger.isBelowLogLevel('Warn'))
            return;
        this.log(`${time} | warn:`, ...body)
    }

    public error<T extends any[]>(...body: T): void
    {
        const time = Logger.getDate();
        if (Logger.isBelowLogLevel('Error'))
            return;
        this.log(`${time} | error | ${this.name}:`, ...body)
    }
}