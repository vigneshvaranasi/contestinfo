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
    // console.log(data)
    console.log("Score : ",data.score);
  } catch (err) {
    console.log(err)
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
    // console.log(data)
    console.log("Problems Solved",data.total_problems_solved)
  } catch (err) {
    console.log(err)
  }
}

for(let i=0;i<200;i++){
  InterviewBitPS('vvsvignesh')
  InterviewBitScore('vvsvignesh')
  InterviewBitPS('pavankc')
  InterviewBitScore('pavankc')
}