document.getElementById('searchForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const keyword = document.getElementById('keyword').value.trim();

    if (!keyword) {
        alert('Please enter a keyword.');
        return;
    }

    // Show loading indicator
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('saveBtn').style.display = 'none';

    try {
        const response = await fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ keyword })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const results = await response.json();

        if (Array.isArray(results) && results.length > 0) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '';

            results.forEach(result => {
                if (result && result.title && result.link) {
                    const resultDiv = document.createElement('div');
                    resultDiv.classList.add('result');

                    const link = document.createElement('a');
                    link.href = result.link;
                    link.textContent = result.title;
                    link.target = "_blank";

                    const linkText = document.createElement('div');
                    linkText.textContent = result.link;
                    linkText.classList.add('link');

                    resultDiv.appendChild(link);
                    resultDiv.appendChild(linkText);
                    resultsDiv.appendChild(resultDiv);
                }
            });

            document.getElementById('saveBtn').style.display = 'block';
        } else {
            document.getElementById('results').innerHTML = 'No results found.';
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
        alert('An error occurred while fetching search results. Please try again.');
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('results').style.display = 'block';
    }
});

document.getElementById('saveBtn').addEventListener('click', function() {
    const resultsDiv = document.getElementById('results');
    const results = Array.from(resultsDiv.querySelectorAll('.result')).map(result => ({
        title: result.querySelector('a').textContent,
        link: result.querySelector('.link').textContent
    }));

    if (results.length > 0) {
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'results.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        alert('No results to save.');
    }
});
