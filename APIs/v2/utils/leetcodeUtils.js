const cheerio = require('cheerio');
const Bottleneck = require('bottleneck');
const fetch = require('node-fetch');
const {formatDate} = require('../utils/CommonUtils')

// Create a Bottleneck limiter
const limiter = new Bottleneck({
    minTime: 100, // Minimum time between requests
    // minTime: 10000, // Minimum time between requests
    maxConcurrent: 3 // Maximum number of concurrent requests
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
            allQuestionsCount {
                difficulty
                count
            }
            matchedUser(username: $username) {
                problemsSolvedBeatsStats {
                    difficulty
                    percentage
                }
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
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

            // Reverse the array to get the latest contests
            // data.data.userContestRankingHistory.reverse();
        }

        // console.log(data);
        let totalProblemsSolved = data.data.matchedUser.submitStatsGlobal.acSubmissionNum[0].count
        // console.log('totalProblemsSolved: ', totalProblemsSolved);

        const contestData = [];
        let performanceData = [];
        data.data.userContestRankingHistory.forEach(contest => {
            // console.log(contest);
            let link = contest.contest.title.split(' ').join('-').toLowerCase();
            // console.log('link: ', link);
            contestData.push({
                platform: 'leetcode',
                contestName: contest.contest.title,
                date: formatDate(contest.contest.startTime),
                link: `https://leetcode.com/contest/${link}/`
            })        
            performanceData.push({
                contestName: contest.contest.title,
                rating: Math.round(contest.rating),
                rank: contest.ranking,
                problemsSolved: contest.problemsSolved,
                delta: 0,
            })
        });
    
        for (let i = 0; i < performanceData.length; i++) {
            if (i == 0) {
                performanceData[i].delta = performanceData[i].rating;
            } else {
                performanceData[i].delta = performanceData[i].rating - performanceData[i - 1].rating;
            }
        }
    
        return {
            PerformancesData: performanceData,
            ContestsData: contestData,
            UserData:{
                username:username,
                TotalProblemsSolved: totalProblemsSolved
            }
        }
        // return { username, data: data.data };
    } catch (error) {
        console.error(`Failed to fetch data for ${username}:`, error);
        return { username, error: "Failed to fetch data" };
    }
}

// Wrap the function with the limiter
const fetchLeetCodeDataWithLimit = limiter.wrap(fetchLeetCodeData);



// fetchLeetCodeDataWithLimit("harshapss")
// .then((data)=>{
//     console.log('data: ', data);
// })


module.exports = { fetchLeetCodeDataWithLimit };