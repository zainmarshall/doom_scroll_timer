let timerElement;
let totalElapsedTime = 0; // Total accumulated time
let dailyElapsedTime = 0; // Daily accumulated time
let intervalId; // ID for the interval timer
let startTime = null; // Start time for the current session

function createTimerElement() {
    timerElement = document.createElement('div');
    timerElement.style.position = 'fixed';
    timerElement.style.top = '200px'; // Vertically center
    timerElement.style.right = '20px'; // Move to the left
    timerElement.style.transform = 'translateY(-50%)'; // Adjust for perfect centering
    timerElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    timerElement.style.color = 'red'; // Change font color to red
    timerElement.style.padding = '10px 20px';
    timerElement.style.borderRadius = '5px';
    timerElement.style.fontSize = '24px'; // Increase font size
    timerElement.style.fontFamily = 'Impact, Charcoal, sans-serif'; // Use Impact font
    timerElement.style.textTransform = 'uppercase'; // All caps
    timerElement.style.zIndex = '1000';
    document.body.appendChild(timerElement);
}

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
}

function updateTimer() {
    if (startTime) {
        const currentTime = Date.now();
        const elapsedSessionTime = Math.floor((currentTime - startTime) / 1000);
        timerElement.innerHTML = `Total Time Wasted: ${formatTime(totalElapsedTime + elapsedSessionTime)}<br>Daily Time Wasted: ${formatTime(dailyElapsedTime + elapsedSessionTime)}`;
    } else {
        timerElement.innerHTML = `Total Time Wasted: ${formatTime(totalElapsedTime)}<br>Daily Time Wasted: ${formatTime(dailyElapsedTime)}`;
    }

    // Save the total and daily time to chrome storage
    chrome.storage.local.set({ totalElapsedTime: totalElapsedTime, dailyElapsedTime: dailyElapsedTime });
}

function startTimer() {
    if (!startTime) {
        startTime = Date.now(); // Only set startTime if it is not already set
        intervalId = setInterval(updateTimer, 1000); // Start the timer interval
    }
}

function onVideoPlay() {
    startTimer();
}

function onVideoPause() {
    if (startTime) {
        const pausedDuration = Date.now() - startTime; // Calculate how long the video was playing
        totalElapsedTime += Math.floor(pausedDuration / 1000); // Add paused duration to total
        dailyElapsedTime += Math.floor(pausedDuration / 1000); // Add paused duration to daily
        startTime = null; // Reset startTime for the next play session
        clearInterval(intervalId); // Stop updating the timer
    }
}

function observeVideo() {
    const video = document.querySelector('video');
    if (video) {
        video.addEventListener('play', onVideoPlay);
        video.addEventListener('pause', onVideoPause);
    }
}

// Load the stored totalElapsedTime and dailyElapsedTime from chrome.storage
chrome.storage.local.get(['totalElapsedTime', 'dailyElapsedTime', 'lastResetDate'], (data) => {
    if (data.totalElapsedTime) {
        totalElapsedTime = data.totalElapsedTime; // Set totalElapsedTime to stored value
    }
    if (data.dailyElapsedTime) {
        dailyElapsedTime = data.dailyElapsedTime; // Set dailyElapsedTime to stored value
    }
    const today = new Date().toDateString();
    if (data.lastResetDate !== today) {
        dailyElapsedTime = 0; // Reset daily time if the date has changed
        chrome.storage.local.set({ lastResetDate: today });
    }
    createTimerElement();
    updateTimer(); // Initialize the display
});

// Start observing video elements every second
setInterval(observeVideo, 1000);