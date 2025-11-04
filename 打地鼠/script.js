class WhackAMoleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.highScore = parseInt(localStorage.getItem('whackAMoleHighScore')) || 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentMole = null;
        this.gameTimer = null;
        this.moleTimer = null;
        this.difficulty = 'medium';
        
        this.difficultySettings = {
            easy: { minTime: 1000, maxTime: 2000, moleUpTime: 1500 },
            medium: { minTime: 600, maxTime: 1200, moleUpTime: 1000 },
            hard: { minTime: 400, maxTime: 800, moleUpTime: 700 }
        };
        
        this.initElements();
        this.initEventListeners();
        this.updateDisplay();
    }
    
    initElements() {
        this.scoreElement = document.getElementById('score');
        this.timeElement = document.getElementById('time');
        this.highScoreElement = document.getElementById('high-score');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.difficultySelect = document.getElementById('difficulty');
        this.holes = document.querySelectorAll('.hole');
        this.moles = document.querySelectorAll('.mole');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.finalScoreElement = document.getElementById('final-score');
        this.newRecordElement = document.getElementById('new-record');
        this.playAgainBtn = document.getElementById('play-again-btn');
    }
    
    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            if (!this.isPlaying) {
                this.resetGame();
            }
        });
        this.playAgainBtn.addEventListener('click', () => {
            this.gameOverModal.style.display = 'none';
            this.resetGame();
            this.startGame();
        });
        
        this.moles.forEach((mole, index) => {
            mole.addEventListener('click', () => this.whackMole(index));
        });
    }
    
    startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.isPaused = false;
        this.score = 0;
        this.timeLeft = 30;
        this.updateDisplay();
        
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.difficultySelect.disabled = true;
        
        this.startGameTimer();
        this.popUpMole();
    }
    
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }
    
    popUpMole() {
        if (!this.isPlaying || this.isPaused) return;
        
        const settings = this.difficultySettings[this.difficulty];
        const randomHole = Math.floor(Math.random() * this.holes.length);
        const mole = this.moles[randomHole];
        
        if (this.currentMole === mole) {
            this.popUpMole();
            return;
        }
        
        this.currentMole = mole;
        mole.classList.add('up');
        
        setTimeout(() => {
            if (mole.classList.contains('up')) {
                mole.classList.remove('up');
                this.currentMole = null;
            }
        }, settings.moleUpTime);
        
        const nextTime = Math.random() * (settings.maxTime - settings.minTime) + settings.minTime;
        this.moleTimer = setTimeout(() => this.popUpMole(), nextTime);
    }
    
    whackMole(index) {
        if (!this.isPlaying || this.isPaused) return;
        
        const mole = this.moles[index];
        if (!mole.classList.contains('up') || mole.classList.contains('whacked')) return;
        
        mole.classList.add('whacked');
        mole.classList.remove('up');
        
        this.score += 10;
        this.updateDisplay();
        
        this.playHitSound();
        this.createHitEffect(mole);
        this.createScorePopup(mole);
        this.addScreenShake();
        
        setTimeout(() => {
            mole.classList.remove('whacked');
        }, 500);
        
        this.currentMole = null;
    }
    
    togglePause() {
        if (!this.isPlaying) return;
        
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        
        if (this.isPaused) {
            clearTimeout(this.moleTimer);
            this.moles.forEach(mole => {
                if (mole.classList.contains('up')) {
                    mole.classList.remove('up');
                }
            });
        } else {
            this.popUpMole();
        }
    }
    
    endGame() {
        this.isPlaying = false;
        this.isPaused = false;
        
        clearInterval(this.gameTimer);
        clearTimeout(this.moleTimer);
        
        this.moles.forEach(mole => {
            mole.classList.remove('up', 'whacked');
        });
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        this.difficultySelect.disabled = false;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('whackAMoleHighScore', this.highScore);
            this.newRecordElement.style.display = 'block';
        } else {
            this.newRecordElement.style.display = 'none';
        }
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverModal.style.display = 'flex';
        
        this.updateDisplay();
        this.playGameOverSound();
    }
    
    resetGame() {
        this.isPlaying = false;
        this.isPaused = false;
        this.score = 0;
        this.timeLeft = 30;
        
        clearInterval(this.gameTimer);
        clearTimeout(this.moleTimer);
        
        this.moles.forEach(mole => {
            mole.classList.remove('up', 'whacked');
        });
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        this.difficultySelect.disabled = false;
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.timeElement.textContent = this.timeLeft;
        this.highScoreElement.textContent = this.highScore;
        
        if (this.timeLeft <= 10) {
            this.timeElement.style.color = '#ff6b6b';
        } else {
            this.timeElement.style.color = 'white';
        }
    }
    
    playHitSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建主击打音
        const osc1 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();
        osc1.connect(gainNode1);
        gainNode1.connect(audioContext.destination);
        
        osc1.frequency.value = 600;
        osc1.type = 'square';
        gainNode1.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        // 创建高音和声
        const osc2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        osc2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        osc2.frequency.value = 1200;
        osc2.type = 'sine';
        gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        // 创建低音冲击
        const osc3 = audioContext.createOscillator();
        const gainNode3 = audioContext.createGain();
        osc3.connect(gainNode3);
        gainNode3.connect(audioContext.destination);
        
        osc3.frequency.value = 150;
        osc3.type = 'sawtooth';
        gainNode3.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        // 添加噪音效果
        const bufferSize = audioContext.sampleRate * 0.05;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = audioContext.createBufferSource();
        const noiseGain = audioContext.createGain();
        noise.buffer = buffer;
        noise.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        
        noiseGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        // 启动所有声音
        osc1.start(audioContext.currentTime);
        osc1.stop(audioContext.currentTime + 0.15);
        
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.1);
        
        osc3.start(audioContext.currentTime);
        osc3.stop(audioContext.currentTime + 0.2);
        
        noise.start(audioContext.currentTime);
    }
    
    playGameOverSound() {
        const oscillator = new (window.AudioContext || window.webkitAudioContext)();
        const gainNode = oscillator.createGain();
        
        const osc = oscillator.createOscillator();
        osc.connect(gainNode);
        gainNode.connect(oscillator.destination);
        
        osc.frequency.value = 400;
        osc.type = 'square';
        
        gainNode.gain.setValueAtTime(0.2, oscillator.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, oscillator.currentTime + 0.5);
        
        osc.start(oscillator.currentTime);
        osc.stop(oscillator.currentTime + 0.5);
    }
    
    createHitEffect(mole) {
        const hole = mole.parentElement;
        hole.classList.add('hit-effect');
        
        // 创建粒子爆炸效果
        this.createParticles(mole);
        
        setTimeout(() => {
            hole.classList.remove('hit-effect');
        }, 400);
    }
    
    createParticles(mole) {
        const hole = mole.parentElement;
        const rect = hole.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            
            const angle = (Math.PI * 2 * i) / 12;
            const velocity = 100 + Math.random() * 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--vx', vx + 'px');
            particle.style.setProperty('--vy', vy + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }
    
    createScorePopup(mole) {
        const hole = mole.parentElement;
        const rect = hole.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = '+10';
        popup.style.left = (rect.left + rect.width / 2) + 'px';
        popup.style.top = rect.top + 'px';
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }
    
    addScreenShake() {
        const gameContainer = document.querySelector('.game-container');
        gameContainer.classList.add('screen-shake');
        
        setTimeout(() => {
            gameContainer.classList.remove('screen-shake');
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new WhackAMoleGame();
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!game.isPlaying) {
                game.startGame();
            } else {
                game.togglePause();
            }
        } else if (e.code === 'KeyR') {
            game.resetGame();
        }
    });
    
    const holes = document.querySelectorAll('.hole');
    holes.forEach((hole, index) => {
        hole.addEventListener('mouseenter', () => {
            hole.style.transform = 'scale(1.05)';
        });
        
        hole.addEventListener('mouseleave', () => {
            hole.style.transform = 'scale(1)';
        });
    });
});
