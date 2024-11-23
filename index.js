// const fs = require("fs");

// // writing hello from nodejs to a file called message.txt
// fs.writeFile("message.txt", "hello from nodejs!", (err) => {
//   if (err) throw err;
//   console.log("The file has been saved!");
// });

// // reading from message.txt to console.log
// fs.readFile("message.txt", "utf-8", (err, data) => {
//   if (err) throw err;
//   console.log(data);
// });

import bodyParser from "body-parser";
import express from "express";
// to get full path
import { dirname } from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import sqlite3 from "sqlite3";

const app = express();
const port = 3005;
const sqlite = sqlite3.verbose();
const db = new sqlite.Database("books.db");
const bookTable = "book";

db.run(`
    CREATE TABLE IF NOT EXISTS ${bookTable} (
      bookID INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      author TEXT
    )
  `);

app.use(morgan("tiny"));
const __dirname = dirname(fileURLToPath(import.meta.url)); // getting full directory path name

// parse incoming request bodies that are URL-encoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// app.get("/", (req, res) => {
//   res.send("<h1>Hello, Pookie!</h1>");
// });

app.post("/submit", (req, res) => {
  console.log(req.body);
  // adding the user data into the books table
  db.run(`INSERT INTO ${bookTable} ` + "(title, author) " + "VALUES (?, ?)", [
    req.body.title,
    req.body.author,
  ]);

  res.render("submit.ejs", { title: req.body.title, author: req.body.author });
});

app.get("/about", (req, res) => {
  res.send("<h1>About Page</h1><p>This tracks your books!</p>");
});

app.listen(port, () => {
  console.log(`Server running on port ${3005}`);
});
