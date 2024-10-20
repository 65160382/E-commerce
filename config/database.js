const mysql = require('mysql2')

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ecommerce", // ชื่อฐานข้อมูล
  });
  
// เชื่อมต่อฐานข้อมูล
db.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      return;
    }
    console.log("Connected to the database");
});

module.exports = db;