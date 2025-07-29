exports.validateInput = (req, res, next) => {
    const { username, repoName, startDate, endDate, token } = req.body;

    if (!username || !repoName || !startDate || !endDate || !token) {
        return res.render('index', { message: 'All fields are required.' });
    }


    if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
        return res.render('index', { message: 'Invalid start or end date.' });
    }

    if (new Date(startDate) > new Date(endDate)) {
        return res.render('index', { message: 'Start date cannot be after end date.' });
    }

   
    next(); 
};