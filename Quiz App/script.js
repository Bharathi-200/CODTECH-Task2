const landingPage = document.querySelector(".landing-page");
const gameCategory = document.querySelector(".game-category");
const quizSection = document.querySelector(".quiz");
const scoreboardSection = document.querySelector(".scoreboard");
const questionElement = document.getElementById("question");
const optionsContainer = document.getElementById("options-container");
const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");

let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let timerInterval;
let difficultyLevel;

function showLandingPage() {
    stopTimer();
    resetQuiz();
    landingPage.style.display = "";
    gameCategory.style.display = "none";
    quizSection.style.display = "none";
    scoreboardSection.style.display = "none";
}

function showGameCategory() {
    stopTimer();
    resetQuiz();
    landingPage.style.display = "none";
    gameCategory.style.display = "";
    quizSection.style.display = "none";
    scoreboardSection.style.display = "none";
}

function showQuiz(category, level) {
    stopTimer();
    resetQuiz();
    landingPage.style.display = "none";
    gameCategory.style.display = "none";
    quizSection.style.display = "";
    scoreboardSection.style.display = "none";
    difficultyLevel = level;
    getQuestions(category, level);
    startTimer(10);
}

async function getQuestions(category, level) {
    const difficulty = level === 'easy' ? 'easy' : level === 'medium' ? 'medium' : 'hard';
    const API_URL = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`;
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.results && data.results.length > 0 && data.results[0].question) {
            questions = data.results.map(q => ({ ...q, question: decodeHTMLEntities(q.question), correct_answer: decodeHTMLEntities(q.correct_answer), incorrect_answers: q.incorrect_answers.map(decodeHTMLEntities) }));
            displayQuestion();
        } else {
            console.error("Invalid data format:", data);
        }
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
}

function decodeHTMLEntities(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}

function displayQuestion() {
    optionsContainer.style.display = '';
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && currentQuestion.question) {
        questionElement.textContent = currentQuestion.question;
        optionsContainer.innerHTML = "";
        const allOptions = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
        shuffleArray(allOptions).forEach(option => {
            addOption(option, option === currentQuestion.correct_answer);
        });
    } else {
        console.error("Invalid question format:", currentQuestion);
    }
}

function addOption(text, isCorrect) {
    const optionElement = document.createElement("button");
    optionElement.textContent = text;
    optionElement.classList.add("option");
    optionElement.dataset.correct = isCorrect;
    optionElement.addEventListener("click", selectOption);
    optionsContainer.appendChild(optionElement);
}

async function selectOption(event) {
    const selectedOption = event.target;
    const isCorrect = selectedOption.dataset.correct === "true";
    if (isCorrect) {
        selectedOption.classList.add("correct");
        score++;
        playCorrectSound();
    } else {
        selectedOption.classList.add("incorrect");
        const correctOption = optionsContainer.querySelector(`button[data-correct="true"]`);
        if (correctOption) {
            correctOption.classList.add("correct");
        }
        playIncorrectSound();
    }
    stopTimer();
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
        displayQuestion();
        startTimer(10);
    } else {
        showScoreboard();
    }
}

function startTimer(duration) {
    let time = duration;
    timerElement.textContent = time;
    timerInterval = setInterval(() => {
        time--;
        timerElement.textContent = time;
        if (time <= 5) {
            timerElement.style.color = '#f44336';
        }
        if (time <= 0) {
            clearInterval(timerInterval);
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                displayQuestion();
                startTimer(10);
            } else {
                showScoreboard();
            }
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerElement.style.color = '#000';
}

function showScoreboard() {
    quizSection.style.display = "none";
    scoreboardSection.style.display = "";
    scoreElement.textContent = `Your Score: ${score} / ${questions.length}`;
    const highScore = localStorage.getItem('quizHighScore');
    if (!highScore || score > parseInt(highScore)) {
        localStorage.setItem('quizHighScore', score);
        alert(`Congratulations! You've set a new high score: ${score}`);
    }
}

function playCorrectSound() {
    const audio = document.getElementById('correctSound');
    audio.play();
}

function playIncorrectSound() {
    const audio = document.getElementById('incorrectSound');
    audio.play();
}

function resetQuiz() {
    currentQuestionIndex = 0;
    questions = [];
    score = 0;
    timerElement.style.color = '#000';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

showLandingPage();

