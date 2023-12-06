import fs from "fs";
import path from "path"
import chalk from "chalk";
import {homedir} from "os"

const LOG_LEVEL = {
    DEBUG: 9, // how cirno is that
    INFO: 8,
    WARN: 7,
    ERROR: 6,
    undefined: 8 // does this work lol?
}

let logStream
const loggerPrefix = "[shuttle]"
const time = () => {
    return new Date().toISOString()
}
export const logger = {
    debug: (...args) => {
        console.debug(chalk.dim(time()), chalk.dim(chalk.green(loggerPrefix), "DEBUG:", ...args))
        if (logStream && configuration && LOG_LEVEL[configuration.logLevel.value] >= LOG_LEVEL.DEBUG) {
            logStream.write([time(), loggerPrefix, "DEBUG:", ...args, "\n"].join(" "))
        }
    },
    info: (...args) => {
        console.info(chalk.dim(time()), chalk.green(loggerPrefix), "INFO:", ...args)
        if (logStream && configuration && LOG_LEVEL[configuration.logLevel.value] >= LOG_LEVEL.INFO) {
            logStream.write([time(), loggerPrefix, "INFO:", ...args, "\n"].join(" "))
        }
    },
    warn: (...args) => {
        console.warn(chalk.dim(time()), chalk.yellow(loggerPrefix), chalk.yellow.bold("WARNING:"), ...args)
        if (logStream && configuration && LOG_LEVEL[configuration.logLevel.value] >= LOG_LEVEL.WARN) {
            logStream.write([time(), loggerPrefix, "WARNING:", ...args, "\n"].join(" "))
        }
    },
    error: (...args) => {
        console.error(chalk.dim(time()), chalk.red(loggerPrefix), chalk.red.bold("ERROR:"), ...args)
        if (logStream && configuration && LOG_LEVEL[configuration.logLevel.value] >= LOG_LEVEL.ERROR) {
            logStream.write([time(), loggerPrefix, "ERROR:", ...args, "\n"].join(" "))
        }
    }
}

logger.debug(`Running on platform: ${process.platform}`)

let sampleConfigPath = path.resolve("data/sample.config.json");
let configPath = path.resolve(homedir(), ".config/shuttle");
let configFilePath = path.resolve(configPath, "config.json");
let logFilePath = path.resolve(configPath, "shuttle.log");
let sampleConfig

logger.info(`Using configuration ${configPath}`)

// Make sure config files exist
try {
    fs.mkdirSync(configPath, {recursive: true})
    sampleConfig = fs.readFileSync(sampleConfigPath);
    sampleConfig = JSON.parse(sampleConfig); // Make sure the sample config is usable...
    if (!fs.existsSync(configFilePath)) {
        //import sampleConfig from "../data/sample.config.json" assert { type: 'json' };
        fs.writeFileSync(configFilePath, JSON.stringify(sampleConfig, null, 4))
        logger.info(`Sample config has been written to ${configFilePath}. Please edit as needed and restart Shuttle`)
        process.exit(0)
    }
    logStream = fs.createWriteStream(logFilePath, {flags: "a"})
} catch (e) {
    logger.error("Unable to create configuration files", e)
    process.exit(2)
}

// Load config
let configuration
try {
    let rawConfig = fs.readFileSync(configFilePath);
    logger.debug("Parsing configuration")
    configuration = JSON.parse(rawConfig)
    Object.keys(sampleConfig).forEach(sampleKey => {
        if (!configuration.hasOwnProperty(sampleKey)) {
            // Missing key from config
            logger.warn(`Key missing from configuration, populating with sample: ${sampleKey}`)
            configuration[sampleKey] = sampleConfig[sampleKey]
        }
    })
    fs.writeFileSync(configFilePath, JSON.stringify(configuration, null, 4))
} catch (e) {
    console.error("Unable to read configuration files", e)
}

export {configuration}

import web from "./web.js";

web()