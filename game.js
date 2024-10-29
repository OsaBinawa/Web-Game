const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const carImage = new Image();
carImage.src = 'images/car.png';

const laneWidth = canvas.width / 3;


canvas.height = window.innerHeight;
const carWidth = 40;
const carHeight = 80;
const lanes = [
    laneWidth * 0.5 - carWidth / 2,
    laneWidth * 1.5 - carWidth / 2,
    laneWidth * 2.5 - carWidth / 2,
];
let playerLane = 1;  
let carY = canvas.height - carHeight - 20; 
let isGameOver = false;
let obstacles = [];
let obstacleWidth = 40;
let obstacleHeight = 80;
let obstacleSpeed = 5;
let obstacleTimer = 0;
let obstacleInterval = 1500; 
let score = 0;  
let scoreTimer = 0;  

// Leaderboard
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

const obstacleImages = [
    new Image(),
    new Image()
];

obstacleImages[0].src = 'images/obstacle1.png'; // Path to first obstacle image
obstacleImages[1].src = 'images/obstacle2.png'; 

// Function to update leaderboard
function updateLeaderboard(playerName, score) {
    leaderboard.push({ name: playerName, score });
    leaderboard.sort((a, b) => b.score - a.score); // Sort by score descending
    leaderboard = leaderboard.slice(0, 5); // Keep only top 5 scores
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard)); // Save to localStorage
}

// Function to display leaderboard
function displayLeaderboard() {
    const leaderboardList = document.getElementById("leaderboardList");
    leaderboardList.innerHTML = ""; 
    leaderboard.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}

function drawCar(x, y) {
    ctx.drawImage(carImage, x, y, carWidth, carHeight);
}

let dashOffset = 0; // Add this variable at the top of your script
const laneDashCount = 20; // Number of dashed lines to draw
const laneDashHeight = 50; // Spacing between each dashed line

function drawLanes() {
    ctx.strokeStyle = "white"; // Set the color for the lane markings
    ctx.lineWidth = 4; // Set the line width for the markings

    // Define a dashed line pattern
    ctx.setLineDash([10, 40]); // 15 pixels dash, 10 pixels gap

    // Loop to draw multiple dashed lines
    for (let i = 0; i < laneDashCount; i++) {
        let y = (dashOffset + i * laneDashHeight) % canvas.height; // Calculate the Y position with offset
        for (let j = 1; j < 3; j++) { // Draw for the two lanes
            let x = laneWidth * j; // Calculate the x position for the lane lines
            ctx.beginPath();
            ctx.moveTo(x, y); // Start from the calculated Y position
            ctx.lineTo(x, y + canvas.height); // Draw down the canvas height
            ctx.stroke(); // Draw the dashed line
        }
    }

    // Reset the line dash to solid line (optional)
    ctx.setLineDash([]); // Resets to solid line
}



function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function createObstacle() {
    let lane = Math.floor(Math.random() * 3);  
    let obstacleX = lanes[lane];

    // Choose a random image for the obstacle
    const randomImageIndex = Math.floor(Math.random() * obstacleImages.length);
    const selectedImage = obstacleImages[randomImageIndex];

    // Add obstacle with its chosen image and position
    obstacles.push({ 
        x: obstacleX,
        y: -obstacleHeight,
        image: selectedImage
    });
}

function moveObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += obstacleSpeed;

        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            i--; 
        }
    }
}

function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        ctx.drawImage(obstacles[i].image, obstacles[i].x, obstacles[i].y, obstacleWidth, obstacleHeight);
    }
}

function isColliding(car, obstacle) {
    return car.x < obstacle.x + obstacleWidth &&
           car.x + carWidth > obstacle.x &&
           car.y < obstacle.y + obstacleHeight &&
           car.y + carHeight > obstacle.y;
}

function checkCollisions() {
    for (let i = 0; i < obstacles.length; i++) {
        if (isColliding({ x: lanes[playerLane], y: carY }, obstacles[i])) {
            isGameOver = true;
            break;
        }
    }
}

function update(deltaTime) {
    moveObstacles();
    checkCollisions();

    // Update the dashOffset to create the scrolling effect
    dashOffset += obstacleSpeed; // Move the dashes down at the speed of obstacles

    // Reset dashOffset to create a loop effect
    if (dashOffset >= laneDashHeight) {
        dashOffset = 0; // Reset to top once it goes off the defined dash height
    }

    scoreTimer += deltaTime;
    if (scoreTimer >= 1000) { 
        score += 10;  // Increment the score every second
        console.log("Current Score:", score); // Log the current score
        scoreTimer = 0;
    }

    obstacleTimer += deltaTime;
    if (obstacleTimer > obstacleInterval) {
        createObstacle();
        obstacleTimer = 0;  
    }
}


function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(`Score: ${score}`, 20, 40);
}

let lastTime = 0;
function draw(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    clearCanvas();
    drawLanes();
    drawCar(lanes[playerLane], carY);
    drawObstacles();
    drawScore();

    if (!isGameOver) {
        update(deltaTime);  
        requestAnimationFrame(draw); 
    } else {
        endGame();  // Trigger game over
    }
}

function endGame() {
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over!", canvas.width / 3, canvas.height / 2);
    ctx.fillText(`Final Score: ${score}`, canvas.width / 3, canvas.height / 2 + 40);

    // Save the score to sessionStorage for the leaderboard page
    sessionStorage.setItem("currentScore", score); // Store the score in sessionStorage
    console.log("Score stored in sessionStorage:", score); // Log the score being stored

    // Redirect to the leaderboard page after a short delay
    setTimeout(() => {
        window.location.href = "leaderboard.html";
    }, 2000);  // 2-second delay to display "Game Over" message
}

requestAnimationFrame(draw);

document.addEventListener("keydown", (event) => {
    if (event.code === "KeyA" && playerLane > 0) {
        playerLane--;
    } else if (event.code === "KeyD" && playerLane < 2) {
        playerLane++;
    }
});
