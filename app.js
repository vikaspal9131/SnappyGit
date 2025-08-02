const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const githubRoutes = require('./routes/github');

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', githubRoutes);

// Handle 404 errors
app.use((req, res) => {
    res.status(404).render('404', { message: 'Page not found' });
});

// Global error handler (Optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('index', { message: 'Something went wrong!', projects: [] });
});

app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});
