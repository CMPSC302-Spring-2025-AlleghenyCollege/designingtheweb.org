// Ad carousel images - using PNG files from correct directory
const images = [
    "/images/ad1.png",
    "/images/ad2.png",
    "/images/ad3.png",
    "/images/ad4.png"  // Make sure to use ad4.png instead of ad.png
];

// Store current index for each side
const idx = { left: 0, right: 1 };

// Update image with fade effect
function updateImage(side) {
    const img = document.getElementById(`img-${side}`);
    if (!img) return;
    
    // Add fade-out effect
    img.style.opacity = 0;
    
    // Change source after short delay for smooth transition
    setTimeout(() => {
        // Make sure we're not using the same ad on both sides at the same time
        if (side === 'right') {
            // For right side, always use a different image than left side
            const leftIdx = idx['left'];
            let rightIdx = idx['right'];
            if (rightIdx === leftIdx) {
                rightIdx = (rightIdx + 1) % images.length;
                idx['right'] = rightIdx;
            }
            img.src = images[rightIdx];
        } else {
            img.src = images[idx[side]];
        }
        
        // Add error handling for image loading
        img.onerror = function() {
            console.error(`Failed to load image: ${img.src}`);
            // Try the next image
            if (side === 'left') {
                idx[side] = (idx[side] + 1) % images.length;
                updateImage(side);
            } else {
                // For right side, try a different image
                idx[side] = (idx[side] + 2) % images.length;
                updateImage(side);
            }
        };
        
        img.onload = function() {
            img.style.opacity = 1;
        };
    }, 150);
}

// Advance to next image
function displayNextImage(side) {
    idx[side] = (idx[side] + 1) % images.length;
    updateImage(side);
}

// Go to previous image
function displayPreviousImage(side) {
    idx[side] = (idx[side] - 1 + images.length) % images.length;
    updateImage(side);
}

// Initialize ads and start rotation
function startAds() {
    // Check if we have the ad elements on the page
    const leftImg = document.getElementById('img-left');
    const rightImg = document.getElementById('img-right');
    
    if (leftImg && rightImg) {
        // Directly set initial images for faster loading
        leftImg.src = images[0];
        rightImg.src = images[1];
        
        // Add transition CSS for smooth fading
        leftImg.style.transition = "opacity 0.3s ease";
        rightImg.style.transition = "opacity 0.3s ease";
        
        // Set different initial indices
        idx.left = 0;
        idx.right = 1;
        
        // Start rotation with slight delay to ensure initial images load
        setTimeout(() => {
            // Set intervals to exactly 5 seconds for both ads as requested
            const leftInterval = setInterval(() => displayNextImage("left"), 3000);
            const rightInterval = setInterval(() => displayNextImage("right"), 3000);
            
            // Store intervals in window object to be able to clear them if needed
            window.adIntervals = {
                left: leftInterval,
                right: rightInterval
            };
        }, 1000);
    }
}

// Handle visibility changes to stop/start rotation when tab is hidden/visible
// This helps save resources when the user is not viewing the page
document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        // Clear intervals when page is not visible
        if (window.adIntervals) {
            clearInterval(window.adIntervals.left);
            clearInterval(window.adIntervals.right);
        }
    } else {
        // Restart intervals when page becomes visible again
        if (window.adIntervals) {
            window.adIntervals.left = setInterval(() => displayNextImage("left"), 3000);
            window.adIntervals.right = setInterval(() => displayNextImage("right"), 3000);
        }
    }
});

// Start when DOM is fully loaded
document.addEventListener("DOMContentLoaded", startAds);

// Expose functions globally so they can be called from HTML buttons
window.displayNextImage = displayNextImage;
window.displayPreviousImage = displayPreviousImage;
