const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors'); 
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors()); 
app.use(express.static('public'));

app.post('/search', async (req, res) => {
    const { keyword } = req.body;
    console.log('Received keyword:', keyword);
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }
    
    try {
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.NODE_ENV === 'production' ? '/usr/bin/google-chrome-stable' : undefined,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
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
        console.error('Error in /search:', error); 
        res.status(500).json({ error: 'Error fetching search results', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
