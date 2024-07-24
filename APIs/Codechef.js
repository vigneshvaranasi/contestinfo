const express = require('express');
const codechefApp = express.Router();
const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const divMap = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D'
};

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
                '--disable-software-rasterizer',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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

        // Parse page content with jsdom
        const dom = new JSDOM(pageContent);
        const document = dom.window.document;

        // Extract contest data
        const contests = Array.from(document.querySelectorAll('section.rating-data-section.problems-solved')).map(section => {
            const contestTitles = Array.from(section.querySelectorAll('.content > h5')).map(h5 => h5.textContent);
            const solvedProblems = Array.from(section.querySelectorAll('.content > p')).map(p => p.textContent);
            return contestTitles.map((title, index) => {
                const contest = title.split(' Division')[0];
                const divisionNumber = parseInt(title.split('Division ')[1]?.split(' ')[0] || '0');
                const division = divMap[divisionNumber] || 'Unknown';
                const problems = solvedProblems[index]?.split(',').length || 0;
                return { contest, problems, division , divisionNumber };
            });
        }).flat();

        // Extract rating data using jsdom
        const resdata = await fetch(`https://www.codechef.com/users/${username}`);
        let d = await resdata.text();
        let data = { data: d };
        let allRating =
            data.data.search("var all_rating = ") + "var all_rating = ".length;
        let allRating2 = data.data.search("var current_user_rating =") - 6;
        let ratingData = JSON.parse(data.data.substring(allRating, allRating2));
        const result = contests.map(contest => {
            const rating = ratingData.find(r => r.code === `START${contest.contest.replace('Starters ', '')}D`);
            return {
                ...contest,
                ratingData: rating || {}
            };
        });

        await browser.close();
        return result;

        // await browser.close();
        // return { contests, ratingData };
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
