import { readdirSync } from "fs";
import { cacheCommands } from "../Admin/Commands/Prompt";
import { HomeDir } from "../Config";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:admin:commands:prompt:handler");

const routeDir = HomeDir + "/build/Admin/Commands";
const command = readdirSync(`${routeDir}`).filter((f) => f.endsWith('.js'));
for (const file of command)
{
    if (file.includes("Prompt"))
        continue;
    const pull = require(`${routeDir}/${file}`).default;
    if (pull)
    {
        log.info(`Adding new command for admin`);
        cacheCommands.set(pull.name, pull);
    }
}