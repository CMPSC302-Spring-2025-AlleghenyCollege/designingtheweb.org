/**
 * Search functionality for Designing the Web
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get search parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    
    // Update the search term display
    const searchTermElement = document.getElementById('search-term');
    if (searchTermElement) {
        searchTermElement.textContent = searchQuery || 'No search term provided';
    }
    
    // If no search query provided, show error
    if (!searchQuery && document.getElementById('content-area')) {
        document.getElementById('content-area').innerHTML = `
            <div class="no-results">
                <h2>No Search Term Provided</h2>
                <p>Please enter a search term in the search box.</p>
                <p><a href="/home.html">Return to home page</a></p>
            </div>
        `;
        return;
    }
    
    // Run search functionality
    if (searchQuery) {
        // For search results page, perform search across site content
        if (document.getElementById('content-area')) {
            performSearch(searchQuery);
        } 
        // For any other page, perform on-page search
        else {
            highlightOnPageSearch(searchQuery);
        }
    }
});

/**
 * Highlights and scrolls to search terms on the current page
 * @param {string} query - The search query
 */
function highlightOnPageSearch(query) {
    // Wait for page content to be fully loaded
    setTimeout(() => {
        // Find all text nodes in the document
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            // Skip script and style tags
            if (
                node.parentNode.tagName === 'SCRIPT' ||
                node.parentNode.tagName === 'STYLE' ||
                node.nodeValue.trim() === ''
            ) {
                continue;
            }
            
            if (node.nodeValue.toLowerCase().includes(query.toLowerCase())) {
                textNodes.push(node);
            }
        }
        
        // If any matches found, scroll to the first one
        if (textNodes.length > 0) {
            // Highlight all matches but scroll to the first one
            textNodes.forEach((node, index) => {
                const matchText = node.nodeValue;
                const regex = new RegExp(escapeRegExp(query), 'gi');
                
                // Use a wrapper element to process the HTML
                const wrapper = document.createElement('div');
                wrapper.innerHTML = matchText.replace(regex, '<mark class="highlight">$&</mark>');
                
                // Replace the text node with the highlighted version
                const fragment = document.createDocumentFragment();
                Array.from(wrapper.childNodes).forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        fragment.appendChild(child);
                    } else {
                        // For each element node (should be the mark elements)
                        const mark = document.createElement('mark');
                        mark.className = 'highlight';
                        mark.textContent = child.textContent;
                        fragment.appendChild(mark);
                    }
                });
                
                // Replace the original node
                node.parentNode.replaceChild(fragment, node);
                
                // Scroll to the first match
                if (index === 0) {
                    setTimeout(() => {
                        const firstHighlight = document.querySelector('.highlight');
                        if (firstHighlight) {
                            firstHighlight.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        }
                    }, 100);
                }
            });
            
            // Add a small message showing how many matches were found
            const searchCountContainer = document.createElement('div');
            searchCountContainer.id = 'search-count-container';
            searchCountContainer.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background-color: var(--accent-color);
                color: var(--primary-color);
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 1000;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            `;
            searchCountContainer.innerHTML = `Found <b>${textNodes.length}</b> match${textNodes.length === 1 ? '' : 'es'} for "${escapeHtml(query)}"`;
            document.body.appendChild(searchCountContainer);
            
            // Auto-remove the message after 5 seconds
            setTimeout(() => {
                searchCountContainer.style.opacity = '0';
                searchCountContainer.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    if (searchCountContainer.parentNode) {
                        searchCountContainer.parentNode.removeChild(searchCountContainer);
                    }
                }, 500);
            }, 5000);
        }
    }, 500);
}

/**
 * Perform search across site content
 * @param {string} query - The search query
 */
function performSearch(query) {
    // For demo purposes, we'll use a simple array of searchable content
    // In a real implementation, this would be replaced with actual content from the site
    // or an API call to a search service
    const searchableContent = [
        {
            title: "Introduction to HTML",
            url: "/resources.html#html",
            content: "HTML (Hypertext Markup Language) is the standard markup language for documents designed to be displayed in a web browser."
        },
        {
            title: "CSS Fundamentals",
            url: "/resources.html#css",
            content: "CSS (Cascading Style Sheets) is a style sheet language used for describing the presentation of a document written in HTML."
        },
        {
            title: "JavaScript Basics",
            url: "/resources.html#javascript",
            content: "JavaScript is a programming language that enables interactive web pages and is an essential part of web applications."
        },
        {
            title: "Course Syllabus",
            url: "/syllabus.html",
            content: "The course syllabus outlines the expectations, policies, and schedule for the Designing the Web course."
        },
        {
            title: "Quiz: HTML Fundamentals",
            url: "/quizzes.html#html-fundamentals",
            content: "Test your knowledge of HTML fundamentals with this interactive quiz."
        },
        {
            title: "Quiz: CSS Styling",
            url: "/quizzes.html#css-styling",
            content: "Evaluate your understanding of CSS styling concepts and techniques."
        },
        {
            title: "Web Accessibility Guidelines",
            url: "/resources.html#accessibility",
            content: "Web accessibility ensures that websites, tools, and technologies are designed and developed so that people with disabilities can use them."
        },
        {
            title: "Responsive Web Design",
            url: "/resources.html#responsive-design",
            content: "Responsive web design is an approach to web design that makes web pages render well on a variety of devices and window or screen sizes."
        }
    ];
    
    // Filter content based on search query
    const results = searchableContent.filter(item => {
        const lowerCaseQuery = query.toLowerCase();
        return (
            item.title.toLowerCase().includes(lowerCaseQuery) ||
            item.content.toLowerCase().includes(lowerCaseQuery)
        );
    });
    
    // Display results count
    const resultCountElement = document.getElementById('result-count');
    if (resultCountElement) {
        resultCountElement.textContent = results.length;
    }
    
    // Display search results
    const contentArea = document.getElementById('content-area');
    
    if (results.length === 0) {
        contentArea.innerHTML = `
            <div class="no-results">
                <h2>No Results Found</h2>
                <p>Your search for "${escapeHtml(query)}" did not match any documents.</p>
                <h3>Suggestions:</h3>
                <ul>
                    <li>Check your spelling</li>
                    <li>Try more general keywords</li>
                    <li>Try different keywords</li>
                </ul>
                <p><a href="/home.html">Return to home page</a></p>
            </div>
        `;
        return;
    }
    
    // Create HTML for search results
    let resultsHTML = '<div class="search-results-list">';
    
    results.forEach(result => {
        const highlightedTitle = highlightText(result.title, query);
        const highlightedContent = highlightText(result.content, query);
        
        resultsHTML += `
            <div class="search-result-item">
                <h2><a href="${result.url}">${highlightedTitle}</a></h2>
                <div class="result-url">${result.url}</div>
                <div class="result-content">${highlightedContent}</div>
            </div>
        `;
    });
    
    resultsHTML += '</div>';
    contentArea.innerHTML = resultsHTML;
}

/**
 * Highlight search terms in text
 * @param {string} text - The original text
 * @param {string} query - The search query to highlight
 * @returns {string} Text with highlighted search terms
 */
function highlightText(text, query) {
    if (!query) return text;
    
    const words = query.split(' ').filter(word => word.trim() !== '');
    let highlightedText = text;
    
    words.forEach(word => {
        if (word.length < 3) return; // Skip very short words
        
        const regex = new RegExp(`(${escapeRegExp(word)})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return highlightedText;
}

/**
 * Escape regular expression special characters
 * @param {string} text - The text to escape
 * @returns {string} Escaped text for use in regex
 */
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Escape HTML special characters
 * @param {string} text - The text to escape
 * @returns {string} HTML-escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
