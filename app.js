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

app.use(cors({
  origin: ["https://snappy-git.vercel.app"], 
  credentials: true
}));

app.use(session({
  secret: '@#ksjdfsadfiojiwewr3kasdjflioe',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,  // local test ke liye
    sameSite: 'lax',
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
  res.status(500).render('index', { message: 'Something went wrong!' });
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
