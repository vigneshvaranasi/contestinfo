const express = require('express');
const app = express();

// Endpoint to welcome users
app.get('/', (req, res) => {
    res.send('Welcome to Contest Info Server');
});

// Import Codeforces API
const { router: codeforcesRouter, fetchCodeforcesData } = require('./APIs/Codeforces');
app.use('/codeforces', codeforcesRouter);

// Import LeetCode API
const { router: leetcodeRouter, fetchLeetCodeData } = require('./APIs/Leetcode');
app.use('/leetcode', leetcodeRouter);

// Import students data
const students = require('./students.json');

// Endpoint to fetch all students' data from multiple platforms
app.get('/data', async (req, res) => {
    try {
        // Collect data from different platforms
        const promises = students.map(async student => {

            //  fetch if the username is available
            if (student.codeforces === "" || student.leetcode === "") {
                return {
                    roll: student.roll,
                    error: 'Username not available',
                };
            }
            const codeforcesData = await fetchCodeforcesData(student.codeforces);
            const leetcodeData = await fetchLeetCodeData(student.leetcode);
            return {
                roll: student.roll,
                codeforces: codeforcesData,
                leetcode: leetcodeData,
            };
        });

        // Wait for all promises to resolve
        const allStudentsData = await Promise.all(promises);
        res.json(allStudentsData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign Port Number to Server
const port = 4000;
app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
