const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');


const commitMessages = [
    "update project files and improvements",
    "refactor: minor code structure improvements",
    "fix: small bug fixes and adjustments",
    "chore: clean up unused code",
    "docs: update comments and documentation",
    "style: adjust formatting and spacing",
    "improve error handling for better stability",
    "update dependencies and config files",
    "add small feature improvements",
    "remove redundant code for optimization",
    "refactor: simplify function logic",
    "minor UI/UX improvements in project",
    "optimize code for performance",
    "fix: adjust function parameters for clarity",
    "update configuration settings",
    "cleanup: remove console logs and unused vars",
    "docs: improve inline comments",
    "enhance code readability",
    "update project structure for better maintainability",
    "refactor: split code into smaller functions",
    "fix typo in variable names",
    "update build files and scripts",
    "improve project folder organization",
    "refactor: improve naming conventions",
    "small tweaks and code enhancements",
    "optimize loops and conditional checks",
    "adjust project settings for stability",
    "update imports and exports in modules",
    "fix warnings in codebase",
    "general maintenance and updates"
];

exports.generateCommits = async (req, res) => {
    const { username, repoName, startDate, endDate, token, projectName, commitsPerDay } = req.body;

    if (!username || !repoName || !startDate || !endDate || !token || !projectName) {
        return res.render('index', { message: 'Please provide all required fields.' });
    }

    //  Initialize session storage for current user
    if (!req.session.userProcesses) {
        req.session.userProcesses = [];
    }

    const tempRepo = path.join(__dirname, '..', `temp_repo_${Date.now()}`);
    const projectZip = path.join(__dirname, '..', 'projects', `${projectName}.zip`);
    const start = new Date(startDate);
    const end = new Date(endDate);

    //  Take commits/day from user (default 5, max 10)
    let commitsPerDayInput = parseInt(commitsPerDay) || 5;
    const maxCommitsPerDay = Math.min(commitsPerDayInput, 10);

    try {
        if (fs.existsSync(tempRepo)) fs.rmSync(tempRepo, { recursive: true, force: true });
        fs.mkdirSync(tempRepo);

        if (!fs.existsSync(projectZip)) {
            return res.render('index', { message: 'Selected project not found on server.' });
        }
        const zip = new AdmZip(projectZip);
        zip.extractAllTo(tempRepo, true);

        //  Init repo
        execSync('git init', { cwd: tempRepo });
        execSync('git branch -M main', { cwd: tempRepo });
        execSync(`git remote add origin https://github.com/${username}/${repoName}.git`, { cwd: tempRepo });

        try {
            execSync('git pull origin main --allow-unrelated-histories', { cwd: tempRepo });
        } catch {
            console.warn('Pull failed, probably empty repo. Continuing...');
        }

        //  Get all code files except README & non-code
        function getAllFiles(dirPath, arrayOfFiles = [], basePath = dirPath) {
            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
                const fullPath = path.join(dirPath, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    if (file !== '.git') arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, basePath);
                } else {
                    if (!file.toLowerCase().includes("readme") && !file.endsWith('.md'))
                        arrayOfFiles.push(path.relative(basePath, fullPath));
                }
            });
            return arrayOfFiles;
        }
        let allFiles = getAllFiles(tempRepo);

        //  Map files and their lines
        let fileMap = {};
        let totalLines = 0;
        allFiles.forEach(file => {
            const content = fs.readFileSync(path.join(tempRepo, file), 'utf-8').split('\n');
            fileMap[file] = content;
            totalLines += content.length;
        });

        //  Calculate commits
        const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
        const totalCommits = totalDays * maxCommitsPerDay;
        const linesPerCommit = Math.max(1, Math.floor(totalLines / totalCommits));

        let currentDate = new Date(start);
        let fileQueue = Object.entries(fileMap).map(([file, lines]) => ({ file, lines, index: 0 }));

        //  Helper: modify existing code
        function modifyExistingCode(filePath) {
            let content = fs.readFileSync(filePath, 'utf-8').split('\n');
            if (content.length > 0) {
                let randomLine = Math.floor(Math.random() * content.length);
                if (content[randomLine].trim() !== "") {
                    content[randomLine] = content[randomLine] + " // updated";
                } else {
                    content[randomLine] = "// minor change added";
                }
                fs.writeFileSync(filePath, content.join('\n'));
            }
        }

        // Loop over dates
        while (currentDate <= end) {
            let commitsToday = Math.floor(Math.random() * maxCommitsPerDay) + 1;

            for (let c = 0; c < commitsToday; c++) {
                let linesAdded = 0;
                for (let f of fileQueue) {
                    while (linesAdded < linesPerCommit && f.index < f.lines.length) {
                        const filePath = path.join(tempRepo, f.file);
                        fs.appendFileSync(filePath, "\n" + f.lines[f.index]);
                        execSync(`git add "${f.file}"`, { cwd: tempRepo });
                        f.index++;
                        linesAdded++;
                    }
                    if (linesAdded >= linesPerCommit) break;
                }

                //  If no new code left → modify existing file
                if (linesAdded === 0) {
                    const randomFile = allFiles[Math.floor(Math.random() * allFiles.length)];
                    modifyExistingCode(path.join(tempRepo, randomFile));
                    execSync(`git add "${randomFile}"`, { cwd: tempRepo });
                }

                //  Random Commit Message
                const commitMsg = commitMessages[Math.floor(Math.random() * commitMessages.length)];

                execSync(`git commit -m "${commitMsg}"`, {
                    cwd: tempRepo,
                    env: {
                        ...process.env,
                        GIT_AUTHOR_DATE: currentDate.toISOString(),
                        GIT_COMMITTER_DATE: currentDate.toISOString()
                    }
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        //  Push to repo
        const remoteUrlWithToken = `https://${token}@github.com/${username}/${repoName}.git`;
        execSync(`git push ${remoteUrlWithToken} main --force`, { cwd: tempRepo });

        // Save user process data in session
        req.session.userProcesses.push({
            projectName,
            repoName,
            commitsPerDay: maxCommitsPerDay,
            status: 'Commits Generated Successfully',
            time: new Date().toLocaleString()
        });

        res.render('success', { message: 'Commits generated successfully!', processes: req.session.userProcesses });

    } catch (error) {
        console.error(' Error generating commits:', error);
        res.render('index', { message: `Error: ${error.message}` });
    } finally {
        await new Promise(r => setTimeout(r, 100));
        if (fs.existsSync(tempRepo)) fs.rmSync(tempRepo, { recursive: true, force: true });
    }
};
