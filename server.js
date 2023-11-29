const express = require('express');
const app = express();
const bcrypt = require('bcrypt'); //crypt password
const mysql = require('mysql2/promise');

const dbConfig = {
    host: '34.128.121.245', //ip atau nama host
    user: 'database-tanahku', // nama pengguna MySQL
    password: 'tanahku', // pw MySQL
    database: 'tanahku', // nama database MySQL
};

const pool = mysql.createPool(dbConfig);

app.use(express.json());

const users = []

//endpoint ambil data
app.get('/users', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM users');
        connection.release();

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//endpoint menambah pengguna
app.post('/users', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const connection = await pool.getConnection();
        await connection.execute('INSERT INTO users (name, password, email) VALUES (?, ?, ?)', [req.body.name, hashedPassword, req.body.email]);
        connection.release();

        res.status(201).send();
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



//endpoint proses login
app.post('/users/login', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM users WHERE name = ?', [req.body.name]);
        connection.release();

        if (rows.length === 0) {
            return res.status(400).send('Cannot find user');
        }

        const user = rows[0];

        if (await bcrypt.compare(req.body.password, user.password)) {
            res.send('Success');
        } else {
            res.send('Not allowed');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(3000);