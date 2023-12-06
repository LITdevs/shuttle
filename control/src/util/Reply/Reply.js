import ReplyRequest from "./ReplyRequest.js";

/**
 * @typedef {Object} IReplyOptions
 * @property {number} responseCode HTTP Response Code
 * @property {boolean} success Boolean indicating success or failure
 * @property {any} response Response object, should always have message property
 */

export default class Reply {
    response;
    request;

    /**
     * @param {IReplyOptions}options
     */
    constructor(options) {
        this.request = new ReplyRequest(options.responseCode || 200, typeof options.success === "undefined" ? true : options.success);
        this.response = options.response || { message: "OK" }
    }
}