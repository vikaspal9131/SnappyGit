// app.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const githubRoutes = require('./routes/github');

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/', githubRoutes); 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});