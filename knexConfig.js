const knex = require('knex');
const env = process.env.NODE_ENV;
const config = require('./knexfile')[env];

module.exports = knex(config);
