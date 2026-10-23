// ANTI-FBCLID: Clean the URL instantly so ad scripts fire correctly
if (window.location.search.includes('fbclid=')) {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('fbclid');
    window.history.replaceState(null, '', cleanUrl.toString());
}

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const keywordFromQuery = params.get('q') || '';
    const cleanQuery = keywordFromQuery.replace(/-\d+$/, '');
    
    if (!cleanQuery) {
        runAGC('Fashion Trends');
        return;
    }

    const targetHtml = cleanQuery + '.html';

    // Check if a static generated file exists
    fetch(targetHtml)
        .then(response => {
            if (response.ok) { return response.text(); }
            throw new Error('File not found');
        })
        .then(htmlData => {
            document.open();
            document.write(htmlData);
            document.close();
        })
        .catch(error => {
            const keyword = cleanQuery.replace(/-/g, ' ').trim();
            runAGC(keyword);
        });

    // ========================================================
    // AGC (Auto Generated Content) via GNews API
    // ========================================================
    function runAGC(keyword) {
        const detailTitle = document.getElementById('detail-title');
        const detailBody = document.getElementById('detail-body');
        const detailImage = document.querySelector('.detail-image img');
        const detailImageLink = document.querySelector('.detail-image a');
        
        if (detailTitle) detailTitle.innerText = "Loading stories about: " + keyword + "...";
        
        const API_KEY = '27939599ce1878b93bcd203d6fc0eefe'; 
        const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keyword)}&lang=en&country=us&max=5&apikey=${API_KEY}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.articles && data.articles.length > 0) {
                    const article = data.articles[0];
                    
                    if (detailTitle) detailTitle.innerText = article.title;
                    
                    if (detailImage && article.image) {
                        detailImage.src = article.image;
                        detailImage.alt = article.title;
                        if (detailImageLink) detailImageLink.href = article.image;
                    }

                    if (detailBody) {
                        let contentHtml = `<p style="color:#8a7a68; font-size:0.82rem; letter-spacing:0.08em; text-transform:uppercase;"><em>${article.source.name} &middot; ${new Date(article.publishedAt).toLocaleDateString()}</em></p>`;
                        contentHtml += `<p style="font-weight:500; font-size:1.15rem; color:#2d2824;">${article.description}</p>`;
                        contentHtml += `<p>${article.content}</p>`;
                        contentHtml += `<p><a href="${article.url}" target="_blank" rel="nofollow" style="color:#b8975f; font-weight:600; text-decoration:underline;">Read the full story &raquo;</a></p>`;
                        detailBody.innerHTML = contentHtml;
                    }
                } else {
                    fallbackAGC(keyword);
                }
            })
            .catch(error => {
                console.error("API Fetch Error or limit reached:", error);
                fallbackAGC(keyword);
            });

        function fallbackAGC(kw) {
            const titleCap = kw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            if (detailTitle) detailTitle.innerText = titleCap + " - Style & Trends";
            
            const queryImage = kw + " fashion style";
            const imgUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=1200&h=700&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
            
            if (detailImage) {
                detailImage.src = imgUrl;
                detailImage.alt = titleCap;
                if (detailImageLink) detailImageLink.href = imgUrl;
            }

            if (detailBody) {
                detailBody.innerHTML = `<p>Welcome to the latest editorial coverage on <strong>${titleCap}</strong>. Our team brings you curated insights and thoughtful commentary on what is shaping the style conversation right now.</p>
                <p>Whether you are refining your personal aesthetic or simply curious about the evolving fashion landscape, understanding <em>${kw}</em> offers a fresh perspective on contemporary elegance and self-expression.</p>
                <p>Industry insiders and style enthusiasts continue to weigh in as this story develops. We will keep you updated with considered analysis and expert perspectives as new details emerge.</p>`;
            }
        }
    }
});