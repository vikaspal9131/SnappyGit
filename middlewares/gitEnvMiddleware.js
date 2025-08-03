const fs = require('fs');
const path = require('path');
const axios = require('axios');

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

exports.validateInput = async (req, res, next) => {
    const { username, repoName, startDate, endDate, token } = req.body;
    const projects = getProjectList();

   
    if (!username || !repoName || !startDate || !endDate || !token) {
        return res.render('index', { message: ' All fields are required.', projects });
    }

    const safePattern = /^[a-zA-Z0-9._-]+$/;
    if (!safePattern.test(username)) {
        return res.render('index', { message: 'Invalid characters in GitHub username.', projects });
    }
    if (!safePattern.test(repoName)) {
        return res.render('index', { message: 'Invalid characters in repository name.', projects });
    }

    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.render('index', { message: 'nvalid start or end date.', projects });
    }
    if (start > end) {
        return res.render('index', { message: 'Start date cannot be after end date.', projects });
    }
    if (end > today) {
        return res.render('index', { message: 'Future dates are not allowed.', projects });
    }

 
    try {
        const authCheck = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `token ${token}` }
        });
        if (!authCheck.data.login) {
            return res.render('index', { message: 'Invalid GitHub token.', projects });
        }
    } catch {
        return res.render('index', { message: 'GitHub token is invalid or expired.', projects });
    }

    
    try {
        await axios.get(`https://api.github.com/repos/${username}/${repoName}`, {
            headers: { Authorization: `token ${token}` }
        });
    } catch {
        return res.render('index', { message: ' GitHub repository not found or no access.', projects });
    }

    next();
};
