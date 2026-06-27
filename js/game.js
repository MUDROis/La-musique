// --- DATA & STATE ---
const genres = ['rock', 'classical', 'jazz', 'electronic'];
const genreEmojis = { rock: '🎸', classical: '🎻', jazz: '🎷', electronic: '🎛️' };
const genreNamesFR = { rock: 'le rock', classical: 'la classique', jazz: 'le jazz', electronic: 'l\'électronique' };

const phraseMemory = {
    rock: { fr: 'J\'aime le rock', en: 'I like rock' },
    classical: { fr: 'Je n\'aime pas la classique', en: 'I don\'t like classical' },
    jazz: { fr: 'J\'adore le jazz', en: 'I love jazz' },
    electronic: { fr: 'Je déteste l\'électronique', en: 'I hate electronic' }
};

const practiceQuestions = [
    {
        question: 'How do you say "I like rock" in French?',
        options: ['J\'aime le rock', 'Je n\'aime pas le rock', 'J\'adore le jazz', 'Je déteste la classique'],
        correct: 0,
        phrase: 'J\'aime le rock'
    },
    {
        question: 'How do you say "I don\'t like classical" in French?',
        options: ['J\'aime la classique', 'Je n\'aime pas la classique', 'J\'adore le rock', 'Je déteste le jazz'],
        correct: 1,
        phrase: 'Je n\'aime pas la classique'
    },
    {
        question: 'How do you say "I love jazz" in French?',
        options: ['J\'aime le jazz', 'Je n\'aime pas le jazz', 'J\'adore le jazz', 'Je déteste le jazz'],
        correct: 2,
        phrase: 'J\'adore le jazz'
    },
    {
        question: 'How do you say "I hate electronic" in French?',
        options: ['J\'aime l\'électronique', 'Je n\'aime pas l\'électronique', 'J\'adore l\'électronique', 'Je déteste l\'électronique'],
        correct: 3,
        phrase: 'Je déteste l\'électronique'
    }
];

let currentTrackIndex = 0;
let playlist = [];
let practiceIndex = 0;
let practiceCorrect = 0;
let currentAudio = null;

// --- AUDIO ---
function playSound(src) {
    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    
    const audio = new Audio(src);
    currentAudio = audio;
    
    audio.play().catch(e => console.log("Audio play failed:", e));
    
    audio.addEventListener('ended', () => {
        updatePlayPauseButton('play');
    });
    
    audio.addEventListener('pause', () => {
        updatePlayPauseButton('play');
    });
    
    audio.addEventListener('play', () => {
        updatePlayPauseButton('pause');
    });
    
    return audio;
}

function playSFX(type) {
    playSound(`assets/audio/sfx_${type}.mp3`);
}

function updatePlayPauseButton(state) {
    const btn = document.getElementById('btn-play-pause');
    if (btn) {
        btn.textContent = state === 'play' ? '▶️ Play' : '⏸️ Pause';
    }
}

// --- SCREENS ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// --- GAME ---
function startGame() {
    playSFX('click');
    currentTrackIndex = 0;
    playlist = [];
    practiceIndex = 0;
    practiceCorrect = 0;
    
    // Stop any playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    
    showScreen('screen-match');
    loadMatchRound();
}

function loadMatchRound() {
    const currentGenre = genres[currentTrackIndex];
    document.getElementById('track-progress').textContent = `${currentTrackIndex + 1} / ${genres.length}`;
    
    document.querySelectorAll('.btn-genre').forEach(btn => {
        btn.classList.remove('shake', 'pop');
        btn.onclick = () => checkGenreMatch(btn.dataset.genre, currentGenre);
    });
}

function checkGenreMatch(selected, correct) {
    const buttons = document.querySelectorAll('.btn-genre');
    buttons.forEach(btn => {
        if (btn.dataset.genre === selected) {
            if (selected === correct) {
                btn.classList.add('pop');
                setTimeout(() => btn.classList.remove('pop'), 300);
            } else {
                btn.classList.add('shake');
                setTimeout(() => btn.classList.remove('shake'), 400);
            }
        }
    });
    
    if (selected === correct) {
        playSFX('success');
        setTimeout(() => showReactScreen(correct), 400);
    } else {
        playSFX('error');
    }
}

