import dateFormat from "date-and-time";

export default class Logger
{
    private name: string;
    constructor(name: string)
    {
        this.name = name;
    }

    private static getDate()
    {
        const D_CurrentDate = new Date();
        return dateFormat.format(D_CurrentDate, "YYYY-MM-DD HH:mm:ss");
    }

    public static log<T extends any[]>(...body: T): void
    {
        const time = this.getDate();
        console.log(time + " | " + "log", ...body)
    }

    public debug<T extends any[]>(...body: T): void
    {
        const time = Logger.getDate();
        console.log(`${time} | debug | ${this.name}:`, ...body)
    }

    public info<T extends any[]>(...body: T): void
    {
        const time = Logger.getDate();
        console.log(`${time} | info | ${this.name}:`, ...body)
    }

    public warn<T extends any[]>(...body: T): void
    {
        const time = Logger.getDate();
        console.log(`${time} | warn | ${this.name}:`, ...body)
    }

    public error<T extends any[]>(...body: T): void
    {
        const time = Logger.getDate();
        console.log(`${time} | error | ${this.name}:`, ...body)
    }
}