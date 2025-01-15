const Bottleneck = require('bottleneck')
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

// Create a Bottleneck limiter
const limiter = new Bottleneck({
  minTime: 1000, // Minimum time between requests
  maxConcurrent: 3 // Maximum number of concurrent requests
})

const InterviewBitScore = async username => {
  try {
    let res = await limiter.schedule(() =>
      fetch(`https://www.interviewbit.com/v2/profile/username/streak/?id=${username}`, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          Referer: 'https://www.interviewbit.com/',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      })
    )
    let data = await res.json()
    // console.log('data: ', data);
    // console.log(data)
    // console.log("Score : ",data.score);
    return data.score
  } catch (err) {
    console.log(err);
    return InterviewBitScore(username)
  }
}

const InterviewBitPS = async username => {
  try {
    let res = await limiter.schedule(() =>
      fetch(`https://www.interviewbit.com/v2/problem_list/problems_solved_overview_count?username=${username}`, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          Referer: 'https://www.interviewbit.com/',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      })
    )
    let data = await res.json()
    return data.total_problems_solved
    // console.log(data)
    // console.log("Problems Solved",data.total_problems_solved)
  } catch (err) {
    console.log(err);
    return InterviewBitPS(username)
  }
}


async function InterviewBitInfo(username){
  try{
    let platformScore= await InterviewBitScore(username)
    return{
        platformScore,
        TotalProblemsSolved: await InterviewBitPS(username),
        username: username,
        score:Math.round(platformScore/5)
    }

  }catch(err){
    console.log(err)
    return {
      error: "Failed to fetch data"
    }
  }
}
// InterviewBitInfo('vvsvignesh')
// .then(data => console.log(data))

module.exports = {InterviewBitInfo}