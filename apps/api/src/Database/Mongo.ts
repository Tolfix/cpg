import mongoose from "mongoose";
import { reCache } from "../Cache/reCache";
import { DebugMode, Default_Language, MongoDB_URI } from "../Config";
import GetText from "../Translation/GetText";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:database:mongo");

mongoose.connect(MongoDB_URI);
const db = mongoose.connection;

db.on('error', (error: any) =>
{
    log.error(GetText(Default_Language).database.txt_Database_Error_default, error)
    // log.error(`A error occurred, in the database`, error);
});

db.on('disconnected', () =>
{
    log.error(GetText(Default_Language).database.txt_Database_Error_Lost_Connection);
    // log.error(`Lost connection to the database, shutting down.`);
    if (!DebugMode)
        process.exit(1);
});

db.once('open', () =>
{
    log.info(GetText(Default_Language).database.txt_Database_Opened);
    reCache();
});