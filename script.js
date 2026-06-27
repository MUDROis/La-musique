// ----- DATA -----
const vocabulary = [
  { fr: 'la chanson', en: 'song' },
  { fr: 'le chanteur', en: 'singer' },
  { fr: "l'instrument", en: 'instrument' },
  { fr: 'écouter', en: 'to listen' },
  { fr: 'jouer', en: 'to play' },
  { fr: 'la musique', en: 'music' },
  { fr: "j'aime", en: 'I like' },
  { fr: "je n'aime pas", en: "I don't like" },
  { fr: "j'adore", en: 'I love' },
  { fr: "je déteste", en: 'I hate' },
  { fr: 'le rock', en: 'rock' },
  { fr: 'le jazz', en: 'jazz' },
  { fr: 'la classique', en: 'classical' },
  { fr: "l'électronique", en: 'electronic' },
  { fr: 'la guitare', en: 'guitar' }
];

// ----- DIALOGUES with translations and keywords -----
const dialogues = [
  {
    lines: [
      { fr: 'Tu aimes la musique ?', en: 'Do you like music?' },
      { fr: 'Oui, j’adore. Et toi ?', en: 'Yes, I love it. And you?' },
      { fr: 'Moi, j’aime le rock.', en: 'I like rock.' }
    ],
    keywords: ['j\'adore', 'j\'aime', 'le rock']
  },
  {
    lines: [
      { fr: 'Qu’est‑ce que tu écoutes ?', en: 'What do you listen to?' },
      { fr: 'J’écoute du jazz. Et toi ?', en: 'I listen to jazz. And you?' },
      { fr: 'Je n’aime pas le jazz, je préfère la classique.', en: 'I don\'t like jazz, I prefer classical.' }
    ],
    keywords: ['le jazz', 'je n\'aime pas', 'la classique']
  },
  {
    lines: [
      { fr: 'Tu joues d’un instrument ?', en: 'Do you play an instrument?' },
      { fr: 'Oui, je joue de la guitare.', en: 'Yes, I play guitar.' },
      { fr: 'Moi, je ne joue pas, mais j’aime chanter.', en: 'I don\'t play, but I like singing.' }
    ],
    keywords: ['la guitare', 'j\'aime']   // "jouer" is not a preference expression or genre, we only include genres and j'aime/n'aime pas/adore/déteste
  },
  {
    lines: [
      { fr: 'Quel genre de musique aimes‑tu ?', en: 'What genre of music do you like?' },
      { fr: 'J’adore l’électronique.', en: 'I love electronic.' },
      { fr: 'Moi, je déteste l’électronique, je préfère le rock.', en: 'I hate electronic, I prefer rock.' }
    ],
    keywords: ['j\'adore', 'l\'électronique', 'je déteste', 'le rock']
  },
  {
    lines: [
      { fr: 'La musique, c’est important pour toi ?', en: 'Is music important to you?' },
      { fr: 'Oui, j’écoute de la musique tous les jours.', en: 'Yes, I listen to music every day.' },
      { fr: 'Moi aussi, j’aime la chanson française.', en: 'Me too, I like French song.' }
    ],
    keywords: ['j\'aime', 'la chanson']   // "la chanson" is a genre? We'll include it as a keyword, but we can treat it as a genre-like word.
  }
];

// All possible keywords for selection (unique)
const allPossibleKeywords = [
  'le rock', 'le jazz', 'la classique', 'l\'électronique',
  'j\'aime', 'je n\'aime pas', 'j\'adore', 'je déteste',
  'la guitare', 'la chanson'  // added guitar and song as possible
];

