// --- DATA & STATE ---
const genres = ['rock', 'classical', 'jazz', 'electronic'];
const genreEmojis = { rock: '🎸', classical: '🎻', jazz: '🎷', electronic: '🎛️' };
const genreNamesFR = { rock: 'le rock', classical: 'la classique', jazz: 'le jazz', electronic: 'l\'électronique' };

let currentTrackIndex = 0;
let playlist = [];
let audioContext; // Для обхода autoplay политик в браузерах

// --- AUDIO SETUP ---
function playSound(src) {
    const audio = new Audio(src);
    audio.play().catch(e => console.log("Audio play failed:", e));
    return audio;
}

function playSFX(type) {
    playSound(`assets/audio/sfx_${type}.mp3`);
}

// --- SCREEN MANAGEMENT ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// --- GAME LOGIC ---
function startGame() {
    playSFX('click');
    currentTrackIndex = 0;
    playlist = [];
    showScreen('screen-match');
    loadMatchRound();
}

function loadMatchRound() {
    // Перемешиваем жанры для кнопок (опционально, пока просто по порядку)
    const currentGenre = genres[currentTrackIndex];
    
    // Обработчики на кнопки жанров
    document.querySelectorAll('.btn-genre').forEach(btn => {
        btn.onclick = () => checkGenreMatch(btn.dataset.genre, currentGenre);
    });
}

function checkGenreMatch(selected, correct) {
    if (selected === correct) {
        playSFX('success');
        showReactScreen(correct);
    } else {
        playSFX('error');
        // Визуальная подсветка ошибки (можно добавить класс shake)
    }
}

function showReactScreen(genre) {
    showScreen('screen-react');
    const display = document.getElementById('current-genre-display');
    display.innerHTML = `${genreEmojis[genre]} <br> <span style="font-size:1.5rem">${genreNamesFR[genre]}</span>`;
    
    // Сохраняем текущий жанр для кнопок реакции
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
        showResults();
    }
}

function showResults() {
    showScreen('screen-result');
    const container = document.getElementById('playlist-container');
    container.innerHTML = '';
    
    if (playlist.length === 0) {
        container.innerHTML = '<p style="font-size:1.2rem; color:#666;">You didn\'t like anything! 😅</p>';
        return;
    }

    playlist.forEach(genre => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.textContent = `❤️ J'aime ${genreNamesFR[genre]}`;
        container.appendChild(item);
    });
}

// --- EVENT LISTENERS ---
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);

document.getElementById('btn-play-audio').addEventListener('click', () => {
    const track = genres[currentTrackIndex];
    playSound(`assets/audio/track_${track}.mp3`);
});