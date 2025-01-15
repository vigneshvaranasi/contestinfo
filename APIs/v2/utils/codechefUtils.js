const cheerio = require('cheerio');
const Bottleneck = require('bottleneck');
const fetch = require('node-fetch');

// Create a Bottleneck limiter
const limiter = new Bottleneck({
    minTime: 10000, // Minimum time between requests
    maxConcurrent: 3 // Maximum number of concurrent requests
});

// contestName, date, -TotalProblemsSolved-, rating, rank, delta, div, score, link

const scrapeCodeChef = async (username) => {
    try {
        let res = await limiter.schedule(() =>
            fetch(`https://www.codechef.com/users/${username}`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Referer': 'https://www.codechef.com/',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            })
        );
        const html = await res.text();
        const allRatingIndex = html.indexOf('var all_rating =');
        const endPoint = html.indexOf(';', allRatingIndex);

        if (allRatingIndex === -1 || endPoint === -1) {
            throw new Error('Failed to locate "var all_rating" in the HTML response');
        }

        let jsonString = html.substring(allRatingIndex + 16, endPoint);
        let allRating = JSON.parse(jsonString);

        const $ = cheerio.load(html);
        const problemsString = $('section.rating-data-section.problems-solved > h3').text().trim();
        const parsedProblems = problemsString.split(' ');
        const TotalProblemsSolved = parsedProblems[parsedProblems.length - 1];
        console.log(TotalProblemsSolved); // Total Problems Solved
        const contentData = [];
        $('div.content').each((index, element) => {
            const name = $(element).find('h5 > span').html();
            const problems = [];
            
            $(element).find('p > span > span').each((i, el) => {
                problems.push($(el).html());
            });
            if (name != null && name.split(" ")[0] == "Starters") {
                contentData.push({
                    name: name,
                    code: name.split(' ')[1],
                    problems: problems,
                    noOfProblems: problems.length
                });
            }
        });

        let dataofSolvedProblems = contentData;
        let Performances = allRating.map((rating) => {
            if (rating.name.split(' ')[0] == 'Starters') {
                let details = dataofSolvedProblems.find((data) => data.name == rating.name);
                if (details != undefined) {
                    let contestName= `${rating.name.split(' ')[0]} ${rating.name.split(' ')[1]}`;
                    let date = `${rating.getday}-${rating.getmonth}-${rating.getyear}`;
                    let link = 'https://www.codechef.com/'+ rating.code.substring(0, rating.code.length - 1);
                    let divMap ={
                        "A":1,
                        "B":2,
                        "C":3,
                        "D":4
                    }
                    let div = divMap[rating.code.substring(rating.code.length - 1, rating.code.length)];
                    return {
                       contestName,
                       date,
                       link,
                       rating: rating.rating,
                       rank: rating.rank,
                       problemsSolved: details.noOfProblems,
                       delta:0,
                       div:div
                    };
                }
            }
            else{
                return null
            }
        });
        let participatedContests = Performances.map( (data) =>{
            if(data!=undefined&&data!=null&&data.contestName!=undefined){
                return {
                    platform: "codechef",
                    contestName: data.contestName,
                    date: data.date,
                    link: data.link
                }
            }
        })
        // console.log(participatedContests.length);
        Performances = Performances.filter((data) => data != null).reverse();
        //filter undefined
        Performances = Performances.filter((data) => data != undefined);
        // calcalate delta
        Performances = Performances.sort((a,b)=>{a.date-b.date});
        for (let i = 0; i < Performances.length; i++) {
            if (i == 0) {
                Performances[i].delta = Performances[i].rating;
            } else {
                Performances[i].delta = Performances[i].rating - Performances[i - 1].rating;
            }
        }
        let PerformancesData = Performances.map((data)=>{
            return{
                contestName: data.contestName,
                rating: data.rating,
                rank: data.rank,
                problemsSolved: data.problemsSolved,
                delta: data.delta,
                div: data.div
            }
        })

        return { 
            PerformancesData: PerformancesData,
            ContestsData: participatedContests,
            UserData:{
                username:username,
                TotalProblemsSolved: TotalProblemsSolved
            }
        };
    } catch (err) {
        console.error(err);
        return{
            error: "Failed to Fetch the Data"
        }
    }
};

// scrapeCodeChef('pavankc')
// scrapeCodeChef('vvsvignesh')
// .then((data) => {
//     console.log(data);
// });

module.exports = {
    scrapeCodeChef
};
