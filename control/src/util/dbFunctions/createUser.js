import Database from "../../db.js";
import Role from "../Role.js";
import bcrypt from "bcrypt";

const db = new Database();

export default async function createUser(email, password, organization, role = Role.CONTRIBUTOR, username = undefined) {
    const salt = await bcrypt.genSalt(12)
    let user = new db.User({
        displayName: username || email.split("@")[0],
        email: email,
        organization: organization,
        password: await bcrypt.hash(password, salt),
        role: role
    })

    await user.save();
    return user;
}