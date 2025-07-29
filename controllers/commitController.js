
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.generateCommits = async (req, res) => {
    const { username, repoName, startDate, endDate, token } = req.body;

    if (!username || !repoName || !startDate || !endDate || !token) {
        return res.render('index', { message: 'Please provide all required fields.' });
    }

    const repoPath = path.join(__dirname, '..', 'temp_repo');
    const start = new Date(startDate);
    const end = new Date(endDate);

    try {
     
        if (fs.existsSync(repoPath)) {
            fs.rmSync(repoPath, { recursive: true, force: true });
        }


        execSync(`mkdir ${repoPath}`);
        execSync(`git init`, { cwd: repoPath });

   
        execSync(`git branch -M main`, { cwd: repoPath }); 

   
        execSync(`git remote add origin https://github.com/${username}/${repoName}.git`, { cwd: repoPath });

     
        try {
            execSync(`git pull origin main --allow-unrelated-histories`, { cwd: repoPath });
        } catch (pullError) {
            console.warn('Warning: Initial pull failed (perhaps repo is empty or unrelated history). Continuing...', pullError.message);
        }

    
        const readmeContent = `# ${repoName}\n\nThis repository tracks contributions for ${username}.\n\n`;
        fs.writeFileSync(path.join(repoPath, 'README.md'), readmeContent);

        execSync(`git add .`, { cwd: repoPath });
        execSync(`git commit -m "Initial setup commit"`, {
            cwd: repoPath,
            env: {
                ...process.env,
                GIT_AUTHOR_DATE: new Date().toISOString(),
                GIT_COMMITTER_DATE: new Date().toISOString()
            }
        });

        
        let currentDate = new Date(start);
        while (currentDate <= end) {
            const authorDate = currentDate.toISOString();
            const committerDate = currentDate.toISOString();
            const commitMessage = `Update for ${currentDate.toDateString()} - Happy coding!`;
            const readmeUpdate = `\nLast updated on: ${currentDate.toDateString()} at ${currentDate.toTimeString()}`;

            fs.appendFileSync(path.join(repoPath, 'README.md'), readmeUpdate);

            execSync(`git add .`, { cwd: repoPath });

            execSync(`git commit -m "${commitMessage}"`, {
                cwd: repoPath,
                env: {
                    ...process.env,
                    GIT_AUTHOR_DATE: authorDate,
                    GIT_COMMITTER_DATE: committerDate
                }
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

       
        const remoteUrlWithToken = `https://${token}@github.com/${username}/${repoName}.git`;
        execSync(`git push ${remoteUrlWithToken} main`, { cwd: repoPath }); 


        res.redirect('/success');

    } catch (error) {
        console.error('Error generating commits:', error.message);
        res.render('index', { message: `Error: ${error.message}. Make sure the repo exists and token has write access.` });
    } finally {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (fs.existsSync(repoPath)) {
            fs.rmSync(repoPath, { recursive: true, force: true });
        }
    }
};