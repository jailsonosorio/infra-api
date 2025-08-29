require("dotenv").config();
const oracledb = require("oracledb");

async function getConnection() {
  return await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECTION,
    privilege: oracledb.SYSDBA   // 🔹 Aqui declaras que é SYSDBA
  });
}

module.exports = { getConnection };
