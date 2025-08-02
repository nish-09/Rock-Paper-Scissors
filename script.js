window.onload = function() {
    // Get references to all necessary DOM elements
    const userScoreSpan = document.getElementById('user-score');
    const computerScoreSpan = document.getElementById('computer-score');
    const resultText = document.getElementById('result-text');
    const userChoiceDisplay = document.getElementById('user-choice-display');
    const computerChoiceDisplay = document.getElementById('computer-choice-display');
    const choiceButtons = document.querySelectorAll('.choice-button');
    const actionButtonsContainer = document.getElementById('action-buttons');
    const resetButton = document.getElementById('reset-button');
    const playAgainButton = document.getElementById('play-again-button');

    // Initialize scores and game state
    let userScore = 0;
    let computerScore = 0;
    const WINNING_SCORE = 3; // The score needed to win the series

    // Mapping for choices to emojis
    const choicesMap = {
        'rock': '✊',
        'paper': '✋',
        'scissors': '✌️'
    };

    // --- Sound Effects Setup (using Tone.js) ---
    const synthWin = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.2 },
    }).toDestination();
    
    const synthLose = new Tone.MembraneSynth().toDestination();
    
    const synthTie = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.1, release: 0.1 },
    }).toDestination();

    function playWinSound() {
        synthWin.triggerAttackRelease("C5", "8n");
        synthWin.triggerAttackRelease("E5", "8n", "+0.1");
        synthWin.triggerAttackRelease("G5", "8n", "+0.2");
    }

    function playLoseSound() {
        synthLose.triggerAttackRelease("C2", "8n");
    }
    
    function playTieSound() {
        synthTie.triggerAttackRelease(["C4", "E4", "G4"], "4n");
    }
    // --- End Sound Effects Setup ---

    // Main game logic function
    function playGame(userChoice) {
        // Check for a win *before* playing the round
        // This ensures the game stops if a win condition was met in the last round
        if (isGameOver()) {
            return;
        }
        
        // Disable buttons and show the initial '?' choices
        actionButtonsContainer.classList.add('disabled');
        userChoiceDisplay.textContent = '?';
        computerChoiceDisplay.textContent = '?';

        // Add the shaking animation class
        userChoiceDisplay.classList.add('shaking');
        computerChoiceDisplay.classList.add('shaking');
        
        resultText.textContent = "Rock... Paper... Scissors...";

        // Delay the outcome to show the shaking animation
        setTimeout(() => {
            // Remove shaking animation class
            userChoiceDisplay.classList.remove('shaking');
            computerChoiceDisplay.classList.remove('shaking');
            
            // Get computer's random choice
            const choices = ['rock', 'paper', 'scissors'];
            const computerChoice = choices[Math.floor(Math.random() * choices.length)];

            // Display the choices with animation
            userChoiceDisplay.textContent = choicesMap[userChoice];
            userChoiceDisplay.style.animation = 'none'; // Reset animation
            userChoiceDisplay.offsetHeight; // Trigger reflow
            userChoiceDisplay.style.animation = ''; // Restart animation

            computerChoiceDisplay.textContent = choicesMap[computerChoice];
            computerChoiceDisplay.style.animation = 'none'; // Reset animation
            computerChoiceDisplay.offsetHeight; // Trigger reflow
            computerChoiceDisplay.style.animation = ''; // Restart animation

            // Remove previous result class
            resultText.classList.remove('win', 'lose', 'tie');

            // Determine the winner and update scores/display
            if (userChoice === computerChoice) {
                // Tie: award one point to both players
                userScore++;
                computerScore++;
                userScoreSpan.textContent = userScore;
                computerScoreSpan.textContent = computerScore;
                resultText.textContent = "It's a tie!";
                resultText.classList.add('tie');
                playTieSound();
            } else if (
                (userChoice === 'rock' && computerChoice === 'scissors') ||
                (userChoice === 'paper' && computerChoice === 'rock') ||
                (userChoice === 'scissors' && computerChoice === 'paper')
            ) {
                // User wins: User gets a point
                userScore++;
                userScoreSpan.textContent = userScore;
                computerScoreSpan.textContent = computerScore; // Keep computer score the same
                resultText.textContent = "You win!";
                resultText.classList.add('win');
                playWinSound();
            } else {
                // User loses: Computer gets a point
                computerScore++;
                userScoreSpan.textContent = userScore; // Keep user score the same
                computerScoreSpan.textContent = computerScore;
                resultText.textContent = "You lose!";
                resultText.classList.add('lose');
                playLoseSound();
            }

            // Check if the game is over and act accordingly
            if (isGameOver()) {
                endGame(userScore > computerScore ? "You are the final winner!" : "The Computer is the final winner!");
            } else {
                // Re-enable buttons if game is not over
                actionButtonsContainer.classList.remove('disabled');
            }
        }, 1000); // Wait 1 second before revealing the result
    }

    // Function to check if the game is over based on the new rules
    function isGameOver() {
        // If the score is tied at 2-2, the game is not over.
        if (userScore === 2 && computerScore === 2) {
            return false;
        }
        
        // Normal win condition: one player reaches 3 points.
        // Or, if it's past 2-2, a player wins by a lead of 2.
        return (userScore >= WINNING_SCORE && userScore - computerScore >= 2) || 
               (computerScore >= WINNING_SCORE && computerScore - userScore >= 2);
    }
    
    // Function to handle the end of the game series
    function endGame(message) {
        resultText.textContent = message;
        actionButtonsContainer.classList.add('disabled'); // Disable the choice buttons
        playAgainButton.classList.remove('hidden'); // Show the "Play Again" button
    }

    // Add event listeners to the choice buttons
    choiceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Start Tone.js if it's not already running
            if (Tone.Transport.state !== 'started') {
                Tone.start();
            }
            const userChoice = e.currentTarget.id;
            playGame(userChoice);
        });
    });
    
    // Function to reset the game
    function resetGame() {
        userScore = 0;
        computerScore = 0;
        userScoreSpan.textContent = userScore;
        computerScoreSpan.textContent = computerScore;
        resultText.textContent = "Make your move!";
        resultText.classList.remove('win', 'lose', 'tie');
        userChoiceDisplay.textContent = "?";
        computerChoiceDisplay.textContent = "?";
        
        // Re-enable buttons and hide "Play Again" button
        actionButtonsContainer.classList.remove('disabled');
        playAgainButton.classList.add('hidden');
    }

    // Add event listeners for the reset and play again buttons
    resetButton.addEventListener('click', resetGame);
    playAgainButton.addEventListener('click', resetGame);
};

// Cursor ring functionality
document.addEventListener('DOMContentLoaded', function() {
    const cursorRing = document.createElement('div');
    cursorRing.className = 'cursor-ring';
    document.body.appendChild(cursorRing);

    // Update cursor ring position with requestAnimationFrame for smoother tracking
    let ticking = false;
    
    function updateCursorRing(e) {
        if (!ticking) {
            requestAnimationFrame(() => {
                cursorRing.style.left = e.clientX + 'px';
                cursorRing.style.top = e.clientY + 'px';
                ticking = false;
            });
            ticking = true;
        }
    }

    document.addEventListener('mousemove', updateCursorRing, { passive: true });

    // Add hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('.choice-button, .reset-button, .play-again-button');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            cursorRing.classList.add('cursor-ring-hover');
        });
        
        element.addEventListener('mouseleave', function() {
            cursorRing.classList.remove('cursor-ring-hover');
        });
    });

    // Hide cursor ring on touch devices
    if ('ontouchstart' in window) {
        cursorRing.style.display = 'none';
    }
});
