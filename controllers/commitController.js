const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

exports.generateCommits = async (req, res) => {
    const { username, repoName, startDate, endDate, token, projectName } = req.body;

    if (!username || !repoName || !startDate || !endDate || !token || !projectName) {
        return res.render('index', { message: 'Please provide all required fields.' });
    }

    
    const tempRepo = path.join(__dirname, '..', `temp_repo_${Date.now()}`);
    const projectZip = path.join(__dirname, '..', 'projects', `${projectName}.zip`);
    const start = new Date(startDate);
    const end = new Date(endDate);

    try {
        // Cleanup if exists
        if (fs.existsSync(tempRepo)) {
            fs.rmSync(tempRepo, { recursive: true, force: true });
        }

        // Create temp folder
        fs.mkdirSync(tempRepo);

        //  Extract project
        if (!fs.existsSync(projectZip)) {
            return res.render('index', { message: 'Selected project not found on server.' });
        }
        const zip = new AdmZip(projectZip);
        zip.extractAllTo(tempRepo, true);

        //  Init local repo
        execSync('git init', { cwd: tempRepo });
        execSync('git branch -M main', { cwd: tempRepo });
        execSync(`git remote add origin https://github.com/${username}/${repoName}.git`, { cwd: tempRepo });

        //  Try pulling existing history
        try {
            execSync('git pull origin main --allow-unrelated-histories', { cwd: tempRepo });
        } catch {
            console.warn('Pull failed, probably empty repo. Continuing...');
        }

        //  Function to fetch all files excluding .git and node_modules
        function getAllFiles(dirPath, arrayOfFiles = [], basePath = dirPath) {
            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
                const fullPath = path.join(dirPath, file);

                //  Skip git and unwanted dirs
                if (file === '.git' || file === 'node_modules') return;

                if (fs.statSync(fullPath).isDirectory()) {
                    arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, basePath);
                } else {
                    arrayOfFiles.push(path.relative(basePath, fullPath));
                }
            });
            return arrayOfFiles;
        }

        let allFiles = getAllFiles(tempRepo);
        let fileIndex = 0;

        //  Loop through dates and make commits
        let currentDate = new Date(start);
        while (currentDate <= end && fileIndex < allFiles.length) {
            const commitDate = currentDate.toISOString();

            // Pick 1–3 files for this commit
            let filesToAdd = allFiles.slice(fileIndex, fileIndex + Math.ceil(Math.random() * 3));

            //  Force change to avoid "no changes" error
            filesToAdd.forEach(file => {
                const filePath = path.join(tempRepo, file);
                fs.appendFileSync(filePath, "\n");
                execSync(`git add "${file}"`, { cwd: tempRepo });
            });

            //  Check staged files
            const changes = execSync('git diff --cached --name-only', { cwd: tempRepo }).toString().trim();
            if (changes) {
                execSync(`git commit -m "Update files on ${currentDate.toDateString()}"`, {
                    cwd: tempRepo,
                    env: {
                        ...process.env,
                        GIT_AUTHOR_DATE: commitDate,
                        GIT_COMMITTER_DATE: commitDate
                    }
                });
            }

            fileIndex += filesToAdd.length;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        //  Push to user repo
        const remoteUrlWithToken = `https://${token}@github.com/${username}/${repoName}.git`;
        execSync(`git push ${remoteUrlWithToken} main`, { cwd: tempRepo });

        res.redirect('/success');

    } catch (error) {
        console.error(' Error generating commits:', error);
        res.render('index', { message: `Error: ${error.message}` });
    } finally {
        // Cleanup
        await new Promise(r => setTimeout(r, 100));
        if (fs.existsSync(tempRepo)) {
            fs.rmSync(tempRepo, { recursive: true, force: true });
        }
    }
};
