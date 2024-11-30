const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: "postgres",             // Your database username
  host: "localhost",            // Your database host
  database: "lefttorium",       // Your database name
  password: "root",             // Your database password
  port: 5432,                   // Default PostgreSQL port
});

module.exports = pool;