// ----- SPEECH SYNTHESIS -----
function speakText(text, lang = 'fr-FR') {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

// ----- FLASHCARDS -----
let currentCard = 0;
const flipCard = document.getElementById('flipCard');
const frontWord = document.getElementById('frontWord');
const backWord = document.getElementById('backWord');
const cardCounter = document.getElementById('cardCounter');
const speakFront = document.getElementById('speakFront');

function updateCard(index) {
  frontWord.textContent = vocabulary[index].fr;
  backWord.textContent = vocabulary[index].en;
  flipCard.classList.remove('flipped');
  cardCounter.textContent = `${index + 1} / ${vocabulary.length}`;
}
document.getElementById('prevCard').addEventListener('click', () => {
  currentCard = (currentCard - 1 + vocabulary.length) % vocabulary.length;
  updateCard(currentCard);
});
document.getElementById('nextCard').addEventListener('click', () => {
  currentCard = (currentCard + 1) % vocabulary.length;
  updateCard(currentCard);
});
document.getElementById('flipBtn').addEventListener('click', () => flipCard.classList.toggle('flipped'));
flipCard.addEventListener('click', () => flipCard.classList.toggle('flipped'));
speakFront.addEventListener('click', (e) => {
  e.stopPropagation();
  speakText(vocabulary[currentCard].fr);
});
updateCard(0);

// ----- QUIZ -----
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizFeedback = document.getElementById('quizFeedback');
const quizScoreSpan = document.getElementById('quizScore');
const quizTotalSpan = document.getElementById('quizTotal');
const nextQuizBtn = document.getElementById('nextQuizBtn');
quizTotalSpan.textContent = vocabulary.length;

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function buildQuiz(index) {
  const word = vocabulary[index];
  const correct = word.en;
  const allEn = vocabulary.map(w => w.en);
  let options = [correct];
  const others = allEn.filter(e => e !== correct);
  const shuffledOthers = shuffleArray([...others]);
  for (let i = 0; i < Math.min(3, shuffledOthers.length); i++) {
    options.push(shuffledOthers[i]);
  }
  options = shuffleArray(options);
  quizQuestion.innerHTML = `What is the English for <strong>${word.fr}</strong>?`;
  quizOptions.innerHTML = '';
  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleQuizAnswer(btn, opt, correct));
    quizOptions.appendChild(btn);
  });
  quizFeedback.textContent = '';
  quizFeedback.style.color = '';
  quizAnswered = false;
  nextQuizBtn.style.display = 'none';
  document.querySelectorAll('.option').forEach(b => b.classList.remove('disabled', 'correct', 'wrong'));
}
function handleQuizAnswer(btn, selected, correct) {
  if (quizAnswered) return;
  quizAnswered = true;
  const allOpts = document.querySelectorAll('.option');
  allOpts.forEach(b => b.classList.add('disabled'));
  const isCorrect = selected === correct;
  if (isCorrect) {
    btn.classList.add('correct');
    quizScore++;
    quizFeedback.textContent = '✅ Correct!';
    quizFeedback.style.color = '#2b9d5e';
  } else {
    btn.classList.add('wrong');
    allOpts.forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
    quizFeedback.textContent = `❌ Wrong. The correct answer is "${correct}".`;
    quizFeedback.style.color = '#d14b5a';
  }
  quizScoreSpan.textContent = quizScore;
  nextQuizBtn.style.display = 'inline-block';
}
function nextQuiz() {
  quizIndex++;
  if (quizIndex < vocabulary.length) {
    buildQuiz(quizIndex);
  } else {
    quizQuestion.innerHTML = '🎉 You completed the quiz!';
    quizOptions.innerHTML = '';
    quizFeedback.textContent = `Final score: ${quizScore} / ${vocabulary.length}`;
    quizFeedback.style.color = '#0b1a33';
    nextQuizBtn.style.display = 'none';
  }
}
nextQuizBtn.addEventListener('click', nextQuiz);
buildQuiz(0);

// ----- DIALOGUE -----
let dialogueIndex = 0;
let dialogueScore = 0;
const dialogueText = document.getElementById('dialogueText');
const dialogueCounter = document.getElementById('dialogueCounter');
const prevDialogueBtn = document.getElementById('prevDialogue');
const nextDialogueBtn = document.getElementById('nextDialogue');
const keywordOptions = document.getElementById('keywordOptions');
const checkKeywordsBtn = document.getElementById('checkKeywordsBtn');
const keywordFeedback = document.getElementById('keywordFeedback');
const dialogueScoreSpan = document.getElementById('dialogueScore');
const dialogueTotalSpan = document.getElementById('dialogueTotal');
dialogueTotalSpan.textContent = dialogues.length;

