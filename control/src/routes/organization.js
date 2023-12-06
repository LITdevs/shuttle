import {Router} from "express";
import RequiredProperties from "../util/RequiredProperties.js";
import limiters from "../util/rateLimit.js";
import Database from "../db.js";
import createUser from "../util/dbFunctions/createUser.js";
import Role from "../util/Role.js";
import Reply from "../util/Reply/Reply.js";

let router = new Router()
let db = new Database()

router.post("/", RequiredProperties([
    {
        property: "contactEmail",
        type: "string",
        regex: /^[^@]+@[^@]+\.[^@]+$/ // a@a.a
    },
    {
        property: "adminEmail",
        type: "string",
        regex: /^[^@]+@[^@]+\.[^@]+$/ // a@a.a
    },
    {
        property: "orgName",
        type: "string"
    },
    {
        property: "username",
        type: "string"
    },
    {
        property: "password",
        type: "string"
    }
]), limiters.orgCreate, async (req, res) => {
    // Create organization and ORG_ADMIN level user in it
    let org = new db.Organization({
        displayName: req.body.orgName.trim(),
        contactEmail: req.body.contactEmail.trim()
    })
    await org.save();
    let user = await createUser(req.body.adminEmail, req.body.password, org._id, Role.ORG_ADMIN, req.body.username)
    res.reply(new Reply({
        response: {
            message: "Organization and admin account created",
            organization: org
        }
    }))
})

export default router