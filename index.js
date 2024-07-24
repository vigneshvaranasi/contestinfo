//  Create HTTP Server

// Import Express Module
const exp = require('express');
const app = exp();

app.get('/', (req, res) => {
    res.send('Welcome to Muiltiple APIs Server');
});



// Import User API
const codeforcesApp = require('./APIs/Codeforces:username');
// If path starts with /user-api, then userAPI will be called
app.use('/codeforces', codeforcesApp);


// Assign Port Number to Server
const port = 4000;
app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});


