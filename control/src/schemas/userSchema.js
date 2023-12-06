import mongoose from "mongoose";
import Role from "../util/Role.js";

const schema = new mongoose.Schema({
    displayName: {type: String},
    email: {type: String, unique: true, required: true},
    organization: {type: mongoose.Schema.Types.ObjectId, ref: "organization"},
    password: {type: String},
    role: {type: Number, max: Role.ORG_ADMIN, min: Role.CONTRIBUTOR, default: Role.CONTRIBUTOR}
    // TODO: passkeys
});

export default schema;