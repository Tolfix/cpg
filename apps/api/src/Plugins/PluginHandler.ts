import { Plugins } from "../Config";
import npm from "npm";
import fs from "fs";
import GetText from "../Translation/GetText";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:handler:plugins");

// find installed npm packages in package.json and get plugins starting with cpg_plugin
// then require it and call the new 
export default async function PlguinHandler()
{
    // get plugins from package.json
    log.info(GetText().plugins.txt_Plugin_Loading);
    // Logger.plugin("Loading plugins...");
    const plugins = getPlugins();
    for await (const plugin of plugins)
    {
        if (!(await isPluginInstalled(plugin)))
        {
            await installPlugin(plugin);
            log.info(GetText().plugins.txt_Plugin_Installed(plugin));
            // log.info(`Installed plugin ${plugin}`)
        }

        // @ts-ignore
        await require(plugin)();

        log.info(GetText().plugins.txt_Plugin_Loaded(plugin));
        // log.info(`Loaded plugin ${plugin}`);
    }
}


export function installPlugin(plugin: string)
{
    return new Promise((resolve, reject) =>
    {
        npm.load(function (err)
        {
            if (err)
            {
                log.error(err);
                return reject(err);
            }
            npm.commands.install([plugin], function (err)
            {
                if (err)
                {
                    log.error(err);
                    return reject(err);
                }
                resolve(true);
            });
        });
    })
}

export function isPluginInstalled(plugin: string)
{
    return new Promise((resolve) =>
    {
        // Check node_modules for plugin
        const pluginPath = `${process.cwd()}/node_modules/${plugin}`;
        if (!fs.existsSync(pluginPath))
            return resolve(false);
        resolve(true);
    });
}

export function getPlugins()
{
    // get all installed npm packages
    // get plugins starting with cpg-plugin
    return Plugins.filter(p => p.startsWith("cpg-plugin"));
}