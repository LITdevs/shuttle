export default class ReplyRequest {
    cat;
    status_code;
    success;

    constructor(statusCode, success) {
        this.status_code = statusCode;
        this.success = success;
        this.cat = `https://http.cat/${statusCode}`;
    }
}