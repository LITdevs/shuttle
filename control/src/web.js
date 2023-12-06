import express from "express";
import NotFoundReply from "./util/Reply/NotFoundReply.js";
import limiters from "./util/rateLimit.js";
import {configuration, logger} from "./index.js";
const web = express();


// Once database reports itself as being ready start Frontend and API
export default async function start() {
    web.use("/api/*", limiters.general); // General rate limiter for all API calls
    web.use("/api/*", express.json()); // Parse json for all API calls
    web.use("/api/*", (req, res, next) => {
        // Allow CORS usage
        res.header("Access-Control-Allow-Origin", "*"); // TODO: Config option?
        res.header("Access-Control-Allow-Headers", "Authorization,*")
        res.header("Access-Control-Allow-Methods", "*")

        // Define reply method, to set status code accordingly
        res.reply = (reply) => {
            res.status(reply.request.status_code).json(reply);
        }

        next();
    })

    const api_organization = (await import("./routes/organization.js")).default;
    web.use("/api/organization", api_organization);

    web.all("/api/*", (req, res) => { // Fallback to 404
        res.reply(new NotFoundReply())
    })

    web.use(express.static("shuttle-web/dist")); // Serve react app

    // Import and initialize Database
    const Database = (await import("./db.js")).default
    const db = new Database();
    db.events.on("ready", () => {
        web.listen(configuration.webPort.value, () => {
            logger.info(`Web listening on port ${configuration.webPort.value}`)
        })
    })
}