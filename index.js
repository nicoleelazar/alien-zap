const area = document.getElementById('area');
const player = document.getElementById('player');
const alienGrid = document.getElementById('hold-all-aliens');
const instructions = document.getElementById('start-screen');
const winScreen = document.getElementById('win-screen');
const loseScreen = document.getElementById('lose-screen');
const tally = document.getElementById('tally');
const finalMessage = document.querySelector('.final-message');

let rectArea = area.getBoundingClientRect();

// Player ---------------
let playerScore = 0;
let speed = 8;
let positionX = 340;
player.style.left = positionX + 'px';

let rectPlayer = player.getBoundingClientRect();
let playerHorizSpace = rectArea.width - (rectPlayer.width + 20);

// Aliens ---------------
let alienSpeed = 4
let alienSpeedLevelup = 0;
let alienPositionX = 0;
let alienPositionY = 0;
alienGrid.style.left = alienPositionX + 'px';
alienGrid.style.top = alienPositionY + 'px';

let rectAlienGrid = alienGrid.getBoundingClientRect();
let horizontalSpace = rectArea.width - rectAlienGrid.width;
let verticalMovement = 40;
let totalVerticalMovement = 0;
let state = 0;



// Bullets --------------
let bulletSpeed = 20;

// ----------------------

let gameRunning = false;

// ----------------------

// CLEAR MSG ON START BUTTON CLICK 
let delayStart;

function continueGame() {
    instructions.style.transform = 'scale(0)'
    winScreen.style.transform = 'scale(0)'
    loseScreen.style.transform = 'scale(0)'
    // Delay game start 
    delayStart = setTimeout(startGame, 500);
}

//START THE GAME -------------------
let runGameLoop;

function startGame() {
    if (gameRunning == false) {
        //initialize
        state = 0;
        alienPositionX = 0;
        alienPositionY = 0;
        alienGrid.style.left = alienPositionX + 'px';
        alienGrid.style.top = alienPositionY + 'px';
        totalVerticalMovement = 0;
        alienSpeed = 5 + alienSpeedLevelup;
        runGameLoop = setInterval(gameLoop, 20);
        gameRunning = true;
        tally.innerHTML = playerScore;
        createAliens();
    }
}

// END THE GAME --------------------
let win;

function endGame(hasWon) {
    if (gameRunning == true) {
        clearInterval(runGameLoop);
        gameRunning = false;
    }
    // Clear bullets from screen and array at end of a game
    for (let bullet of bullets) {
        bullet.remove();
    }
    bullets = [];

    if (hasWon) {
        //display victory text     
        winScreen.style.transform = 'scale(1)'
        updateScore();

        win = true;

    } else {
        // display defeat text
        loseScreen.style.transform = 'scale(1)'
        setLoseMessage();

        win = false;
    }

}

// Customised game continuation & messages
function restartWin() {
    alienSpeedLevelup += 1.6;
    continueGame();
}

function restartLose() {
    alienSpeedLevelup = 0;
    playerScore = 0;
    tally.innerHTML = playerScore;
    continueGame();
}

function setLoseMessage() {
    if (playerScore == 0) {
        finalMessage.innerHTML = 'The Aliens got you this time, better luck next time!'

    } else if (playerScore == 1) {
        finalMessage.innerHTML = `You made it through ${playerScore} level. A good effort!`
    } else {
        finalMessage.innerHTML = `You made it through ${playerScore} levels. Great job!`
    }

}


// Update the score board tally
function updateScore() {
    playerScore++;
    tally.innerHTML = playerScore;
}

// MOVE ALIENS
function moveAliens() {
    if (state == 0) {
        // moving to the right
        alienPositionX += alienSpeed;
        // test if we reached limit/wall
        if (alienPositionX >= horizontalSpace) {
            alienPositionX = horizontalSpace;
            state = 1;
        }
        alienGrid.style.left = alienPositionX + 'px';
    } else if (state == 1 || state == 3) {
        // moving down
        alienPositionY += alienSpeed / 2;
        totalVerticalMovement += alienSpeed / 2;
        if (totalVerticalMovement >= verticalMovement) {
            totalVerticalMovement = 0;
            if (state == 1) {
                state = 2;
            } else if (state == 3) {
                state = 0;
            }
        }
        alienGrid.style.top = alienPositionY + 'px';
    } else if (state == 2) {
        alienPositionX -= alienSpeed;
        // test if we reached limit/wall
        if (alienPositionX <= 0) {
            alienPositionX = 0;
            state = 3;
        }
        alienGrid.style.left = alienPositionX + 'px';
    }
}

// MOVE PLAYER
function movePlayer() {
    if (rightDown && positionX <= playerHorizSpace) {
        positionX += speed
        player.style.left = positionX + 'px'
    } else if (leftDown && positionX >= 20) {
        positionX -= speed
        player.style.left = positionX + 'px'
    }
}

