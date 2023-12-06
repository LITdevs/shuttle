import Reply from "./Reply.js";

export default class UnauthorizedReply extends Reply {
    /**
     * Accept an object or a string
     * If a string is passed, it will be used as the message
     * If an object is passed, it will be used as the response directly
     * @param {string|object}response
     */
    constructor(response = "Unauthorized") {
        let replyResponse;
        if (typeof response === "string") replyResponse = { message: response };
        else replyResponse = response;
        super({
            responseCode: 401,
            success: false,
            response: replyResponse
        });
    }
}