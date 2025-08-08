const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const cors = require('cors');

const githubRoutes = require('./routes/github');
const firebaseConfigRoute = require("./routes/firebaseConfig");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1️⃣ CORS middleware (sabse pehle)
app.use(cors({
  origin: ["https://snappy-git.vercel.app"], // trailing slash mat lagana
  credentials: true
}));

// 2️⃣ Session middleware (sirf ek baar)
app.use(session({
  secret: 'your_secret', // apna secret rakho
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,       // production me true (Vercel pe HTTPS hota hai)
    sameSite: 'none',   // cross-site auth ke liye
    maxAge: 600000      // optional: 10 min
  }
}));

// 3️⃣ Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4️⃣ View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 5️⃣ Static files
app.use(express.static(path.join(__dirname, 'public')));

// 6️⃣ Routes
app.use('/', githubRoutes);
app.use('/login', firebaseConfigRoute);

// 7️⃣ 404 handler
app.use((req, res) => {
  res.status(404).render('404', { message: 'Page not found' });
});

// 8️⃣ Error handler
app.use((err, req, res, next) => {
  res.status(500).render('index', { message: 'Something went wrong!' });
});

// 9️⃣ Server start
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
