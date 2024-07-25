const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');

// Database URL and Client Initialization
const dbURL = 'mongodb+srv://vignesh:vignesh@cluster1.qt05vl9.mongodb.net';
const client = new MongoClient(dbURL);

// Connect to MongoDB and setup server
async function startServer() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');

        // Connect to Database and Collection
        const db = client.db('ContestInfo');
        const studentsCollection = db.collection('Students');

        // Share the Collection with the APIs
        app.set('studentsCollection', studentsCollection);

        // Endpoint to welcome users
        app.get('/', (req, res) => {
            res.send('Welcome to Contest Info Server');
        });

        // Import and use Codeforces API
        const { router: codeforcesRouter, fetchCodeforcesData } = require('./APIs/Codeforces');
        app.use('/codeforces', codeforcesRouter);

        // Import and use LeetCode API
        const { router: leetcodeRouter, fetchLeetCodeData } = require('./APIs/Leetcode');
        app.use('/leetcode', leetcodeRouter);


        // Import students data
        const students = require('./Students.json');

        // Endpoint to fetch all students' data and insert into MongoDB
        app.get('/data', async (req, res) => {
            try {
                // Collect data from different platforms
                const promises = students.map(async student => {
                    if (student.codeforces === "" || student.leetcode === "") {
                        return {
                            roll: student.roll,
                            error: 'Username not available',
                        };
                    }
                    const codeforcesData = await fetchCodeforcesData(student.codeforces);
                    const leetcodeData = await fetchLeetCodeData(student.leetcode);

                    // Prepare data for MongoDB
                    const userData = {
                        roll: student.roll,
                        codeforces: codeforcesData,
                        leetcode: leetcodeData,
                    };

                    // Insert user data into MongoDB
                    const studentsCollection = app.get('studentsCollection');
                    await studentsCollection.updateOne(
                        { roll: student.roll },
                        { $set: userData },
                        { upsert: true }
                    );

                    return userData;
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
    } catch (err) {
        console.error('Error in connecting to MongoDB', err);
        process.exit(1);
    }
}

startServer();
