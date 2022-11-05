require("dotenv").config();
// Bad method, will find a better way to do this later
// TODO: Find right amount of max listeners
process.setMaxListeners(0);

import Logger, { setGlobalLogLevel, LogLevel } from "@cpg/logger";
setGlobalLogLevel(process.env.NODE_ENV === "production" ? LogLevel.Info : LogLevel.Debug);
const log = new Logger("cpg:api:bootstrap");

import { GetVersion, CLI_MODE } from "./Config";

log.info(!CLI_MODE ? `Starting CPG-API with version ${GetVersion()}` : `Starting CPG-API with version ${GetVersion()} in CLI mode only`);
log.info("Adding .env variables");

import "./Mods/Map.mod";
import "./Mods/Number.mod";
import "./Mods/String.mod";

log.info(`Loading ./Database/Mongo`);
import "./Database/Mongo";

log.info(`Loading ./Events/Node.events`);
import "./Events/Node.events";

!CLI_MODE ? log.info(`Loading ./Server`) : null;
!CLI_MODE ? import("./Server/Server") : null;

!CLI_MODE ? log.info(`Loading ./Handlers/CronHandler`) : null;
!CLI_MODE ? import("./Handlers/Cron.handler") : null;

// ! This for some reason doesn't work right now, removing it if not running in CLI
CLI_MODE ? import("./Handlers/Commands.handler") : null;

if (CLI_MODE)
{
    log.info(`Loading ./Admin/AdminHandler`);
    import("./Admin/AdminHandler").then((AdminHandler) => new AdminHandler.default());
}
