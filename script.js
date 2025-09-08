const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Game constants
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;

const PLAYER_X = 10;
const AI_X = canvas.width - PADDLE_WIDTH - 10;

// Paddle object
function Paddle(x, y) {
    this.x = x;
    this.y = y;
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.score = 0;
}

Paddle.prototype.draw = function() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x, this.y, this.width, this.height);
};

// Ball object
function Ball() {
    this.reset();
}

Ball.prototype.reset = function() {
    this.x = canvas.width/2;
    this.y = canvas.height/2;
    this.radius = BALL_RADIUS;
    this.speed = 5;
    this.dx = (Math.random() > 0.5 ? 1 : -1) * this.speed;
    this.dy = (Math.random() * 2 - 1) * this.speed;
};

Ball.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
};

Ball.prototype.move = function() {
    this.x += this.dx;
    this.y += this.dy;
};

function drawNet() {
    ctx.beginPath();
    ctx.setLineDash([10, 15]);
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
}

// Game objects
const player = new Paddle(PLAYER_X, canvas.height/2 - PADDLE_HEIGHT/2);
const ai = new Paddle(AI_X, canvas.height/2 - PADDLE_HEIGHT/2);
const ball = new Ball();

// Mouse movement to control left paddle
canvas.addEventListener("mousemove", function(evt) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height/2;
    // Clamp within canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

// Basic AI for right paddle
function moveAI() {
    let center = ai.y + ai.height/2;
    if (ball.y < center - 20) {
        ai.y -= 5;
    } else if (ball.y > center + 20) {
        ai.y += 5;
    }
    // Clamp within canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

// Collision detection
function collision(paddle, ball) {
    return (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y
    );
}

// Main draw function
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw net
    drawNet();

    // Draw paddles and ball
    player.draw();
    ai.draw();
    ball.draw();

    // Draw scores (optional, for fun)
    ctx.font = "32px Arial";
    ctx.fillText(player.score, canvas.width / 4, 50);
    ctx.fillText(ai.score, 3 * canvas.width / 4, 50);
}

function update() {
    ball.move();
    moveAI();

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.dy *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.dy *= -1;
    }

    // Paddle collision
    if (collision(player, ball)) {
        ball.x = player.x + player.width + ball.radius;
        ball.dx *= -1;
        // Add some "spin"
        let collidePoint = (ball.y - (player.y + player.height/2)) / (player.height/2);
        ball.dy = collidePoint * ball.speed;
    }
    if (collision(ai, ball)) {
        ball.x = ai.x - ball.radius;
        ball.dx *= -1;
        let collidePoint = (ball.y - (ai.y + ai.height/2)) / (ai.height/2);
        ball.dy = collidePoint * ball.speed;
    }

    // Left or right wall (score)
    if (ball.x - ball.radius < 0) {
        ai.score++;
        ball.reset();
    }
    if (ball.x + ball.radius > canvas.width) {
        player.score++;
        ball.reset();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();