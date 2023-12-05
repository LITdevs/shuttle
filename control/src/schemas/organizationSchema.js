import mongoose from "mongoose";

const schema = new mongoose.Schema({
    displayName: {type: String, required: true},
    contactEmail: {type: String, required: true}
});

export default schema;