const express = require('express');
const router = express.Router();
const commitController = require('../controllers/commitController'); 
const gitEnvMiddleware = require('../middlewares/gitEnvMiddleware'); 


router.get('/', (req, res) => {
    res.render('index', { message: null }); 
});


router.post('/generate-commits',
    gitEnvMiddleware.validateInput, 
    commitController.generateCommits 
);


router.get('/success', (req, res) => {
    res.render('success'); 
});

module.exports = router;