let currentKeywords = [];
let selectedKeywords = new Set();
let keywordChecked = false;

function renderDialogue(index) {
  const d = dialogues[index];
  dialogueCounter.textContent = `${index + 1} / ${dialogues.length}`;
  // build text with translation and speak buttons
  let html = '';
  d.lines.forEach((line, idx) => {
    html += `<div class="line">`;
    html += `<span class="fr">${line.fr} <button class="speak-line" data-text="${line.fr}">🔊</button></span>`;
    html += `<span class="en">${line.en}</span>`;
    html += `</div>`;
  });
  dialogueText.innerHTML = html;
  // attach speak events
  document.querySelectorAll('.speak-line').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const text = e.currentTarget.dataset.text;
      speakText(text);
    });
  });

  // reset keyword selection
  currentKeywords = d.keywords;
  selectedKeywords.clear();
  keywordChecked = false;
  keywordFeedback.textContent = '';
  keywordFeedback.style.color = '';
  checkKeywordsBtn.style.display = 'inline-block';
  renderKeywordOptions();
  // reset dialogue score? We'll keep cumulative score per dialogue? Actually score is per dialogue, but we can count correctly answered dialogues.
  // We'll calculate score when checking.
}

function renderKeywordOptions() {
  keywordOptions.innerHTML = '';
  // show all possible keywords as toggle buttons
  allPossibleKeywords.forEach(kw => {
    const btn = document.createElement('button');
    btn.className = 'keyword-opt';
    btn.textContent = kw;
    btn.dataset.keyword = kw;
    btn.addEventListener('click', () => {
      if (keywordChecked) return;
      if (selectedKeywords.has(kw)) {
        selectedKeywords.delete(kw);
        btn.classList.remove('selected');
      } else {
        selectedKeywords.add(kw);
        btn.classList.add('selected');
      }
    });
    keywordOptions.appendChild(btn);
  });
}

function checkKeywords() {
  if (keywordChecked) return;
  keywordChecked = true;
  const allOpts = document.querySelectorAll('.keyword-opt');
  allOpts.forEach(btn => btn.classList.add('disabled'));

  // Determine correct selections
  const correctSet = new Set(currentKeywords);
  let correctCount = 0;
  let totalCorrect = correctSet.size;
  // For each selected, check if in correctSet
  let selectedArray = Array.from(selectedKeywords);
  selectedArray.forEach(kw => {
    const btn = document.querySelector(`.keyword-opt[data-keyword="${kw}"]`);
    if (correctSet.has(kw)) {
      btn.classList.add('correct');
      correctCount++;
    } else {
      btn.classList.add('wrong');
    }
  });
  // Also mark unselected correct ones as missed? We'll just show them as correct if not selected? We'll highlight them as correct too.
  correctSet.forEach(kw => {
    const btn = document.querySelector(`.keyword-opt[data-keyword="${kw}"]`);
    if (!selectedKeywords.has(kw)) {
      btn.classList.add('correct'); // show they should have been selected
    }
  });

  // Update score: we count if all correct keywords are selected and no extra selected.
  const allCorrectSelected = correctSet.size === selectedArray.filter(kw => correctSet.has(kw)).length;
  const noExtra = selectedArray.every(kw => correctSet.has(kw));
  if (allCorrectSelected && noExtra) {
    dialogueScore++;
    keywordFeedback.textContent = '✅ Perfect! All keywords found.';
    keywordFeedback.style.color = '#2b9d5e';
  } else {
    const missing = correctSet.difference(selectedKeywords);
    const extra = selectedArray.filter(kw => !correctSet.has(kw));
    let msg = '❌ ';
    if (missing.size > 0) msg += `Missing: ${Array.from(missing).join(', ')}. `;
    if (extra.length > 0) msg += `Extra: ${extra.join(', ')}.`;
    keywordFeedback.textContent = msg;
    keywordFeedback.style.color = '#d14b5a';
  }
  dialogueScoreSpan.textContent = dialogueScore;
  checkKeywordsBtn.style.display = 'none';
}

