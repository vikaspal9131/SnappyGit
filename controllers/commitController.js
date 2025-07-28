const { exec } = require('child_process');

exports.generateCommit = (req, res) => {
  const { type, message } = req.body;
  const commitMessage = `${type}: ${message}`;

  exec(`git add . && git commit -m "${commitMessage}"`, (err, stdout, stderr) => {
    if (err) {
      return res.send(`❌ Error: ${stderr}`);
    }
    res.render('success', { commit: commitMessage });
  });
};
