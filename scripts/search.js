/**
 * Simple search functionality for Designing the Web
 * This script highlights and scrolls to search terms on the current page
 */

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', initSearch);

function initSearch() {
  // Get search parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('q');
  
  // Early exit if no search query provided
  if (!searchQuery || searchQuery.trim() === '') {
    return;
  }
  
  console.log('Search query detected:', searchQuery);
  
  // Perform the search after a short delay to ensure page content is loaded
  setTimeout(() => performSearch(searchQuery), 500);
}

/**
 * Main search function - finds and highlights all instances of the search term on the page
 */
function performSearch(query) {
  if (!query || query.trim() === '') return;
  
  const searchTerm = query.trim();
  
  // First clean up any previous highlights
  clearHighlights();
  
  // Find and highlight all instances
  const highlightCount = highlightMatches(searchTerm);
  
  // Show notification with results count
  if (highlightCount > 0) {
    showNotification(highlightCount, searchTerm);
    scrollToFirstHighlight();
  } else {
    showNotification(0, searchTerm);
  }
}

/**
 * Remove any existing highlights from previous searches
 */
function clearHighlights() {
  const existingHighlights = document.querySelectorAll('.search-highlight');
  existingHighlights.forEach(el => {
    // Replace highlight with its text content
    const textNode = document.createTextNode(el.textContent);
    el.parentNode.replaceChild(textNode, el);
  });
  
  // Remove notification if it exists
  const notification = document.getElementById('search-notification');
  if (notification) {
    notification.parentNode.removeChild(notification);
  }
}

/**
 * Highlight all instances of the search term in text nodes
 */
function highlightMatches(searchTerm) {
  let count = 0;
  const searchRegex = new RegExp(escapeRegExp(searchTerm), 'gi');
  
  // Walk through all text nodes in the document body
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip empty nodes and nodes inside scripts, styles, etc.
        const parentTag = node.parentNode.tagName;
        if (
          node.nodeValue.trim() === '' ||
          parentTag === 'SCRIPT' || 
          parentTag === 'STYLE' || 
          parentTag === 'NOSCRIPT' || 
          parentTag === 'IFRAME'
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Only accept nodes with our search term
        return searchRegex.test(node.nodeValue) 
          ? NodeFilter.FILTER_ACCEPT 
          : NodeFilter.FILTER_REJECT;
      }
    }
  );
  
  const matchedNodes = [];
  let currentNode;
  
  // Collect all nodes with matches first
  while (currentNode = walker.nextNode()) {
    matchedNodes.push(currentNode);
  }
  
  // Process the matches
  matchedNodes.forEach(textNode => {
    const parentNode = textNode.parentNode;
    const text = textNode.nodeValue;
    
    // Reset regex
    searchRegex.lastIndex = 0;
    
    // Create document fragment to hold the result
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    
    // Find all matches in this text node
    while ((match = searchRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.substring(lastIndex, match.index))
        );
      }
      
      // Create the highlight element
      const highlightEl = document.createElement('mark');
      highlightEl.className = 'search-highlight';
      highlightEl.appendChild(document.createTextNode(match[0]));
      highlightEl.style.backgroundColor = 'var(--accent-color, #FFEB96)';
      highlightEl.style.color = 'var(--primary-color, #1B3054)';
      fragment.appendChild(highlightEl);
      
      // Update loop variables
      lastIndex = match.index + match[0].length;
      count++;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(
        document.createTextNode(text.substring(lastIndex))
      );
    }
    
    // Replace the original text node with our fragment
    if (lastIndex > 0) {
      parentNode.replaceChild(fragment, textNode);
    }
  });
  
  return count;
}

/**
 * Scroll to the first highlighted term
 */
function scrollToFirstHighlight() {
  const firstHighlight = document.querySelector('.search-highlight');
  
  if (firstHighlight) {
    // Scroll to the highlight with smooth animation
    firstHighlight.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    
    // Add a pulsing effect to draw attention
    firstHighlight.style.transition = 'box-shadow 0.3s ease-in-out';
    firstHighlight.style.boxShadow = '0 0 0 4px rgba(255, 235, 150, 0.7)';
    
    setTimeout(() => {
      firstHighlight.style.boxShadow = 'none';
    }, 2000);
  }
}

/**
 * Show notification with results
 */
function showNotification(count, query) {
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'search-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: var(--accent-color, #FFEB96);
    color: var(--primary-color, #1B3054);
    padding: 10px 15px;
    border-radius: 5px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    z-index: 10000;
    font-size: 14px;
    font-weight: bold;
    max-width: 300px;
  `;
  
  // Set the notification message
  if (count > 0) {
    notification.textContent = `Found ${count} match${count === 1 ? '' : 'es'} for "${query}"`;
  } else {
    notification.textContent = `No matches found for "${query}"`;
  }
  
  // Add to document
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s ease';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }
  }, 5000);
}

/**
 * Utility: Escape special regex characters in string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
