const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/create-customer', async (req, res) => {
    const { companyName, address, city, state, zipCode, country, firstName, lastName, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into Companies table
    const companyQuery = `INSERT INTO Companies (CompanyName, Address, City, State, ZipCode, Country) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(companyQuery, [companyName, address, city, state, zipCode, country], (err, result) => {
        if (err) throw err;

        const companyID = result.insertId;

        // Insert into Users table
        const userQuery = `INSERT INTO Users (FirstName, LastName, Email, PasswordHash) VALUES (?, ?, ?, ?)`;
        db.query(userQuery, [firstName, lastName, email, hashedPassword], (err, result) => {
            if (err) throw err;

            const userID = result.insertId;

            // Insert into Company_Users table
            const companyUserQuery = `INSERT INTO Company_Users (CompanyID, UserID, Role) VALUES (?, ?, 'Admin')`;
            db.query(companyUserQuery, [companyID, userID], (err) => {
                if (err) throw err;
                res.send('Customer created successfully!');
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
