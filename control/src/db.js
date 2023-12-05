import mongoose from 'mongoose';
import EventEmitter from "events";
import {configuration, logger} from "./index.js";
import userSchema from "./schemas/userSchema.js";
import organizationSchema from "./schemas/organizationSchema.js";

export default class Database {

    static _instance;
    connected = false;

    db;
    events = new EventEmitter();

    User;
    Organization;

    constructor() {
        if (typeof Database._instance === "object") return Database._instance;
        Database._instance = this;

        // Connect to the database
        const DB_URI = configuration.mongoUri.value;
        if (typeof DB_URI === "undefined") {
            logger.error("\nmongoUri not found, Exiting...");
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
        this.User = this.db.model("user", userSchema);
        this.Organization = this.db.model("organization", organizationSchema)
        this.events.emit("ready");
    }
}