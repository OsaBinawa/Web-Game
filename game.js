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


let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

const obstacleImages = [
    new Image(),
    new Image()
];

obstacleImages[0].src = 'images/obstacle1.png'; 
obstacleImages[1].src = 'images/obstacle2.png'; 


function updateLeaderboard(playerName, score) {
    leaderboard.push({ name: playerName, score });
    leaderboard.sort((a, b) => b.score - a.score); 
    leaderboard = leaderboard.slice(0, 5); 
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard)); 
}


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

let dashOffset = 0; 
const laneDashCount = 20; 
const laneDashHeight = 50; 

function drawLanes() {
    ctx.strokeStyle = "white"; 
    ctx.lineWidth = 4; 

    
    ctx.setLineDash([10, 40]); 

    
    for (let i = 0; i < laneDashCount; i++) {
        let y = (dashOffset + i * laneDashHeight) % canvas.height; 
        for (let j = 1; j < 3; j++) { 
            let x = laneWidth * j; 
            ctx.beginPath();
            ctx.moveTo(x, y); 
            ctx.lineTo(x, y + canvas.height); 
            ctx.stroke(); 
        }
    }

    
    ctx.setLineDash([]); 
}



function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function createObstacle() {
    let lane = Math.floor(Math.random() * 3);  
    let obstacleX = lanes[lane];

    
    const randomImageIndex = Math.floor(Math.random() * obstacleImages.length);
    const selectedImage = obstacleImages[randomImageIndex];

    
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

    
    dashOffset += obstacleSpeed; 

    
    if (dashOffset >= laneDashHeight) {
        dashOffset = 0; 
    }

    scoreTimer += deltaTime;
    if (scoreTimer >= 1000) { 
        score += 10;  
        console.log("Current Score:", score); 
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
        endGame();  
    }
}

function endGame() {
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over!", canvas.width / 3, canvas.height / 2);
    ctx.fillText(`Final Score: ${score}`, canvas.width / 3, canvas.height / 2 + 40);

    
    sessionStorage.setItem("currentScore", score); 
    console.log("Score stored in sessionStorage:", score); 

    
    setTimeout(() => {
        window.location.href = "leaderboard.html";
    }, 2000);  
}

requestAnimationFrame(draw);

document.addEventListener("keydown", (event) => {
    if (event.code === "KeyA" && playerLane > 0) {
        playerLane--;
    } else if (event.code === "KeyD" && playerLane < 2) {
        playerLane++;
    }
});
