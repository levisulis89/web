const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3001;

// Statikus fájlok kiszolgálása
app.use('/img', express.static(path.join(__dirname, 'public/img')));
 // A public mappában lévő fájlok, mint a hangok és képek

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL adatbázis kapcsolat
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Ha más felhasználónév/jelszó van, ezt cseréld le
    password: '', // Ha van jelszó, itt add meg
    database: 'registration' // Győződj meg róla, hogy ez az adatbázis létezik
});

// Adatbázis kapcsolat ellenőrzése
db.connect((err) => {
    if (err) {
        console.error('MySQL kapcsolódási hiba: ', err);
        return;
    }
    console.log('MySQL kapcsolódva!');
});

// Regisztrációs végpont
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('Minden mezőt ki kell tölteni!');
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

    db.query(sql, [name, email, hashedPassword], (err) => {
        if (err) {
            console.error('Adatbázis hiba: ', err);
            return res.status(500).send('Adatbázis hiba: ' + err);
        }
        res.send({ success: true, message: 'Sikeres regisztráció!' });
    });
});

// Bejelentkezés végpont
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';

    db.query(sql, [email, hashedPassword], (err, result) => {
        if (err) {
            console.error('Hiba a bejelentkezés során: ', err);
            return res.status(500).send('Hiba történt a bejelentkezés során.');
        }
        if (result.length > 0) {
            res.send({ success: true, message: 'Sikeresen bejelentkezett!' });
        } else {
            res.send({ success: false, message: 'Hibás email vagy jelszó!' });
        }
    });
});

// Szerver indítása
app.listen(port, () => {
    console.log(`Szerver fut a ${port} porton.`);
});
