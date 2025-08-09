const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const commitController = require('../controllers/commitController'); 
const gitEnvMiddleware = require('../middlewares/gitEnvMiddleware'); 

function getProjectList() {
    const projectPath = path.join(__dirname, '..', 'projects');
    let projectList = [];
    if (fs.existsSync(projectPath)) {
        projectList = fs.readdirSync(projectPath)
            .filter(file => file.endsWith('.zip'))
            .map(file => file.replace('.zip', ''));
    }
    return projectList;
}

router.get("/", (req, res) => {
    const projects = getProjectList();

    res.render("index", { 
        message: null, 
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

router.post('/generate',
    gitEnvMiddleware.validateInput, 
    commitController.generateCommits
);

router.get('/success', (req, res) => {
    res.render('success');
});


module.exports = {
    router,
    getProjectList
};
