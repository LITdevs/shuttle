import mongoose from "mongoose";

const schema = new mongoose.Schema({
    displayName: String,
    email: {type: String, unique: true, required: true},
    organization: {type: mongoose.Schema.Types.ObjectId, ref: "organization"}
    // TODO: passwords and passkeys
});

export default schema;