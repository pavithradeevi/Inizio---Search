const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer-core'); // Use puppeteer-core instead
const chrome = require('chrome-aws-lambda'); // Import chrome-aws-lambda

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/search', async (req, res) => {
    const { keyword } = req.body;

    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }

    try {
        // Launch Puppeteer with the appropriate settings for Heroku
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                ...chrome.args, // Use arguments from chrome-aws-lambda
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Prevents issues on Heroku
            ],
            executablePath: await chrome.executablePath, // Use chrome-aws-lambda executable path
        });
        
        const page = await browser.newPage();
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(keyword)}`, { waitUntil: 'networkidle2' });

        const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('div.g'));
            return items.map(item => {
                const titleElement = item.querySelector('h3');
                const linkElement = item.querySelector('a');
                const title = titleElement ? titleElement.innerText : null;
                const link = linkElement ? linkElement.href : null;
                return title && link ? { title, link } : null;
            }).filter(result => result !== null);
        });

        await browser.close();
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching search results' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
