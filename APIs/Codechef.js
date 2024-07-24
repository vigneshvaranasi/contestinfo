// const express = require('express');
// const codechefApp = express.Router();
// const Bottleneck = require('bottleneck');
// const app = express();
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
// const puppeteer = require('puppeteer');

// // Launch the browser with Puppeteer
// const launchBrowser = async () => {
//     try {
//         const browser = await puppeteer.launch({
//             headless: true,
//             args: [
//                 '--no-sandbox', 
//                 '--disable-setuid-sandbox', 
//                 '--disable-dev-shm-usage', 
//                 '--disable-gpu', 
//                 '--disable-software-rasterizer'
//             ],
//         });
//         console.log('Browser launched successfully');
//         return browser;
//     } catch (error) {
//         console.error('Error launching browser:', error);
//         throw error;
//     }
// };

// // Scrape CodeChef data
// const fetchCodeChefData = async (username) => {
//     const browser = await launchBrowser();
//     const page = await browser.newPage();
//     await page.goto(`https://www.codechef.com/users/${username}`);

//     // Wait for the relevant section to load
//     await page.waitForSelector('section.rating-data-section.problems-solved');

//     // Extract contest data
//     const contests = await page.$$eval('section.rating-data-section.problems-solved', sections => {
//         const results = [];
//         sections.forEach(section => {
//             const contestTitles = Array.from(section.querySelectorAll('.content > h5')).map(h5 => h5.textContent);
//             const solvedProblems = Array.from(section.querySelectorAll('.content > p')).map(p => p.textContent);
//             for (let i = 0; i < contestTitles.length; i++) {
//                 const contest = contestTitles[i].split(' Division')[0];
//                 const division = contestTitles[i].split('Division ')[1].split(' ')[0];
//                 const problems = solvedProblems[i].split(',').length;
//                 results.push({ contest, problems, division });
//             }
//         });
//         return results;
//     });

//     // var all_rating in the document returned by the page has contest rating data
//     const allRating = await page.evaluate(() => {
//         const scriptTag = Array.from(document.querySelectorAll('script')).find(script => script.innerText.includes('var all_rating='));
//         if (!scriptTag) return [];
//         const scriptContent = scriptTag.innerText;
//         const start = scriptContent.indexOf('[');
//         const end = scriptContent.indexOf('];') + 1;
//         return JSON.parse(scriptContent.slice(start, end));
//     });

//     await browser.close();
//     return { contests, allRating };
// };



// // Define the /codechef endpoint
// codechefApp.get('/codechef/:username', async (req, res) => {
//     const username = req.params.username;
//     try {
//         const data = await fetchCodeChefData(username);
//         res.json(data);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = {
//     router: codechefApp,
//     fetchCodeChefData
// };

const express = require('express');
const codechefApp = express.Router();
const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Launch the browser with Puppeteer
const launchBrowser = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-software-rasterizer'
            ],
        });
        console.log('Browser launched successfully');
        return browser;
    } catch (error) {
        console.error('Error launching browser:', error);
        throw error;
    }
};

// Scrape CodeChef data
const fetchCodeChefData = async (username) => {
    let browser;
    try {
        browser = await launchBrowser();
        const page = await browser.newPage();
        await page.goto(`https://www.codechef.com/users/${username}`, { waitUntil: 'networkidle2' });
        console.log(`Navigated to https://www.codechef.com/users/${username}`);

        // Get page content
        const pageContent = await page.content();
        console.log('Page content retrieved');

        // Parse page content with jsdom
        const dom = new JSDOM(pageContent);
        const document = dom.window.document;

        // Extract contest data
        const contests = Array.from(document.querySelectorAll('section.rating-data-section.problems-solved')).map(section => {
            const contestTitles = Array.from(section.querySelectorAll('.content > h5')).map(h5 => h5.textContent);
            const solvedProblems = Array.from(section.querySelectorAll('.content > p')).map(p => p.textContent);
            return contestTitles.map((title, index) => {
                const contest = title.split(' Division')[0];
                const division = title.split('Division ')[1]?.split(' ')[0] || 'Unknown';
                const problems = solvedProblems[index]?.split(',').length || 0;
                return { contest, problems, division };
            });
        }).flat();

        console.log('Contest data extracted:', contests);

        // Extract rating data using jsdom
        const resdata = await fetch(`https://www.codechef.com/users/${username}`);
        let d = await resdata.text();
        let data = { data: d };
        let allRating =
            data.data.search("var all_rating = ") + "var all_rating = ".length;
        let allRating2 = data.data.search("var current_user_rating =") - 6;
        let ratingData = JSON.parse(data.data.substring(allRating, allRating2));


        console.log('Rating data extracted:', allRating);

        await browser.close();
        return { contests, ratingData };
    } catch (error) {
        console.error('Error fetching data from CodeChef:', error);
        if (browser) await browser.close();
        throw new Error('Failed to fetch data from CodeChef');
    }
};

// Define the /codechef endpoint
codechefApp.get('/codechef/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const data = await fetchCodeChefData(username);
        res.json(data);
    } catch (error) {
        console.error('Error in /codechef endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = {
    router: codechefApp,
    fetchCodeChefData
};
