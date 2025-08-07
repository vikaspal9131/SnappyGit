const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const githubRoutes = require('./routes/github');
const firebaseConfigRoute = require("./routes/firebaseConfig");
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so frontend Firebase SDK can access
app.use(cors());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }
}));

// Routes
app.use('/', githubRoutes);
app.use('/login', firebaseConfigRoute);

// Extra route to send Firebase config from env to frontend
app.get('/firebase-config', (req, res) => {
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    });
});

// 404
app.use((req, res) => {
    res.status(404).render('404', { message: 'Page not found' });
});

// Error handler
app.use((err, req, res, next) => {
    res.status(500).render('index', { message: 'Something went wrong!' });
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
