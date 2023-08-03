import express from "express";
import bodyParser from "body-parser";
import path from "path";
import mongoose from "mongoose";
import Chart from "chart.js/auto";

import Patreon from "./models/Patreons.js";
import Loan from "./models/Loans.js";
import Book from "./models/Books.js";
import WeeklyRecords from "./models/WeeklyRecords.js";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const url = "mongodb://127.0.0.1:27017/librarydb";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database connected successfully");
    startServer();
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

let wrongCredentials = false;
let accessGranted = false;

function allowAccess(res, page, pageTitle) {
  accessGranted ?
    res.render(page, pageTitle) :
    res.render('access-denied', { pageTitle: 'Access Denied' } );
}

app.get('/', (req, res) => {
  accessGranted ?
    res.redirect('/dashboard') :
    res.render('login', { wrongCredentials: wrongCredentials, pageTitle: "Login" });
});

app.post('/', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username === 'admin' && password === 'admin') {
    accessGranted = true;
    res.redirect('/dashboard');
  } else {
    wrongCredentials = true;
    res.redirect('/');
  }
});

app.get('/dashboard', async (req, res) => {
  try {
    let loans = await Loan.find();
    let patreons = await Patreon.find();
    let books = await Book.find();
    let issued_books = await Loan.find({ returned: false });
    let overdue_returns = await Loan.find({ overdue: true, returned: false });

    let num_of_patreons = patreons.length;
    let num_of_books = books.length;
    let num_of_loans = loans.length;
    let num_of_overdue = overdue_returns.length;
    let num_of_issued = issued_books.length;

    res.render('dashboard', {
      pageTitle: 'Dashboard',
      num_of_patreons,
      num_of_books,
      num_of_loans,
      num_of_overdue,
      num_of_issued,
    });
  } catch (err) {
    console.log(err);
    res.render('error', { pageTitle: 'Error', message: 'Error fetching patreons' });
  }
});

app.get('/books-loaned', async (req, res) => {
  try {
    let loans = await Loan.find();
    let report = await WeeklyRecords.find();
    res.render('books-loaned', { pageTitle: 'Books Loaned', loans, report, i: 1 });
  } catch (err) {
    console.log(err);
    res.render('error', { pageTitle: 'Error', message: 'Error fetching patreons' });
  }
});

app.get('/add-new-loan', async (req, res) => {
  try {
    res.render('add-new-loan', { pageTitle: 'Add New Loan' })
  } catch (err) {
    
  }
})

app.get('/books-returned', async (req, res) => {
  try {
    let loans = await Loan.find();
    res.render('books-returned', { pageTitle: 'Books Returned', loans, i: 1 });
  } catch (err) {
    console.log(err);
    res.render('error', { pageTitle: 'Error', message: 'Error fetching patreons' });
  }
});

app.get('/books', async (req, res) => {
  try {
    let books = await Book.find();
    res.render('books', { pageTitle: 'Books', books, i: 1 });
  } catch (err) {
    console.log(err);
    res.render('error', { pageTitle: 'Error', message: 'Error fetching patreons' });
  }
});

app.get('/add-new-book', async (req, res) => {
  try {
    res.render('add-new-books', { pageTitle: 'Add New Book' });
  } catch (err) {
    console.log(err);
  }
})

app.post('/add-book', async (req, res) => {
  try {
    const { book_name, author, year } = req.body;

    const newBook = new Book({
      book_name,
      author,
      year,
    });

    await newBook.save();
    res.redirect('/books');
  } catch (err) {
    console.error('Error adding book:', err);
    res.redirect('/add-book?success=false');
  }
});

app.get('/book/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);
    if (!book) {
      return res.render('error', { pageTitle: 'Error', message: 'Book not found' });
    }
    res.render('book-details', { pageTitle: 'Book Details', book: book });
  } catch (err) {
    console.log(err);
    res.render('error', { pageTitle: 'Error', message: 'Error fetching book details' });
  }
});

app.get('/edit-book/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);
    if (!book) {
      return res.render('error', { pageTitle: 'Error', message: 'Book not found' });
    }
    res.render('edit-book', { pageTitle: 'Edit Book', book });
  } catch (err) {
    console.log(err);
    res.render('error', { pageTitle: 'Error', message: 'Error fetching book details' });
  }
});

app.post('/edit-book/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const { book_name, author, year } = req.body;

    // Find the book by ID and update the fields
    await Book.findByIdAndUpdate(bookId, {
      book_name,
      author,
      year,
    });

    res.redirect('/books'); // Redirect to the page that lists all books after editing
  } catch (err) {
    console.error('Error editing book:', err);
    res.redirect(`/edit-book/${req.params.id}`);
  }
});

app.post('/delete-book/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    await Book.findByIdAndDelete(bookId);
    res.redirect('/books'); // Redirect to the page that lists all books after deletion
  } catch (err) {
    console.log(err);
    res.render('error', { pageTitle: 'Error', message: 'Error deleting book' });
  }
});

app.get('/patreons', async (req, res) => {
  try {
    let patreons = await Patreon.find();
    res.render('patreons', { pageTitle: 'Patreons', patreons, i: 1 });
  } catch (err) {
    console.log(err);
    res.render('error', { pageTitle: 'Error', message: 'Error fetching patreons' });
  }
});

app.get('/add-new-patreon', async (req, res) => {
  try {
    res.render('add-new-patreon', { pageTitle: 'Add New Patreon' });
  } catch (err) {
    console.log(err);
  }
})

app.post('/add-patreon', async (req, res) => {
  try {
    const { name, reg_num, dept } = req.body;

    const newPatreon = new Patreon({
      name,
      reg_num,
      dept,
    });

    await newPatreon.save();
    res.redirect('/patreons');
  } catch (err) {
    console.error('Error adding patreon:', err);
    res.redirect('/add-new-patreon?success=false');
  }
});

app.get('/patreons/:id', async (req, res) => {
  try {
    const patreonId = req.params.id;
    const patreon = await Patreon.findById(patreonId);
    if (!patreon) {
      return res.render('error', { pageTitle: 'Error', message: 'Patreon not found' });
    }   // Render the patreon-details.ejs template and pass the patreon object as data
  res.render('patreon-details', { patreon, pageTitle: patreon.name });
  } catch (err) {
    console.error('Error fetching patreon details:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/delete-patreon', async (req, res) => {
  try {
    const patreonId = req.body.id; // Access the ID from the request body instead of route params
    await Patreon.findByIdAndDelete(patreonId);
    res.redirect('/patreons'); // Redirect to the page that lists all patreons after deletion
  } catch (err) {
    console.log(err);
    res.render('error', { pageTitle: 'Error', message: 'Error deleting patreons' });
  }
});


app.get('/report', async (req, res) => {
  try {
    let patreons = await Patreon.find();
    let loans = await Loan.find();
    res.render('report', { pageTitle: 'Report', patreons, loans, i: 1 })
  } catch (err) {
    res.render('error', { pageTitle: 'Error', message: 'Error fetching database' });
    console.log(err);
  }
});

app.get('/settings', (req, res) => {
  allowAccess(res, 'settings', { pageTitle: 'Settings' });
});

app.get('/logout', (req, res) => {
  allowAccess(res, 'logout', { pageTitle: 'Goodbye'});
  accessGranted = false;
});

function startServer() {
  app.listen(3000, () => {
    console.log("Server started on port 3000");
  });
}
