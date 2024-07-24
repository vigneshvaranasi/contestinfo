// Create mini Express server
const exp = require('express');
const codeforcesApp= exp.Router();


codeforcesApp.get('/', (req, res) => {

    // Read the query parameters
    const query = req.query;
    console.log(query);
    res.send('Welcome to Codeforces API');
});


// Export userApp
module.exports = codeforcesApp;