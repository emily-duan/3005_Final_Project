CREATE TABLE IF NOT EXISTS books (
      bookID INTEGER PRIMARY KEY,
      title TEXT,
      author TEXT,
      year INTEGER
    );


CREATE TABLE IF NOT EXISTS author (
      authorID INTEGER PRIMARY KEY,
      name TEXT
    );


INSERT OR IGNORE INTO bookGenre (name) VALUES
	("Sarah J. Maas"),
	("Micha Nemerever"),
	("Chloe Gong"),
	("J.K Rowling"),
	("Elle Kennedy"),
	("Donna Tart"),
	("Tamara Ireland Stone"),
	("Taylor Jenkins Reid"),
	("Lauren Asher"),
	("Jennette McCurdy"),
	("George R.R Martin");

INSERT OR IGNORE INTO books (title, author, year) VALUES
    ("Throne of Glass", "Sarah J. Maas", 2012),
    ("These Violent Delights", "Micah Nemerever", 2020),
    ("These Violent Delights", "Chloe Gong", 2020),
    ("Harry Potter and the Sorcerer's Stone", "J.K. Rowling", 1997),
    ("Harry Potter and the Chamber of Secrets", "J.K. Rowling", 1998),
    ("Harry Potter and the Prisoner of Azkaban", "J.K. Rowling", 1999),
    ("Harry Potter and the Goblet of Fire", "J.K. Rowling", 2000),
    ("Harry Potter and the Order of the Pheonix", "J.K. Rowling", 2003),
    ("Harry Potter and the Half-Blood-Prince", "J.K. Rowling", 2005),
    ("Harry Potter and the Deathly Hallows", "J.K. Rowling", 2007),
    ("Harry Potter and the Cursed Child", "J.K. Rowling", 2016),
    ("The Deal", "Elle Kennedy", 2015),
    ("The Secret History", "Donna Tartt", 1992),
    ("Kingdom of Ash", "Sarah J. Maas",  2018),
    ("Every Last Word", "Tamara Ireland Stone", 2015),
    ("The Seven Husbands of Evelyn Hugo", "Taylor Jenkins Reid",  2017),
    ("Collided", "Lauren Asher",  2020),
    ("I'm Glad My Mom Died", "Jennette McCurdy", 2022),
    ("Daisy Jones and the Six", "Taylor Jenkins Reid",  2019)
    ("Our Violent Ends", "Chloe Gong", 2021),
	("Game of Thrones", "George R.R Martin", 1996 );


INSERT OR IGNORE INTO ${genreTable} (genreCode, genreName) VALUES
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

-- selects all books where the word "Throne" is in it like Throne of Glass and Game of Thrones
SELECT title FROM books WHERE title LIKE '%Throne%';

-- select all the books (their title and author)
SELECT b.bookID, b.title as bookTitle, GROUP_CONCAT(a.name, ', ') as authorName
    FROM ${bookTable} b 
    NATURAL JOIN bookAuthor ba
    NATURAL JOIN author a
    GROUP BY bookID




SELECT  GROUP_CONCAT(second.genres, ", ") FROM (
	SELECT DISTINCT first.genres FROM (
		SELECT b.bookID, a.name AS authorName, b.title, b.year, g.genreName AS genres
			FROM book b
			NATURAL JOIN bookGenre bg
			NATURAL JOIN genre g
			  NATURAL JOIN bookAuthor ba
			  NATURAL JOIN author a
			WHERE b.title = "Throne of Glass"
			GROUP BY b.bookID, authorName, genres) first
	) second





  SELECT GROUP_CONCAT(second.genres, ", ") AS genreList FROM (
	SELECT DISTINCT first.genres FROM (
		SELECT b.bookID, a.name AS authorName, b.title, b.year, g.genreName AS genres
			FROM book b
			NATURAL JOIN bookGenre bg
			NATURAL JOIN genre g
			  NATURAL JOIN bookAuthor ba
			  NATURAL JOIN author a
			WHERE b.title = ?
			GROUP BY b.bookID, authorName, genres) first
	) second