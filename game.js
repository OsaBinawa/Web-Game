const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const laneWidth = canvas.width / 3;
const carWidth = 40;
const carHeight = 80;
const lanes = [laneWidth * 0.5 - carWidth / 2, laneWidth * 1.5 - carWidth / 2, laneWidth * 2.5 - carWidth / 2];
let playerLane = 1;  
let carY = canvas.height - carHeight - 20; 
let isGameOver = false;
let obstacles = [];
let obstacleWidth = 40;
let obstacleHeight = 80;
let obstacleSpeed = 5;
let obstacleTimer = 0;
let obstacleInterval = 1500; 


function drawCar(x, y) {
    ctx.fillStyle = "blue";
    ctx.fillRect(x, y, carWidth, carHeight);
}


function drawLanes() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) {
        let x = laneWidth * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}


function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function createObstacle() {
    let lane = Math.floor(Math.random() * 3);  
    let obstacleX = lanes[lane];
    obstacles.push({ x: obstacleX, y: -obstacleHeight });
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
    ctx.fillStyle = "red";
    for (let i = 0; i < obstacles.length; i++) {
        ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacleWidth, obstacleHeight);
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

    
    obstacleTimer += deltaTime;
    if (obstacleTimer > obstacleInterval) {
        createObstacle();
        obstacleTimer = 0;  
    }
}


let lastTime = 0;
function draw(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    clearCanvas();
    drawLanes();
    drawCar(lanes[playerLane], carY);
    drawObstacles();
    
    if (!isGameOver) {
        update(deltaTime);  
        requestAnimationFrame(draw); 
    } else {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over!", canvas.width / 3, canvas.height / 2);
    }
}


requestAnimationFrame(draw);


document.addEventListener("keydown", (event) => {
    if (event.code === "KeyA" && playerLane > 0) {
        playerLane--;
    } else if (event.code === "KeyD" && playerLane < 2) {
        playerLane++;
    }
});
