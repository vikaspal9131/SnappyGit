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
        if (fs.existsSync(tempRepo)) fs.rmSync(tempRepo, { recursive: true, force: true });
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

        try {
            execSync('git pull origin main --allow-unrelated-histories', { cwd: tempRepo });
        } catch {
            console.warn('Pull failed, probably empty repo. Continuing...');
        }

        //  Read all files (except .git)
        function getAllFiles(dirPath, arrayOfFiles = [], basePath = dirPath) {
            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
                const fullPath = path.join(dirPath, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    if (file !== '.git') arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, basePath);
                } else {
                    arrayOfFiles.push(path.relative(basePath, fullPath));
                }
            });
            return arrayOfFiles;
        }

        let allFiles = getAllFiles(tempRepo);

        //  Split each file into lines
        let fileMap = {};
        allFiles.forEach(file => {
            const content = fs.readFileSync(path.join(tempRepo, file), 'utf-8').split('\n');
            fileMap[file] = content;
        });

        let totalLines = Object.values(fileMap).reduce((sum, lines) => sum + lines.length, 0);
        let totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

        let currentDate = new Date(start);
        let fileQueue = Object.entries(fileMap).map(([file, lines]) => ({ file, lines, index: 0 }));

        let remainingLines = totalLines;
        let remainingDays = totalDays;

        while (currentDate <= end) {
            let todayLines = Math.max(1, Math.ceil(remainingLines / remainingDays));
            let linesAdded = 0;

            fileQueue.forEach(f => {
                while (linesAdded < todayLines && f.index < f.lines.length) {
                    const filePath = path.join(tempRepo, f.file);
                    fs.appendFileSync(filePath, f.lines[f.index] + "\n");
                    execSync(`git add "${f.file}"`, { cwd: tempRepo });
                    f.index++;
                    linesAdded++;
                }
            });

            //  Commit (if lines added)
            if (linesAdded > 0) {
                execSync(`git commit -m "Code commit on ${currentDate.toDateString()}"`, {
                    cwd: tempRepo,
                    env: {
                        ...process.env,
                        GIT_AUTHOR_DATE: currentDate.toISOString(),
                        GIT_COMMITTER_DATE: currentDate.toISOString()
                    }
                });
            } else {
                //  Empty commit if no code left
                execSync(`git commit --allow-empty -m "Empty commit on ${currentDate.toDateString()}"`, {
                    cwd: tempRepo,
                    env: {
                        ...process.env,
                        GIT_AUTHOR_DATE: currentDate.toISOString(),
                        GIT_COMMITTER_DATE: currentDate.toISOString()
                    }
                });
            }

            remainingLines -= linesAdded;
            remainingDays--;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        //  Push to user repo
        const remoteUrlWithToken = `https://${token}@github.com/${username}/${repoName}.git`;
        execSync(`git push ${remoteUrlWithToken} main --force`, { cwd: tempRepo });

        res.redirect('/success');

    } catch (error) {
        console.error(' Error generating commits:', error);
        res.render('index', { message: `Error: ${error.message}` });
    } finally {
        await new Promise(r => setTimeout(r, 100));
        if (fs.existsSync(tempRepo)) fs.rmSync(tempRepo, { recursive: true, force: true });
    }
};
