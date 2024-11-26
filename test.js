db.run(
  `INSERT INTO ${authorTable} (name) VALUES (?)`,
  [req.body.author],
  function (error) {
    if (error) {
      if (error.code === "SQLITE_CONSTRAINT") {
        // Check for unique constraint violation
        console.log("Author already exists, retrieving existing author ID...");

        // Query to get the existing author's ID
        db.get(
          `SELECT id FROM ${authorTable} WHERE name = ?`,
          [req.body.author],
          (err, row) => {
            if (err) {
              console.error(err);
              return;
            }

            const authorID = row ? row.id : null; // Get the existing author ID
            console.log("authorID (existing author): ", authorID);

            // Insert into the bookAuthor table the matching book and genre(s)
            const authorNames = req.body.author.split(",");
            authorNames.forEach((name) => {
              db.run(
                `INSERT INTO ${bookAuthorTable} (bookID, authorID) VALUES (?, ?)`,
                [bookID, authorID]
              );
            });
          }
        );
      } else {
        console.error(error); // Handle other types of errors
      }
      return;
    }

    const authorID = this.lastID; // New author inserted
    console.log("authorID (last inserted author): ", authorID);

    // Split the genres chosen
    const authorNames = req.body.author.split(",");
    authorNames.forEach((name) => {
      db.run(
        `INSERT INTO ${bookAuthorTable} (bookID, authorID) VALUES (?, ?)`,
        [bookID, authorID]
      );
    });
  }
);
