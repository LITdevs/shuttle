// RequiredProperties.ts ported to js
// from https://github.com/jumpsca-re/jumpsca.re-api/blob/prod/src/util/middleware/RequiredProperties.ts
// or https://github.com/LITdevs/LITidentity/blob/prod/src/util/RequiredProperties.ts
// or https://github.com/LITdevs/Lightquark/blob/dev/src/util/RequiredProperties.ts
// Original creation by... me.. somewhere
import BadRequestReply from "./Reply/BadRequestReply.js";

/**
 * @typedef {Object} IRequiredProperty
 * @property {string} property
 * @property {string|undefined} type
 * @property {boolean|undefined} optional
 * @property {number|undefined} min
 * @property {number|undefined} max
 * @property {number|undefined} minLength
 * @property {number|undefined} maxLength
 * @property {boolean|undefined} trim
 * @property {string[]|undefined} enum
 * @property {RegExp|undefined} regex
 * @property {boolean|undefined} isArray
 * @property {(value: any) => {pass: boolean, reason: string}|undefined} custom
 */

/**
 *
 * @param {(string|IRequiredProperty)[]} strings
 * @returns {(function(*, *, *): void)|*} Express middleware
 * @constructor
 */
export default function RequiredProperties(strings) {
    return (req, res, next) => {
        /** @type {string[]} */
        let missingProperties = [];
        /** @type {{property : string, reason: string}[]} */
        let propertyViolations = [];

        strings.forEach((string) => {
            // If the property is a string, just check if it exists
            if (typeof string === "string") {
                if (typeof req.body[string] === "undefined") {
                    // Not found in body, check query
                    if (typeof req.query[string] !== "undefined") {
                        // Property found in query! Put it in the body and continue to next property
                        req.body[string] = req.query[string];
                        return;
                    }
                    // Property not found in body or query, add it to the missing properties list
                    missingProperties.push(string);
                }
            } else {

                // Check present
                // Essentially what is going on here is that:
                // Check if the property is there, put it into body if it is found in query
                // If it is not there, add it to the missing properties list if it is not optional
                // I can't figure out why this hurts my brain so much, it is really quite simple
                if (typeof req.body[string.property] === "undefined") {
                    // Not found in body, check query
                    if (typeof req.query[string.property] !== "undefined") {
                        // Property found in query! Put it in the body and continue
                        req.body[string.property] = req.query[string.property];
                    } else {
                        // Property not found in body or query, add it to the missing properties list
                        if (!string.optional) {
                            missingProperties.push(string.property)
                        }
                        return;
                    }
                }

                // Check type
                if (string.type) {
                    if (typeof req.body[string.property] !== string.type) {
                        propertyViolations.push({property: string.property, reason: `${string.property} must be of type ${string.type}`});
                    }
                }

                // Check regex
                if (string.regex) {
                    if (!string.regex.test(req.body[string.property])) {
                        propertyViolations.push({property: string.property, reason: `${string.property} must match regex ${string.regex}`});
                    }
                }

                // Check min
                if (typeof string.min !== "undefined") {
                    if (typeof req.body[string.property] !== "number") {
                        propertyViolations.push({property: string.property, reason: `${string.property} must be a number`});
                    }
                    if (req.body[string.property] < string.min) {
                        propertyViolations.push({property: string.property, reason: `${string.property} must be greater than ${string.min}`});
                    }
                }

                // Check max
                if (typeof string.max !== "undefined") {
                    if (typeof req.body[string.property] !== "number") {
                        propertyViolations.push({property: string.property, reason: `${string.property} must be a number`});
                    }
                    if (req.body[string.property] > string.max) {
                        propertyViolations.push({property: string.property, reason: `${string.property} must be less than ${string.max}`});
                    }
                }

                // Check min length
                if (typeof string.minLength !== "undefined") {
                    if (string.trim) {
                        if (req.body[string.property].trim().length < string.minLength) {
                            propertyViolations.push({property: string.property, reason: `${string.property} must be longer than ${string.minLength} characters`});
                        }
                    } else {
                        if (req.body[string.property].length < string.minLength) {
                            propertyViolations.push({property: string.property, reason: `${string.property} must be longer than ${string.minLength} characters`});
                        }
                    }
                }

                // Check max length
                if (typeof string.maxLength !== "undefined") {
                    if (string.trim) {
                        if (req.body[string.property].trim().length > string.maxLength) {
                            propertyViolations.push({property: string.property, reason: `${string.property} must be shorter than ${string.maxLength} characters`});
                        }
                    } else {
                        if (req.body[string.property].length > string.maxLength) {
                            propertyViolations.push({property: string.property, reason: `${string.property} must be shorter than ${string.maxLength} characters`});
                        }
                    }
                }

                // Check enum
                if (string.enum) {
                    if (!string.enum.includes(req.body[string.property])) {
                        propertyViolations.push({property: string.property, reason: `${string.property} must be one of the following: ${string.enum.join(", ")}`});
                    }
                }

                // Check isArray
                if (string.isArray) {
                    if (!Array.isArray(req.body[string.property])) {
                        propertyViolations.push({property: string.property, reason: `${string.property} must be an array`});
                    }
                }

                // Check custom
                if (string.custom) {
                    let result = string.custom(req.body[string.property]);
                    if (!result.pass) {
                        propertyViolations.push({property: string.property, reason: `${string.property} failed validation: ${result.reason}`});
                    }
                }
            }
        })
        if (missingProperties.length > 0) {
            res.reply(new BadRequestReply({
                message: "Missing required properties",
                missing: missingProperties
            }));
            return;
        }
        if (propertyViolations.length > 0) {
            res.reply(new BadRequestReply({
                message: "Property validation failed",
                violations: propertyViolations
            }));
            return;
        }
        next();
    }
}