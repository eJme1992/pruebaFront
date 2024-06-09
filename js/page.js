let timerInterval;
let milliseconds = 0;
let seconds = 0;
let minutes = 0;
var isActive = false

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 10);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    milliseconds = 0;
    seconds = 0;
    minutes = 0;
    updateTimer();
}

function updateTimer() {
    milliseconds += 10;
    if (milliseconds >= 1000) {
        milliseconds = 0;
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }
    }

    const formattedMilliseconds = pad(milliseconds, 3);
    const formattedSeconds = pad(seconds, 2);
    const formattedMinutes = pad(minutes, 2);

    document.getElementById("timer").innerText = `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;
}

function pad(number, width) {
    return String(number).padStart(width, '0');
}

$('document').ready(function() {
    var nextBtn = $('.sd-btn sd-navigation__next-btn')
    nextBtn && nextBtn.addEventListener('click', function() {
        if (isActive) {
            startTimer()
        } else {
            stopTimer()
        }
       
    })
})