const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const commitController = require('../controllers/commitController'); 
const gitEnvMiddleware = require('../middlewares/gitEnvMiddleware'); 

// Function to get project list dynamically
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

// Home page route
router.get('/', (req, res) => {
    const projects = getProjectList();
    res.render('index', { message: null, projects });
});

// Generate commits
router.post('/generate-commits',
    gitEnvMiddleware.validateInput, 
    commitController.generateCommits
);

// Success page
router.get('/success', (req, res) => {
    res.render('success');
});

module.exports = router;
