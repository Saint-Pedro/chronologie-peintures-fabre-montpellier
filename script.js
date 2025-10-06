let draggedCard = null;
let startTime = null;
let timerInterval = null;
let attempts = 0;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const dropZones = document.querySelectorAll('.drop-zone');

    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragleave', handleDragLeave);
    });

    shuffleCards();
    startTimer();
});

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('timer').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function stopTimer() {
    clearInterval(timerInterval);
}

function handleDragStart(e) {
    draggedCard = this;
    this.style.opacity = '0.5';
}

function handleDragEnd(e) {
    this.style.opacity = '1';
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (this.children.length === 0) {
        this.appendChild(draggedCard);
    }
}

function shuffleCards() {
    const pool = document.getElementById('monuments-pool');
    const cards = Array.from(pool.children);
    
    cards.sort(() => Math.random() - 0.5);
    cards.forEach(card => pool.appendChild(card));
}

function verifyOrder() {
    const timeline = document.getElementById('timeline');
    const dropZones = timeline.querySelectorAll('.drop-zone');
    const result = document.getElementById('result');
    
    attempts++;
    document.getElementById('attempts').textContent = attempts;
    
    let years = [];
    let allFilled = true;
    let correctPositions = [];

    dropZones.forEach((zone, index) => {
        const card = zone.querySelector('.card');
        if (card) {
            const year = parseInt(card.dataset.year);
            years.push({year: year, index: index, card: card});
            const yearSpan = card.querySelector('.hidden-year');
            yearSpan.classList.add('revealed-year');
        } else {
            allFilled = false;
        }
    });

    if (!allFilled) {
        result.textContent = "Veuillez placer tous les monuments dans la timeline !";
        result.className = "error";
        return;
    }

    // Vérifier quelles cartes sont à la bonne position
    let sortedYears = [...years].sort((a, b) => a.year - b.year);
    
    years.forEach((item, index) => {
        if (item.year === sortedYears[index].year) {
            correctPositions.push(index);
            dropZones[index].querySelector('.card').classList.add('correct');
        } else {
            dropZones[index].querySelector('.card').classList.add('incorrect');
        }
    });

    // Vérifier si tout est correct
    let isCorrect = correctPositions.length === years.length;

    if (isCorrect) {
        stopTimer();
        const finalTime = document.getElementById('timer').textContent;
        result.textContent = `Bravo ! Résolu en ${finalTime} avec ${attempts} tentative(s) !`;
        result.className = "success";
    } else {
        result.textContent = `${correctPositions.length} bonne(s) réponse(s). Réessayez !`;
        result.className = "error";
        
        setTimeout(() => {
            const pool = document.getElementById('monuments-pool');
            
            dropZones.forEach((zone, index) => {
                const card = zone.querySelector('.card');
                if (card && !correctPositions.includes(index)) {
                    // Retourner seulement les cartes incorrectes
                    card.classList.remove('incorrect');
                    const yearSpan = card.querySelector('.hidden-year');
                    yearSpan.classList.remove('revealed-year');
                    pool.appendChild(card);
                }
            });
            
            result.textContent = '';
        }, 1500);
    }
}