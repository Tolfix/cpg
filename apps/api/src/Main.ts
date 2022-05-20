require("dotenv").config();
// Bad method, will find a better way to do this later
// TODO: Find right amount of max listeners
process.setMaxListeners(0);
import Logger from "lib/Logger";
import { DebugMode, GetVersion, CLI_MODE } from "./Config";

Logger.info(!CLI_MODE ? `Starting CPG-API with version ${GetVersion()}` : `Starting CPG-API with version ${GetVersion()} in CLI mode only`);
Logger.info("Adding .env variables");

import "./Mods/Map.mod";
import "./Mods/Number.mod";
import "./Mods/String.mod";

Logger.info(`Loading ./Database/Mongo`);
import "./Database/Mongo";

Logger.info(`Loading ./Events/Node.events`);
import "./Events/Node.events";

!CLI_MODE ? Logger.info(`Loading ./Server`) : null;
!CLI_MODE ? import("./Server/Server") : null;

!CLI_MODE ? Logger.info(`Loading ./Handlers/CronHandler`) : null;
!CLI_MODE ? import("./Handlers/Cron.handler") : null;

// ! This for some reason doesn't work right now, removing it if not running in CLI
CLI_MODE ? import("./Handlers/Commands.handler") : null;

if (CLI_MODE)
{
  Logger.info(`Loading ./Admin/AdminHandler`);
  import("./Admin/AdminHandler").then(AdminHandler => new AdminHandler());
}