// MAIN GAME FUNCTION
function gameLoop() {
    moveAliens();

    movePlayer();

    // COLLISION
    // Count backwards incase a div from middle of array gets removed. Now the div that shifts into its spot will not be missed by the loop since it moves in a -ve direction 
    for (let i = (bullets.length - 1); i >= 0; i--) {
        // if they exit screen OR if they collide, then remove div            
        if (bullets[i].offsetTop < 0) {
            bullets[i].remove()
            bullets.splice(i, 1);
        } else {
            let rectBullet = bullets[i].getBoundingClientRect();

            for (let j = (aliens.length - 1); j >= 0; j--) {
                // Get x, y, width, height of div holding all aliens
                let rectAlien = aliens[j].getBoundingClientRect();

                // Collision detection test
                if (rectBullet.x < rectAlien.x + rectAlien.width &&
                    rectBullet.x + rectBullet.width > rectAlien.x &&
                    rectBullet.y < rectAlien.y + rectAlien.height &&
                    rectBullet.y + rectBullet.height > rectAlien.y) {
                    // Remove divs of bullets and aliens visually and from array if there's collision
                    bullets[i].remove();
                    bullets.splice(i, 1);
                    aliens[j].remove();
                    aliens.splice(j, 1);
                    // Add animation on div removal, at position of div
                    createExplosion(rectAlien.x + rectAlien.width / 2, (rectAlien.y + window.scrollY) + rectAlien.height / 2);
                    // Aliens move faster as fewer remain during play
                    alienSpeed += 0.4;
                    // all aliens destroyed, game over
                    if (aliens.length == 0) {
                        endGame(true);
                    }
                }
            }
        }
    }
    // Aliens reach bottom, game over
    rectArea = area.getBoundingClientRect();
    for (let j = (aliens.length - 1); j >= 0; j--) {
        let rectAlien = aliens[j].getBoundingClientRect();
        if (rectArea.bottom - rectAlien.bottom < 15) {
            endGame(false);
        }
    }
}

// ALL KEY EVENTS ---------------

let rightDown = false;
let leftDown = false;
let spaceBar = false;

function keyDown(e) {
    // Arrow keys press (37 = left arrow; 39 = right arrow)
    if (e.keyCode === 39) {
        rightDown = true;
    } else if (e.keyCode === 37) {
        leftDown = true;
    }

    // Shoot bullets on space bar press (key = 32)
    if (e.keyCode === 32 && !spaceBar && gameRunning) {
        spaceBar = true;
        createBullet()
    }
}
window.addEventListener('keydown', keyDown);



function keyUp(e) {
    // Arrow keys release
    if (e.keyCode === 39) {
        rightDown = false;
    } else if (e.keyCode === 37) {
        leftDown = false;
    }

    // Start the game with Enter key (key code = 13)
    if (e.keyCode === 13 && gameRunning == false) {
        continueGame();
    }
    // Continue the game with Enter key (key code = 13)
    if (e.keyCode === 13 && gameRunning == false && win == true) {
        restartWin();
    } else if (e.keyCode === 13 && gameRunning == false && win == false) {
        restartLose();
    }

    // Stops continuous firing of bullets if space bar is held down
    if (e.keyCode === 32) {
        spaceBar = false;
    }
}
window.addEventListener('keyup', keyUp);
// -------------------------




// CREATE BULLETS (ONLY ON SPACE BAR PRESS) ----------
let bullets = [];

function createBullet() {
    if (bullets.length < 8) {
        bullet = document.createElement('div')
        bullets.push(bullet);
        area.appendChild(bullet)
        bullet.classList.add('bulletStyle')
        bullet.style.left = (positionX + 25) + 'px'
    }
}

// CREATE ALIENS -------------
let aliens = []

function createAliens() {
    //clear alien Grid and all its children at start of each game
    while (alienGrid.hasChildNodes()) {
        alienGrid.removeChild(alienGrid.firstChild);
    }
    aliens = [];
    //create all aliens and cells for them to be held in
    for (let i = 0; i < 10; i++) {
        alien = document.createElement('div')
        cell = document.createElement('div')
        aliens.push(alien);
        alienGrid.appendChild(cell)
        cell.appendChild(alien)
        alien.classList.add('alienStyle')
        cell.classList.add('cellStyle')
    }
}

// CREATE EXPLOSION ---------------
function createExplosion(posX, posY) {
    let masterContainer = document.createElement('div');
    document.body.appendChild(masterContainer);
    masterContainer.style.left = posX + 'px';
    masterContainer.style.top = posY + 'px';
    masterContainer.classList.add('masterContainer');
    // Remove empty divs after explosion to clear memory
    setTimeout(function () {
        masterContainer.remove();
    }, 2000);

    // Create particles
    for (let i = 0; i < 8; i++) {
        particleContainer = document.createElement('div');
        particles = document.createElement('div');

        masterContainer.appendChild(particleContainer);
        particleContainer.appendChild(particles);

        particleContainer.classList.add('particleContainerStyle');
        particles.classList.add('particleStyle');
        particleContainer.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
    }
}


//-------------------------------------------