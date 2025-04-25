// import the required packages
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// to connect to MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Qq100100Qq@%', // My SQL password
    database: 'soccerdb'
});

db.connect(err => {
if (err) {
    console.error('Database connection error:', err);
    return;
}
console.log('Successfully connected to MySQL database ✅');
});


app.get('/tournaments', (req, res) => {
  db.query('SELECT * FROM TOURNAMENT', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
});
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
