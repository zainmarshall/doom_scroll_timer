let timerElement;
let totalElapsedTime = 0; // Total accumulated time
let intervalId; // ID for the interval timer
let startTime = null; // Start time for the current session

function createTimerElement() {
    timerElement = document.createElement('div');
    timerElement.style.position = 'fixed';
    timerElement.style.top = '50px'; // Move down from the top
    timerElement.style.right = '10px';
    timerElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    timerElement.style.color = 'white';
    timerElement.style.padding = '5px 10px';
    timerElement.style.borderRadius = '5px';
    timerElement.style.fontSize = '16px';
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
        timerElement.textContent = `Total Time: ${formatTime(totalElapsedTime + elapsedSessionTime)}`;
    } else {
        timerElement.textContent = `Total Time: ${formatTime(totalElapsedTime)}`;
    }

    // Save the total time to chrome storage
    chrome.storage.local.set({ totalElapsedTime: totalElapsedTime });
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

// Load the stored totalElapsedTime from chrome.storage
chrome.storage.local.get('totalElapsedTime', (data) => {
    if (data.totalElapsedTime) {
        totalElapsedTime = data.totalElapsedTime; // Set totalElapsedTime to stored value
    }
    createTimerElement();
    updateTimer(); // Initialize the display
});

// Start observing video elements every second
setInterval(observeVideo, 1000);