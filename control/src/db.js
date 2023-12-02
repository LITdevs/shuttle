import mongoose from 'mongoose';
import EventEmitter from "events";
import agentDatapointSchema from "./schemas/agentDatapointSchema.js";
import {configuration, logger} from "./index.js";

export default class Database {

    static _instance;
    connected = false;

    db;
    events = new EventEmitter();

    AgentDatapoint;

    constructor() {
        if (typeof Database._instance === "object") return Database._instance;
        Database._instance = this;

        // Connect to the database
        const DB_URI = configuration.mongoUri.value;
        if (typeof DB_URI === "undefined") {
            console.error("\nMONGODB_URI not found, Exiting...");
            process.exit(3);
        }

        this.db = mongoose.createConnection(DB_URI);

        this.db.once("open", () => {
            this.#onOpen();
            this.connected = true;
        })
    }

    #onOpen() {
        logger.debug("MongoDB connection established");
        this.AgentDatapoint = this.db.model('agentDatapoint', agentDatapointSchema);
        this.events.emit("ready");
    }
}