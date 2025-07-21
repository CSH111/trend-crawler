import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();
export const zzz = 1234;
export const db = mysql.createConnection({
  host: process.env.DATABASE_URL,
  user: "root",
  password: process.env.DB_PW,
  database: "keyword_db",
  port: "3306",
});
db.connect((e) => {
  if (e) {
    console.log("connection FAIL!!!!!");
    console.log("e", e);
    return;
  }
  console.log("mysql connected~");
});