function showReactScreen(genre) {
    showScreen('screen-react');
    const display = document.getElementById('current-genre-display');
    display.innerHTML = `${genreEmojis[genre]} <br> <span style="font-size:1.5rem">${genreNamesFR[genre]}</span>`;
    
    const mem = phraseMemory[genre];
    document.getElementById('phrase-memorize').innerHTML = `📖 <strong>Memorize:</strong> ${mem.fr} = ${mem.en}`;
    
    document.getElementById('btn-like').onclick = () => handleReaction(genre, true);
    document.getElementById('btn-dislike').onclick = () => handleReaction(genre, false);
}

function handleReaction(genre, isLiked) {
    playSFX('click');
    if (isLiked) {
        playlist.push(genre);
    }
    
    currentTrackIndex++;
    if (currentTrackIndex < genres.length) {
        showScreen('screen-match');
        loadMatchRound();
    } else {
        startPractice();
    }
}

// --- PRACTICE ---
function startPractice() {
    practiceIndex = 0;
    practiceCorrect = 0;
    showScreen('screen-practice');
    loadPracticeQuestion();
}

function loadPracticeQuestion() {
    if (practiceIndex >= practiceQuestions.length) {
        showResults();
        return;
    }
    const q = practiceQuestions[practiceIndex];
    document.getElementById('practice-progress').textContent = `Question ${practiceIndex + 1} / ${practiceQuestions.length}`;
    document.getElementById('practice-question').textContent = q.question;
    document.getElementById('practice-feedback').textContent = '';
    
    const container = document.getElementById('practice-options');
    container.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-genre';
        btn.textContent = opt;
        btn.dataset.index = idx;
        btn.onclick = () => checkPracticeAnswer(idx);
        container.appendChild(btn);
    });
}

function checkPracticeAnswer(selected) {
    const q = practiceQuestions[practiceIndex];
    const buttons = document.querySelectorAll('#practice-options button');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === q.correct) {
            btn.style.borderColor = '#7ed321';
            btn.style.background = '#eaffd6';
        } else if (idx === selected && idx !== q.correct) {
            btn.style.borderColor = '#d0021b';
            btn.style.background = '#ffd6d6';
        }
    });
    
    const feedback = document.getElementById('practice-feedback');
    if (selected === q.correct) {
        practiceCorrect++;
        feedback.textContent = '✅ Correct!';
        feedback.style.color = '#7ed321';
        playSFX('success');
    } else {
        feedback.textContent = `❌ Oops! The correct answer was: "${q.options[q.correct]}"`;
        feedback.style.color = '#d0021b';
        playSFX('error');
    }
    
    setTimeout(() => {
        practiceIndex++;
        loadPracticeQuestion();
    }, 1800);
}

// --- RESULTS ---
function showResults() {
    showScreen('screen-result');
    const container = document.getElementById('playlist-container');
    container.innerHTML = '';
    
    if (playlist.length === 0) {
        container.innerHTML = '<p style="font-size:1.2rem; color:#666;">You didn\'t like anything! 😅</p>';
    } else {
        playlist.forEach(genre => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            item.textContent = `❤️ J'aime ${genreNamesFR[genre]}`;
            container.appendChild(item);
        });
    }
    
    document.getElementById('practice-result').textContent = `📊 Practice: ${practiceCorrect} / ${practiceQuestions.length} correct!`;
}

// --- EVENT LISTENERS ---
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);

// Play/Pause button
document.getElementById('btn-play-pause').addEventListener('click', () => {
    const currentGenre = genres[currentTrackIndex];
    const trackUrl = `assets/audio/track_${currentGenre}.mp3`;
    
    if (!currentAudio) {
        // Start playing
        playSound(trackUrl);
        updatePlayPauseButton('pause');
    } else if (currentAudio.paused) {
        // Resume playing
        currentAudio.play();
        updatePlayPauseButton('pause');
    } else {
        // Pause playing
        currentAudio.pause();
        updatePlayPauseButton('play');
    }
});

// Stop button
document.getElementById('btn-stop').addEventListener('click', () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    updatePlayPauseButton('play');
});

// Original play button (kept for compatibility)
document.getElementById('btn-play-audio').addEventListener('click', () => {
    const track = genres[currentTrackIndex];
    playSound(`assets/audio/track_${track}.mp3`);
});
