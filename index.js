require('dotenv').config();
const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const cron = require('node-cron');


const dbURL = process.env.DB_URL; // Use environment variable
const client = new MongoClient(dbURL);

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

        // Import and use CodeChef API
        const { router: codechefRouter, scrapeCodeChef } = require('./APIs/Codechef');
        app.use('/codechef', codechefRouter);


        // Import students data
        const students = require('./test.json');

        // Endpoint to fetch all students' data and insert into MongoDB
        app.get('/data', async (req, res) => {
            try {
                // Collect data from different platforms
                const promises = students.map(async student => {
                    if (student.codeforces === "" || student.leetcode === ""  || student.codechef === "") {
                        return {
                            roll: student.roll,
                            error: 'Username not available',
                        };
                    }
                    const codeforcesData = await fetchCodeforcesData(student.codeforces);
                    const leetcodeData = await fetchLeetCodeData(student.leetcode);
                    const codechefData = await scrapeCodeChef(student.codechef);

                    // Prepare data for MongoDB
                    const userData = {
                        name: student.name,
                        roll: student.roll,
                        codeforces: codeforcesData,
                        leetcode: leetcodeData,
                        codechef: codechefData,
                    };

                    // Insert user data into MongoDB
                    // const studentsCollection = app.get('studentsCollection');
                    await studentsCollection.updateOne(
                        { roll: student.roll },
                        { $set: userData },
                        { upsert: true },
                        {sort : {roll: 1}}
                    );

                    return userData;
                });

                // Wait for all promises to resolve
                const allStudentsData = await Promise.all(promises);
                res.json(allStudentsData);
                return allStudentsData;
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: error.message });
            }
        });

        // Schedule the cron job to run at 12:30 PM everyday
        cron.schedule('40 12 * * *', async () => {
            console.log('Running cron job');
            try{
                const studentsData = await app.get('/data');
                console.log('Data endpoint triggered successfully:', studentsData);
            }
            catch(error){
                console.error('Error triggering /data endpoint:', error);
            }

        });

        const port = process.env.PORT || 4000;
        app.listen(port, () => {
            console.log(`Server running on port http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Error in connecting to MongoDB', err);
        process.exit(1);
    }
}

startServer();
