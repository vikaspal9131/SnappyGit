const fs = require('fs');
const path = require('path');

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

exports.validateInput = (req, res, next) => {
    const { username, repoName, startDate, endDate, token } = req.body;
    const projects = getProjectList(); // always fetch projects

    if (!username || !repoName || !startDate || !endDate || !token) {
        return res.render('index', { message: 'All fields are required.', projects });
    }

    if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
        return res.render('index', { message: 'Invalid start or end date.', projects });
    }

    if (new Date(startDate) > new Date(endDate)) {
        return res.render('index', { message: 'Start date cannot be after end date.', projects });
    }

    next(); 
};
