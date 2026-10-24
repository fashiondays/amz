document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const keywordFromQuery = params.get('q') || '';
    
    const cleanQuery = keywordFromQuery.replace(/-\d+$/, '');
    
    if (!cleanQuery) {
        runAGC('');
        return;
    }

    const targetHtml = cleanQuery + '.html';

    fetch(targetHtml)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
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

    function runAGC(keyword) {
        const detailTitle = document.getElementById('detail-title');
        const detailImageContainer = document.getElementById('detail-image-container');
        const detailBody = document.getElementById('detail-body');
        const relatedPostsContainer = document.getElementById('related-posts-container');
        
        const displayedKeywords = new Set();
        if (keyword) {
            displayedKeywords.add(keyword.toLowerCase());
        }
        
        function capitalizeEachWord(str) {
            if (!str) return '';
            return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
        
        function generateSeoTitle(baseKeyword) {
            const hookWords = ['Trendy', 'Stylish', 'Modern', 'Classic', 'Elegant', 'Chic', 'Gorgeous', 'Best', 'Amazing', 'Flawless'];
            const suffixWords = ['Fashion Inspo', 'Outfit Idea', 'Style Look', 'Fashion Look', 'Outfit Inspiration'];
            const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)];
            const randomSuffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];

            return `${randomHook} ${capitalizeEachWord(baseKeyword)} ${randomSuffix}`;
        }

        function fetchDescriptionTemplate(term, title) {
            fetch('deskripsi.txt')
                .then(response => response.text())
                .then(data => {
                    const templates = data.split('---').map(t => t.trim()).filter(t => t.length > 0);
                    if(templates.length > 0) {
                        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
                        let parsedText = processSpintax(randomTemplate);
                        parsedText = parsedText.replace(/%keyword%/g, `<strong>${capitalizeEachWord(term)}</strong>`);
                        
                        const htmlContent = parsedText.split('\n').map(line => `<p>${line}</p>`).join('');
                        if(detailBody) detailBody.innerHTML = htmlContent;
                    } else {
                        fallbackDescription(term);
                    }
                })
                .catch(() => fallbackDescription(term));
        }

        function fallbackDescription(term) {
            const spintaxArticleTemplate = `{Discover|Explore} the best <strong>${capitalizeEachWord(term)}</strong> {fashion inspiration|outfit ideas|fashion looks} to {instantly elevate|perfectly transform} your {look|personal style}.`;
            if(detailBody) detailBody.innerHTML = `<p>${processSpintax(spintaxArticleTemplate)}</p>`;
        }

        function processSpintax(text) {
            const spintaxPattern = /{([^{}]+)}/g;
            while (spintaxPattern.test(text)) {
                text = text.replace(spintaxPattern, (match, choices) => {
                    const options = choices.split('|');
                    return options[Math.floor(Math.random() * options.length)];
                });
            }
            return text;
        }

        if (!keyword) {
            if(detailTitle) detailTitle.textContent = 'Fashion Inspo Not Found';
            if(detailBody) detailBody.innerHTML = '<p>Sorry, the requested fashion inspiration could not be found. Please return to the <a href="index.html">homepage</a>.</p>';
            if (relatedPostsContainer) {
                relatedPostsContainer.closest('.related-posts-section').style.display = 'none';
            }
            return;
        }

        function populateMainContent(term) {
            const newTitle = generateSeoTitle(term);
            document.title = `${newTitle} | Fashion Inspo`;
            if(detailTitle) detailTitle.textContent = newTitle;
            
            // 2:3 Ratio API parameters
            const queryImage = term + " fashion outfit style inspiration";
            const mainImageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=600&h=900&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
            
            // Wrap main image with anchor tag linking to detail.html?q=
            const keywordForUrl = term.replace(/\s/g, '-').toLowerCase();
            if(detailImageContainer) detailImageContainer.innerHTML = `<a href="detail.html?q=${encodeURIComponent(keywordForUrl)}"><img src="${mainImageUrl}" alt="${newTitle}" style="width:100%; aspect-ratio:2/3; object-fit:cover; border-radius:8px;"></a>`;
            
            fetchDescriptionTemplate(term, newTitle);
        }

        function appendRandomKeywords() {
            fetch('keyword.txt')
                .then(response => response.text())
                .then(data => {
                    const keywords = data.split('\n')
                        .map(k => k.trim())
                        .filter(k => k.length > 0 && !displayedKeywords.has(k.toLowerCase()));
                    
                    if (keywords.length === 0) {
                        checkSectionDisplay();
                        return;
                    }
                    
                    for (let i = keywords.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [keywords[i], keywords[j]] = [keywords[j], keywords[i]];
                    }
                    
                    const selectedKeywords = keywords.slice(0, 5);
                    
                    selectedKeywords.forEach(relatedTerm => {
                        displayedKeywords.add(relatedTerm.toLowerCase());
                        
                        const keywordForUrl = relatedTerm.replace(/\s/g, '-').toLowerCase();
                        const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
                        
                        const queryImage = relatedTerm + " fashion outfit style inspiration";
                        const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=600&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                        
                        const newRelatedTitle = generateSeoTitle(relatedTerm);
                        
                        // Added style="display:none;" to content-card-body
                        const card = `<article class="content-card"><a href="${linkUrl}"><img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy"><div class="content-card-body" style="display:none;"><h3>${newRelatedTitle}</h3></div></a></article>`;
                        
                        if(relatedPostsContainer) relatedPostsContainer.innerHTML += card;
                    });
                    checkSectionDisplay();
                })
                .catch(error => {
                    console.error('Failed fetching keyword.txt:', error);
                    checkSectionDisplay();
                });
        }

        function checkSectionDisplay() {
            if (relatedPostsContainer && relatedPostsContainer.innerHTML.trim() === '') {
                relatedPostsContainer.closest('.related-posts-section').style.display = 'none';
            } else if (relatedPostsContainer) {
                relatedPostsContainer.closest('.related-posts-section').style.display = 'block';
            }
        }

        function generateRelatedPosts(term) {
            const script = document.createElement('script');
            script.src = `https://suggestqueries.google.com/complete/search?client=youtube&jsonp=handleRelatedSuggest&hl=en&q=${encodeURIComponent(term + " fashion inspiration")}`;
            document.head.appendChild(script);
            script.onload = () => script.remove();
            script.onerror = () => {
                if(relatedPostsContainer) relatedPostsContainer.innerHTML = '';
                script.remove();
                appendRandomKeywords();
            }
        }

        window.handleRelatedSuggest = function(data) {
            const suggestions = data[1];
            if(relatedPostsContainer) relatedPostsContainer.innerHTML = '';
            let relatedCount = 0;
            
            if (suggestions && suggestions.length > 0) {
                suggestions.forEach(item => {
                    const relatedTerm = typeof item === 'string' ? item : item[0];
                    let cleanTerm = relatedTerm ? relatedTerm.replace(/fashion|inspo|outfit|style/gi, '').trim() : '';
                    if (!cleanTerm) cleanTerm = relatedTerm;
                    const termLower = cleanTerm.toLowerCase();
                    
                    if (!termLower || displayedKeywords.has(termLower) || relatedCount >= 5) return;
                    
                    displayedKeywords.add(termLower);
                    relatedCount++;
                    
                    const keywordForUrl = cleanTerm.replace(/\s/g, '-').toLowerCase();
                    const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
                    
                    const queryImage = cleanTerm + " fashion outfit style inspiration";
                    const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=600&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                    
                    const newRelatedTitle = generateSeoTitle(cleanTerm);
                    
                    // Added style="display:none;" to content-card-body
                    const card = `<article class="content-card"><a href="${linkUrl}"><img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy"><div class="content-card-body" style="display:none;"><h3>${newRelatedTitle}</h3></div></a></article>`;
                    
                    if(relatedPostsContainer) relatedPostsContainer.innerHTML += card;
                });
            }
            appendRandomKeywords();
        };

        populateMainContent(keyword);
        generateRelatedPosts(keyword);
    }
});