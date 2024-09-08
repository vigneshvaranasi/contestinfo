const express = require('express');
const GetUpcommingApp = express.Router();
const Bottleneck = require('bottleneck');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_USERNAME = process.env.API_USERNAME;
const API_KEY = process.env.API_KEY;


const limiter = new Bottleneck({
    minTime: 600000, // 1 request per 10 minutes
    maxConcurrent: 1 // Only one request at a time
});

function getPlatform(resource) {
    const platformMap = {
        'codechef.com': 'Codechef',
        'codeforces.com': 'Codeforces',
        'leetcode.com': 'Leetcode',
        'atcoder.jp': 'AtCoder',
        'hackerearth.com': 'HackerEarth',
        // 'spoj.com': 'SPOJ'
    };
    return platformMap[resource] || 'Unknown';
}


// Function to fetch upcoming contests
async function fetchUpcoming() {
    const url = 'https://clist.by:443/api/v4/contest/?upcoming=true&resource_id__in=1%2C2%2C102%2C93%2C26%2C73&order_by=end';
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `ApiKey ${API_USERNAME}:${API_KEY}` 
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        let contests = data.objects;
        const finalData = contests.map(contest => {
            const { id, n_problems, n_statistics, parsed_at, problems, ...filteredContest } = contest;
            filteredContest.platform = getPlatform(filteredContest.resource);
            return filteredContest;
        });
        return finalData;        
    } catch (error) {
        console.error(`Failed to fetch data: ${error.message}`);
        return { error: error.message };
    }
}

// Wrap the function with the limiter to throttle API calls
const fetchUpcomingWithLimit = limiter.wrap(fetchUpcoming);

// Route handler for fetching upcoming contests
GetUpcommingApp.get('/latest', async (req, res) => {
    try {
        const data = await fetchUpcomingWithLimit();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch contests.' });
    }
});

module.exports = {
    router: GetUpcommingApp,
    fetchUpcoming: fetchUpcomingWithLimit
};
