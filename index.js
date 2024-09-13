require('dotenv').config();
const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const cron = require('node-cron');
const https = require('https');
const cors = require('cors');
app.use(cors({ origin: '*' }));


const dbURL = process.env.DB_URL; // Use environment variable
const client = new MongoClient(dbURL);

async function startServer() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');

        // Connect to Database and Collection
        const db = client.db('ContestInfo');
        const Batch21 = db.collection('Batch21');
        const Batch22 = db.collection('Batch22');


        // Share the Collection with the APIs
        app.set('Batch21', Batch21);
        app.set('Batch22', Batch22);

        // Endpoint to welcome users
        app.get('/', (req, res) => {
            res.send('Welcome to Contest Info Server');
        });

        // Import and use Codeforces API
        const { router: codeforcesRouter, fetchCodeforcesContestsData, fetchCodeforcesProblemsData } = require('./APIs/Codeforces');
        app.use('/codeforces', codeforcesRouter);

        // Import and use LeetCode API
        const { router: leetcodeRouter, fetchLeetCodeData } = require('./APIs/Leetcode');
        app.use('/leetcode', leetcodeRouter);

        // Import and use CodeChef API
        const { router: codechefRouter, scrapeCodeChef } = require('./APIs/Codechef');
        app.use('/codechef', codechefRouter);

        // Import GetUpcoming API
        const { router: getUpcomingRouter, fetchUpcoming } = require('./APIs/GetUpcoming');
        app.use('/getUpcoming', getUpcomingRouter);

        app.get('/getUpcomingContests', async (req, res) => {
            try {
                const newUpcomingContests = await fetchUpcoming();
                const upcomingContestsCollection = client.db('ContestInfo').collection('UpcomingContests');
                let upsertedCount = 0;
                for (let contest of newUpcomingContests) {
                    const result = await upcomingContestsCollection.updateOne(
                        { href: contest.href },
                        { $set: contest },
                        { upsert: true }
                    );
                    if (result.upsertedCount > 0 || result.modifiedCount > 0) {
                        upsertedCount++;
                    }
                }

                res.json({
                    message: `${upsertedCount} contests added.`,
                });

            } catch (error) {
                console.error('Error fetching/updating contests:', error);
                res.status(500).json({ error: 'An error occurred while fetching contests.' });
            }
        });

        // Import students data
        const students21 = require('./21.json');
        const students22 = require('./22.json');

        // Import Parts of Students Data - 21Batch
        const batch21_01 = require('./data/21Batch/01.json');
        const batch21_02 = require('./data/21Batch/02.json');
        const batch21_03 = require('./data/21Batch/03.json');
        const batch21_04 = require('./data/21Batch/04.json');

        // Import Parts of Students Data - 22Batch
        const batch22_01 = require('./data/22Batch/01.json');
        const batch22_02 = require('./data/22Batch/02.json');
        const batch22_03 = require('./data/22Batch/03.json');
        const batch22_04 = require('./data/22Batch/04.json');

        // Function to Push data to the DB t differnt collections
        async function pushDataToDB(batch, collection,res) {

            // Collect data from different platforms
            const promises = batch.map(async student => {
                if (student.codeforces === "" || student.leetcode === "" || student.codechef === "") {
                    return {
                        roll: student.roll,
                        error: 'Username not available',
                    };
                }
                let data = await fetchCodeforcesContestsData(student.codeforces);
                let problems = await fetchCodeforcesProblemsData(student.codeforces);
                data.problems = await problems;
                const codeforcesData = data;
                // const codeforcesData = await problems;
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
                const studentsCollection = app.get(collection);
                await studentsCollection.updateOne(
                    { roll: student.roll },
                    { $set: userData },
                    { upsert: true }
                );

                return userData;
            });

            // Wait for all promises to resolve
            // const allStudentsData = await Promise.all(promises);
            // Send response indicating success
            res.json({
                message: 'Data scraped and stored successfully',
                // data: allStudentsData,
            });
        }

        // Endpoint to fetch all students' data and insert into MongoDB
        app.get('/data', async (req, res) => {
            try {
                // Collect data from different platforms
                const promises = students.map(async student => {
                    if (student.codeforces === "" || student.leetcode === "" || student.codechef === "") {
                        return {
                            roll: student.roll,
                            error: 'Username not available',
                        };
                    }
                    let data = await fetchCodeforcesContestsData(student.codeforces);
                    let problems = await fetchCodeforcesProblemsData(student.codeforces);
                    data.problems = await problems;
                    const codeforcesData = data;
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
                    const studentsCollection = app.get('studentsCollection');
                    await studentsCollection.updateOne(
                        { roll: student.roll },
                        { $set: userData },
                        { upsert: true },
                        { sort: { roll: 1 } }
                    );

                    return userData;
                });

                // Wait for all promises to resolve
                const allStudentsData = await Promise.all(promises);
                // Send response indicating success
                res.json({
                    message: 'Data scraped and stored successfully',
                    data: allStudentsData,
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: error.message });
            }
        });

        // Endpoint for 21Batch
        app.get('/21batch', async (req, res) => {
            await pushDataToDB(students21, 'Batch21',res);
        });

        // Endpoint for 22Batch
        app.get('/22batch', async (req, res) => {
            await pushDataToDB(students22, 'Batch22',res);
        });

        // Endpoints for different parts of 21Batch
        app.get('/21batch/01', async (req, res) => {
            await pushDataToDB(batch21_01, 'Batch21',res);
        });
        app.get('/21batch/02', async (req, res) => {
            await pushDataToDB(batch21_02, 'Batch21',res);
        });
        app.get('/21batch/03', async (req, res) => {
            await pushDataToDB(batch21_03, 'Batch21',res);
        });
        app.get('/21batch/04', async (req, res) => {
            await pushDataToDB(batch21_04, 'Batch21',res);
        });

        // Endpoints for different parts of 22Batch
        app.get('/22batch/01', async (req, res) => {
            await pushDataToDB(batch22_01, 'Batch22',res);
        });
        app.get('/22batch/02', async (req, res) => {
            await pushDataToDB(batch22_02, 'Batch22',res);
        });
        app.get('/22batch/03', async (req, res) => {
            await pushDataToDB(batch22_03, 'Batch22',res);
        });
        app.get('/22batch/04', async (req, res) => {
            await pushDataToDB(batch22_04, 'Batch22',res);
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