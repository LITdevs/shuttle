const Role = {
    ORG_ADMIN: 9, // Can do anything in the organization
    DSP_ADMIN: 8, // Can do anything a contributor can, but also manage data source plugins
    CONTRIBUTOR: 7, // Can manage public pages, incident logs and schedule planned maintenance
}

export default Role