const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');   // ✅ Session module
const githubRoutes = require('./routes/github');
const firebaseConfigRoute = require("./routes/firebaseConfig");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session setup
app.use(session({
    secret: 'secret-key', // ⚠️ Production me strong secret use karein
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 } // session expiry (10 min)
}));

// ✅ Routes
app.use('/', githubRoutes);
app.use('/login', firebaseConfigRoute);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { message: 'Page not found' });
});

// 500 Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('index', { message: 'Something went wrong!' });
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});
