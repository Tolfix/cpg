import { readdirSync } from "fs";
import { HomeDir } from "../Config";
import { Logger } from "lib";

const routeDir = HomeDir + "/build/Cron";
const command = readdirSync(`${routeDir}`).filter((f) => f.endsWith('cron.js'));
for (const file of command)
{
    const pull = require(`${routeDir}/${file}`);
    if (pull)
    {
        Logger.info(`Adding new cron job`);
        pull();
    }
}