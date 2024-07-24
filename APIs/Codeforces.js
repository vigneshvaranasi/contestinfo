const express = require('express');
const codeforcesApp = express.Router();
const Bottleneck = require('bottleneck');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Create a Bottleneck limiter
const limiter = new Bottleneck({
    minTime: 300, // Minimum time between requests
    maxConcurrent: 3 // Maximum number of concurrent requests
});

// Function to fetch user data from Codeforces
async function fetchCodeforcesData(username) {
    try {
        let response = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
        if (response.status === 429 || response.status === 503) {
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
            return { username, attendedContests };
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
