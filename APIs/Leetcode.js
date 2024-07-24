const express = require('express');
const leetcodeApp = express.Router();
const Bottleneck = require('bottleneck');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Create a Bottleneck limiter
const limiter = new Bottleneck({
    minTime: 1000, // Minimum time between requests
    maxConcurrent: 2 // Maximum number of concurrent requests
});

// Function to fetch user data from LeetCode
async function fetchLeetCodeData(username) {
    const url = 'https://leetcode.com/graphql';
    const query = `
        query getUserContestRanking ($username: String!) {
            userContestRanking(username: $username) {
                attendedContestsCount
                rating
                globalRanking
                totalParticipants
                topPercentage
                badge {
                    name
                }
            }
            userContestRankingHistory(username: $username) {
                attended
                rating
                ranking
                trendDirection
                problemsSolved
                totalProblems
                finishTimeInSeconds
                contest {
                    title
                    startTime
                }
            }
        }
    `;
    const variables = { username };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://leetcode.com/',
                'Origin': 'https://leetcode.com'
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        const data = await response.json();
        if (data.data && data.data.userContestRankingHistory) {
            data.data.userContestRankingHistory = data.data.userContestRankingHistory.filter(contest => contest.attended);
        }

        return { username, data: data.data };
    } catch (error) {
        console.error(`Failed to fetch data for ${username}:`, error);
        return { username, error: error.message };
    }
}

// Wrap the function with the limiter
const fetchLeetCodeDataWithLimit = limiter.wrap(fetchLeetCodeData);

// Define a route to fetch LeetCode data
leetcodeApp.get('/:username', async (req, res) => {
    const username = req.params.username;
    const data = await fetchLeetCodeDataWithLimit(username);
    res.json(data);
});

module.exports = {
    router: leetcodeApp,
    fetchLeetCodeData: fetchLeetCodeDataWithLimit
};
