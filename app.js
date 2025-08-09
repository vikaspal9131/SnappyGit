const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const { router: githubRoutes, getProjectList } = require('./routes/github');
const firebaseConfigRoute = require("./routes/firebaseConfig");
const isProduction = process.env.NODE_ENV === 'production';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not set in environment variables!");
}
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, 
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 600000 
  }
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', githubRoutes);
app.use('/login', firebaseConfigRoute);


app.use((req, res) => {
  res.status(404).render('404', { message: 'Page not found' });
});


app.use((err, req, res, next) => {
  const projects = getProjectList(); 
  res.status(500).render('index', {
    message: 'Something went wrong!',
    projects,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
