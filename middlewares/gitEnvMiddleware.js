module.exports = (req, res, next) => {
  // Example: Check if inside git repo
  const { exec } = require('child_process');
  exec('git rev-parse --is-inside-work-tree', (err) => {
    if (err) {
      return res.send("❌ Not a git repository.");
    }
    next();
  });
};