checkKeywordsBtn.addEventListener('click', checkKeywords);

renderDialogue(0);

prevDialogueBtn.addEventListener('click', () => {
  dialogueIndex = (dialogueIndex - 1 + dialogues.length) % dialogues.length;
  renderDialogue(dialogueIndex);
  // reset score display? We keep cumulative.
});

nextDialogueBtn.addEventListener('click', () => {
  dialogueIndex = (dialogueIndex + 1) % dialogues.length;
  renderDialogue(dialogueIndex);
});

// ----- WARM-UP (Genre identification) -----
let warmupScore = 0;
const warmupScoreSpan = document.getElementById('warmupScore');
const audioPlayer = document.getElementById('audioPlayer');

function playSyntheticGenre(genre) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.value = 0.3;
  let frequency = 440;
  let type = 'sine';
  let duration = 0.8;
  switch(genre) {
    case 'rock': frequency = 300; type = 'sawtooth'; duration = 0.6; break;
    case 'jazz': frequency = 350; type = 'square'; duration = 1.0; break;
    case 'classical': frequency = 523; type = 'sine'; duration = 1.2; break;
    case 'electronic': frequency = 600; type = 'triangle'; duration = 0.5; break;
  }
  osc.type = type;
  osc.frequency.value = frequency;
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
}

function playGenre(genre) {
  const audioFile = `audio/track_${genre}.mp3`;
  audioPlayer.src = audioFile;
  audioPlayer.load();
  audioPlayer.play().catch(err => {
    console.warn('Audio file not found, using synthetic sound for', genre);
    playSyntheticGenre(genre);
  });
}

function stopAudio() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
}

// For each genre item, show play/stop and options
document.querySelectorAll('.genre-item').forEach(item => {
  const genre = item.dataset.genre;
  const playBtn = item.querySelector('.play-btn');
  const stopBtn = item.querySelector('.stop-btn');
  const optionsDiv = item.querySelector('.genre-options');
  const feedback = item.querySelector('.genre-feedback');
  let answered = false;

  playBtn.addEventListener('click', () => {
    optionsDiv.style.display = 'flex';
    feedback.textContent = '';
    optionsDiv.querySelectorAll('.genre-opt').forEach(b => b.classList.remove('disabled', 'correct', 'wrong'));
    answered = false;
    playGenre(genre);
  });

  stopBtn.addEventListener('click', stopAudio);

  optionsDiv.querySelectorAll('.genre-opt').forEach(optBtn => {
    optBtn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const selected = optBtn.dataset.genre;
      const correct = genre;
      const allOpts = optionsDiv.querySelectorAll('.genre-opt');
      allOpts.forEach(b => b.classList.add('disabled'));
      if (selected === correct) {
        optBtn.classList.add('correct');
        feedback.textContent = '✅';
        feedback.style.color = '#2b9d5e';
        warmupScore++;
        warmupScoreSpan.textContent = warmupScore;
      } else {
        optBtn.classList.add('wrong');
        allOpts.forEach(b => { if (b.dataset.genre === correct) b.classList.add('correct'); });
        feedback.textContent = '❌';
        feedback.style.color = '#d14b5a';
      }
    });
  });
});

// ----- TABS -----
const tabs = document.querySelectorAll('.tab');
const contents = {
  warmup: document.getElementById('warmup'),
  flashcards: document.getElementById('flashcards'),
  quiz: document.getElementById('quiz'),
  dialogue: document.getElementById('dialogue')
};
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    Object.values(contents).forEach(c => c.classList.remove('active'));
    contents[tab.dataset.tab].classList.add('active');
  });
});
