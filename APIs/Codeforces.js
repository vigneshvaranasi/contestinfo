const express = require('express');
const codeforcesApp = express.Router();
const Bottleneck = require('bottleneck');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Create a Bottleneck limiter
const limiter = new Bottleneck({
    minTime: 1000, // Minimum time between requests
    maxConcurrent: 3 // Maximum number of concurrent requests
});

// Get solved problems in Codeforces contest
async function getSolved(username, contestId) {
    try {
        let body = await limiter.schedule(() =>
            fetch(`https://codeforces.com/api/contest.status?handle=${username}&contestId=${contestId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json',
                    'Referer': 'https://codeforces.com/',
                    'Origin': 'https://codeforces.com'
                }
            })
        );
        if (body.status !== 200) {
            console.log(`Rate limit or service unavailable for Codeforces ${username}.`);
            await delay(2000); // Fixed delay before retrying
            return getSolved(username,contestId); // Retry once
        }
        console.log(username)
        let solved=0;
        let res = await body.json();
        res.result = res.result.filter((problem) => problem.verdict == "OK");
        solved += res.result.length;
        return solved;
    } catch (err) {
        console.log(err);
    }
}

// Get total problems in Codeforces contest
async function getTotalProblems(contestId) {
    try {
        let body = await fetch(`https://codeforces.com/api/contest.standings/?contestId=${contestId}&from=1&count=1`);
        let res = await body.json();
        let total = res.result.problems.length;
        return total;
    } catch (err) {
        console.log(err);
    }
}


// Function to fetch user data from Codeforces
async function fetchCodeforcesData(username) {
    try {
        let response = await limiter.schedule(() =>
            fetch(`https://codeforces.com/api/user.rating?handle=${username}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json',
                    'Referer': 'https://codeforces.com/',
                    'Origin': 'https://codeforces.com'
                }
            })
        );
        // if (response.status === 429 || response.status === 503 || response.status === 504 || response.status === 403) {
        if (response.status !== 200) {
            console.log(`Rate limit or service unavailable for Codeforces ${username}.`);
            await delay(2000); // Fixed delay before retrying
            return fetchCodeforcesData(username); // Retry once
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            let res = await response.json();
            let allContests = res.result;
            let attendedContests = allContests.reverse();

            let newAttendedContests = await Promise.all(attendedContests.map(async contest => {
                let newContest = { ...contest }; // Create a copy of the contest object
                newContest.problemsSolved = await getSolved(username, contest.contestId);
                // newContest.totalProblems = await getTotalProblems(contest.contestId);
                console.log(`Contest: ${contest.contestId}, Problems Solved: ${newContest.problemsSolved}, Total Problems: ${newContest.totalProblems}`);
                return newContest;
            }));
            
            attendedContests=newAttendedContests;
            
            return { username, attendedContests};
        } else {
            throw new Error('Received non-JSON response');
        }
    } catch (error) {
        console.error(`Failed to fetch data for ${username}:`, error);
        return { username, error: error.message };
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Define a route to fetch Codeforces data
codeforcesApp.get('/:username', async (req, res) => {
    const username = req.params.username;
    const data = await fetchCodeforcesData(username);
    res.json(data);
});

module.exports = {
    router: codeforcesApp,
    fetchCodeforcesData
};
