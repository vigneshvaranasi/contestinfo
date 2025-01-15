const express = require('express');
const codeforcesApp = express.Router();
const Bottleneck = require('bottleneck');
const {formatDate} = require('../utils/CommonUtils');
const { all } = require('axios');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Create a Bottleneck limiter
const limiter = new Bottleneck({
    minTime: 1000, // Minimum time between requests
    maxConcurrent: 3 // Maximum number of concurrent requests
});

// Function to fetch user data from Codeforces
async function fetchCodeforcesContestsData(username) {
    // console.log('Codefroces username - Contest data: ', username);
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
        // console.log('response: ', response);
        // if (response.status === 429 || response.status === 503 || response.status === 504 || response.status === 403) {
        if (response.status !== 200) {
            console.log(`Rate limit or service unavailable for Codeforces ${username}.`);
            await delay(2000); // Fixed delay before retrying
            return fetchCodeforcesContestsData(username); // Retry once
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            let res = await response.json();
            // console.log('res: ', res);
            let allContests = res.result;
            let contestsData = [];
            allContests.forEach((contest)=>{
                const link = `https://codeforces.com/contest/${contest.contestId}`;
                contestsData.push({
                    platform:"codeforces",
                    contestName:contest.contestName,
                    date:formatDate(contest.ratingUpdateTimeSeconds),
                    link:link
                })
            })

            const allProblems = await fetchCodeforcesProblemsData(username);
            const problemsMp = allProblems.allProblemsMap;
            // console.log('problemsMp: ', problemsMp);
            const TotalProblemsSolved = allProblems.totalProblemsSolved;
            
            let PerformanceData = [];
            allContests.forEach((contest)=>{
                if(problemsMp.get(contest.contestId)===undefined){
                    problemsMp.set(contest.contestId,0);
                }
                PerformanceData.push({
                    contestName:contest.contestName,
                    rating:contest.newRating,
                    rank:contest.rank,
                    problemsSolved:problemsMp.get(contest.contestId),
                    delta:contest.newRating-contest.oldRating
                })
            })
            let userData ={
                username:username,
                TotalProblemsSolved:TotalProblemsSolved,
            }
            return {
                UserData: userData,
                ContestsData: contestsData,
                PerformancesData: PerformanceData
            };
        } else {
            throw new Error('Received non-JSON response');
        }
    } catch (error) {
        console.error(`Failed to fetch data for ${username}:`, error);
        return {
            error: "Failed to Fetch the Data"
        }
    }
}


const fetchCodeforcesProblemsData = async (username) => {
    // console.log('Codefroces username - Problems data: ', username);
    try {
        const url = `https://codeforces.com/api/user.status?handle=${username}`;
        const response = await limiter.schedule(() =>
            fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json',
                    'Referer': 'https://codeforces.com/',
                    'Origin': 'https://codeforces.com'
                }
            })
        );
        if (response.status !== 200) {
            console.log(`Rate limit or service unavailable for Codeforces ${username}.`);
            await delay(2000); // Fixed delay before retrying
            return fetchCodeforcesProblemsData(username); // Retry once
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.json();
        // console.log('data: ', data);
        if (data.status === 'FAILED') {
            return [];
        }
        data = data.result.filter(submission => submission.verdict === 'OK');
        // console.log('Problemsdata: ', data);

        let allProblemsMap = new Map();
        let totalProblemsSolved = 0;
        
        data.forEach((submission)=>{
            totalProblemsSolved++;
            let contestId = submission.contestId;
            if(allProblemsMap.has(contestId)){
                let temp = allProblemsMap.get(contestId);
                allProblemsMap.set(contestId,temp+1)
            }
            else{
                allProblemsMap.set(contestId,1);
            }            
        })
        // console.log('totalProblemsSolved: ', totalProblemsSolved);
        return {allProblemsMap,totalProblemsSolved};
    } catch (error) {
        console.error(`Failed to fetch data for ${username}:`, error);
        return { username, error: error.message };
    }
};




// fetchCodeforcesProblemsData('pavankc')
// .then(data=>{
//     console.log(data);
// })

module.exports = {fetchCodeforcesContestsData};