import bodyParser from "body-parser";
import express from "express";
// to get full path
import { dirname } from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import sqlite3 from "sqlite3";
// import { request } from "http";

const app = express();
const port = 3005;
const sqlite = sqlite3.verbose();
const db = new sqlite.Database("books.db");
const bookTable = "book";
const genreTable = "genre";
const bookGenreTable = "bookGenre";
const authorTable = "author";
const bookAuthorTable = "bookAuthor";

// creating a table with the types of genres
db.run(
  `CREATE TABLE IF NOT EXISTS ${genreTable}(
    genreCode INTEGER PRIMARY KEY,
    genreName TEXT
  );
    `
);

// creating a table with the books
db.run(
  `CREATE TABLE IF NOT EXISTS ${bookTable} (
      bookID INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      year INTEGER
    );`
);

// creating the table that stores all the authors of books in the database
db.run(
  `CREATE TABLE IF NOT EXISTS ${authorTable}(
    authorID INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );`
);

// creating an N:N table that matches books to their genre(s)
db.run(`CREATE TABLE IF NOT EXISTS ${bookGenreTable}(
    bookID INTEGER,
    genreCode INTEGER,
    PRIMARY KEY (bookID, genreCode)
  );`);

// creating an N:M table that matches books to their author(s)
db.run(`CREATE TABLE IF NOT EXISTS ${bookAuthorTable}(
    bookID INTEGER,
    authorID INTEGER,
    PRIMARY KEY (bookID, authorID)
  );`);

// inserting into the genre table the possible genres
db.run(`INSERT OR IGNORE INTO ${genreTable} (genreCode, genreName) VALUES
  (1, 'Fantasy'),
  (2, 'Romance'), 
  (3, 'Science Fiction'),
  (4, 'Dystopian'),
  (5, 'Action/Adventure'),
  (6, 'Mystery'),
  (7, 'Horror'),
  (8, 'Thriller'),
  (9, 'Historical Fiction'),
  (10, 'LGBTQ+'),
  (11, 'Literary Fiction'),
  (12, 'Graphic Novel and Manga'),
  (13, 'Short Story'),
  (14, 'Memoir/Biography'),
  (15, 'Business'),
  (16, 'Food and Drink'),
  (17, 'Art/Photography'),
  (18, 'Self-help'),
  (19, 'History'),
  (20, 'Travel'),
  (21, 'True Crime'),
  (22, 'Humour'),
  (23, 'Religion/Spirituality'),
  (24, 'Science & Technology'),
  (25, 'Fairy Tale, Fables, Folk Tales'),
  (26, 'Contemporary'),
  (27, 'Poetry');

`);

app.use(morgan("tiny"));
const __dirname = dirname(fileURLToPath(import.meta.url)); // getting full directory path name

// parse incoming request bodies that are URL-encoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// when the user submits new book information
app.post("/submit", (req, res) => {
  console.log("req.body:", req.body);

  db.run(
    // submit the new book info into the books table
    `INSERT INTO ${bookTable} (title, year) VALUES (?, ?)`,
    [req.body.title, req.body.year],
    function (err) {
      if (err) {
        console.error(err);
        return;
      }
      // access the bookID (primary key) of this book
      const bookID = this.lastID;
      console.log("bookID (last inserted book): ", bookID);

      // split the genres chosen
      const genres = req.body.genres.split(",");
      // insert into the bookGenre table the matching book and genre(s)
      genres.forEach((genre) => {
        db.run(
          `INSERT INTO ${bookGenreTable} (bookID, genreCode) VALUES (?, (SELECT genreCode FROM ${genreTable} WHERE genreName = ?))`,
          [bookID, genre]
        );
      });

      // split the author names if there's more than one
      // const authorNames = req.body.author.split(",");
      const authorNames = req.body.author.split(",").map((name) => name.trim());
      console.log('author names (spaces removed): "', authorNames, '"');

      // looping through all the entered authors
      authorNames.forEach((name) => {
        // inserting the author into the author table
        db.run(
          // try inserting the author's name into the table
          `INSERT INTO ${authorTable} (name) VALUES (?)`,
          [name],
          function (error) {
            if (error) {
              // if the author already exists, an SQLITE_CONSTRAINT will occur, if so...
              if (error.code === "SQLITE_CONSTRAINT") {
                // log that the author already exists
                console.log(
                  "Author already exists, retreiving existing authorID..."
                );

                // get the authorID of the existing author from the author table
                db.get(
                  `SELECT authorID FROM ${authorTable} WHERE name = ?`,
                  [name],
                  (err, row) => {
                    if (err) {
                      console.error(err);
                      return;
                    }

                    // atore the ID into an authorID var
                    const authorID = row ? row.authorID : null; // getting the existing author ID
                    console.log("authorID (existing author): ", authorID);

                    // // split the author names if there's more than one
                    // const authorNames = req.body.author.split(",");

                    // insert the authorID and bookID into the N:N bookAuthor relationaship table
                    db.run(
                      `INSERT INTO ${bookAuthorTable} (bookID, authorID) VALUES (?, ?)`,
                      [bookID, authorID]
                    );
                  }
                );
                // otherwise if another error occured, log it, and return
              } else {
                console.error(error);
                return;
              }
              // otherwise if no error occured (i.e., the author doesn't already exist in the table)
            } else {
              // get the primary key of the most recent entry in author and store it into the authorID var
              const authorID = this.lastID;
              console.log("authorID (last inserted author): ", authorID);

              // // split the genres chosen
              // const authorNames = req.body.author.split(",");
              // insert into the bookGenre table the matching book and genre(s)

              db.run(
                `INSERT INTO ${bookAuthorTable} (bookID, authorID) VALUES (?, ?)`,
                [bookID, authorID]
              );
            }

            // // send the information to submit to output the newly added book details
            // res.render("submit.ejs", {
            //   title: req.body.title,
            //   author: req.body.author,
            //   year: req.body.year,
            //   genre: genres,
            // });
          }
        );
      });

      // send the information to submit to output the newly added book details
      res.render("submit.ejs", {
        title: req.body.title,
        author: req.body.author,
        year: req.body.year,
        genre: genres,
      });
    }
  );
});

