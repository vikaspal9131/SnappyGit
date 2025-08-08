const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');   
const githubRoutes = require('./routes/github');
const firebaseConfigRoute = require("./routes/firebaseConfig");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


// 1️⃣ CORS middleware sabse pehle
app.use(cors({
  origin: ["https://snappy-git.vercel.app/"], // Vercel ka domain
  credentials: true
}));

// 2️⃣ Session middleware CORS ke baad
app.use(session({
  secret: 'your_secret', // apna secret rakho
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // production me true
    sameSite: 'none'   // cross-site auth ke liye none
  }
}));


// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret-key', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 } 
}));


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
