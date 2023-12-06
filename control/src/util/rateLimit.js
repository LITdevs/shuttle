import {configuration} from "../index.js";
import rateLimit from "express-rate-limit";
import RateLimitReply from "./Reply/RateLimitReply.js";

/**
 * Return the client IP for use as key in rate limiter
 * @param req
 * @param res
 */
const keyGen = (req, res) => {
    if (configuration.trustProxy.value) {
        return req.headers[configuration.trustProxy.value]
    } else {
        return req.ip || req.socket.remoteAddress
    }
}

function genOptions(windowMs, max) {
    return {
        windowMs: windowMs,
        max: max,
        standardHeaders: true,
        legacyHeaders: false,
        skipFailedRequests: true,
        requestWasSuccessful: (req, res) => res.statusCode < 400,
        keyGenerator: keyGen,
        handler: (req, res, next, options) => {
            res.reply(new RateLimitReply())
        }
    }
}

const limiters = {
    general: rateLimit(genOptions(10 * 1000, 100)), // 100/10s
    orgCreate: rateLimit(genOptions(30* 60 * 1000, 1)) // 1/30m
}
export default limiters