// lists all the books when the user goes to the List all Books page
app.get("/list-books", (req, res) => {
  db.all(
    `SELECT b.bookID, b.title as bookTitle, GROUP_CONCAT(a.name, ', ') as authorName
    FROM ${bookTable} b 
    NATURAL JOIN bookAuthor ba
    NATURAL JOIN author a
    GROUP BY bookID`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Error fetching data: ", err);
        return;
      }

      // log the retrieved data
      console.log("Books: ", rows);
      // sending rows - an object with the title and author as the keys  - to list-books.ejs to display the books
      res.render("list-books.ejs", { books: rows });
    }
  );
});

// when the user searches for a book (by title? or in general?)
app.get("/search", (req, res) => {
  const requestedBook = req.query.title;
  console.log("requestedBook: ", requestedBook);

  // gets the bookID and everything we want to display based on the title (the book title is the filter)
  // concatenates all the genres into one string (for output) and names it under the alias of "genres"
  // groups the information together by their bookID (the primary key since it's unique)

  if (!requestedBook) {
    // sending rows - an object with the title and author as the keys  - to list-books.ejs to display the books
    res.render("search.ejs", {
      // books: null,
      // genres: null,
      // authors: null,
      searched: !!requestedBook,
      // title: requestedBook,
    });
    return;
  }

  console.log("at 1");
  db.all(
    `SELECT b.bookID, b.title, b.year
    FROM book b
    WHERE b.title = ?
    GROUP BY b.bookID
	`,
    [requestedBook],
    (err, rows) => {
      if (err) {
        console.error("Error fetching data: ", err);
        return;
      }
      console.log("at 2");

      db.all(
        `SELECT GROUP_CONCAT(genreName, ", ") AS genreList FROM (
          SELECT DISTINCT b.bookID as bookID, g.genreCode as genreCode, g.genreName AS genreName
          FROM book b
          NATURAL JOIN bookGenre bg
          NATURAL JOIN genre g
          WHERE b.title = ?
		     )  GROUP BY bookID;`,
        [requestedBook],
        (err, genre) => {
          if (err) {
            console.error("Error fetching data: ", err);
            return;
          }
          console.log("at 3");

          db.all(
            `
            SELECT GROUP_CONCAT(author, ", ") AS authorName FROM (
              SELECT DISTINCT b.bookID AS bookID, a.authorID as authorID, a.name AS author
              FROM book b
              NATURAL JOIN bookAuthor ba
              NATURAL JOIN author a
              WHERE b.title = ?
			        GROUP BY authorID
            ) GROUP BY bookID`,
            [requestedBook],
            (err, author) => {
              if (err) {
                console.error("Error fetching data: ", err);
                return;
              }

              // log the retrieved data
              console.log(
                "Book Requested: ",
                rows,
                "\nGenres: ",
                //genre[0].genreList,
                "\nAuthor Name: "
                //author[0].authorName
              );

              // sending rows - an object with the title and author as the keys  - to list-books.ejs to display the books
              res.render("search.ejs", {
                books: rows,
                genres: genre,
                authors: author,
                searched: !!requestedBook,
                title: requestedBook,
              });
            }
          );
        }
      );
    }
  );
});

// run this on port 3005
app.listen(port, () => {
  console.log(`Server running on port ${3005}`);
});
