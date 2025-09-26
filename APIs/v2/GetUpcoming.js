const express = require('express');
const GetUpcommingApp = express.Router();
const mongoose = require('mongoose');
const { UpcomingContest } = require('../../db/index');
const Bottleneck = require('bottleneck');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

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
    const url = 'https://clist.by:443/api/v4/contest/?upcoming=true&resource_id__in=1%2C2%2C102%2C93%2C73&order_by=end';
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
        // console.log('data: ', data);
        let contests = data.objects;
        const finalData = contests.map(contest => {
            const { n_problems, n_statistics, parsed_at, problems, ...filteredContest } = contest;
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
        const currentDate = new Date();
        await UpcomingContest.deleteMany({ end: { $lt: currentDate } });
        const existingIds = await UpcomingContest.find({}, 'id').then(contests => contests.map(c => c.id));
        const newData = data.filter(contest => !existingIds.includes(contest.id));
        if (newData.length > 0) {
            await UpcomingContest.insertMany(newData);
        }
        res.json({           
            message: `Fetched upcoming contests successfully`,
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch contests.' });
    }
});

GetUpcommingApp.get('/', async (req, res) => {
    const currentDate = new Date();
    try {
        const query = { start: { $gt: currentDate.toISOString() } };
        const result = await UpcomingContest.find(query).sort({ start: 1 });
        if (result.length === 0) {
            return res.status(404).send({ message: 'No contests found after the current date and time' });
        }
        res.send({ message: 'Contests retrieved', result: result });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

module.exports = {
    router: GetUpcommingApp,
    fetchUpcoming: fetchUpcomingWithLimit
};
