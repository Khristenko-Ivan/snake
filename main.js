//Налаштовуємо полотно
var canvas = document.getElementById("canvas");
var ctx =canvas.getContext("2d");

//Отримуємо ширину та висоту з елемента canvas
var width = canvas.width;
var height = canvas.height;

//Опрацьвуємо блоки width та height
var blockSize = 10;
var widthInBlocks = width / blockSize;
var heightInBlocks = height / blockSize;

//Задаємо рахунок на 0
var score = 0;

//Малюємо межі
var drawBorder = function () {
    ctx.fillStyle = "Gray";
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, height - blockSize, width, blockSize);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
};

//Малюємо рахунок у верхньому лівому куті
var drawScore = function () {
    ctx.font = "20px Courier";
    ctx.fillStyle = "Black";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, blockSize, blockSize);
};

//Очищуємо інтервал та висвітлюємо текст "Game Over"
var gameOver = function () {
    playing = false;
    ctx.font = "60px Courier";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game Over", width / 2, height / 2);
};

//Малюємо коло
var circle = function (x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
};

//Конструктор Block
var Block = function (col, row) {
    this.col = col;
    this.row = row;
};

//малюємо квадрат в локації блока
Block.prototype.drawSquare = function (color) {
    var x = this.col * blockSize;
    var y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
};

//Малюємо коло на локації блока
Block.prototype.drawCircle = function (color) {
    var centerX = this.col * blockSize + blockSize / 2;
    var centerY = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true);
};

//Перевіряємо, чи цей блок не знаходиться в одній локації з іншим блоком
Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
};

//Конструктор Snake
var Snake = function () {
    this.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(5, 5)
    ];

    this.direction = "right";
    this.nextDirection = "right";
};

//Малюємо квадрат для кожного сегмента тіла змійки
Snake.prototype.draw = function () {
    this.segments[0].drawSquare("LimeGreen");
    var isEvenSegment = false;

    for (var i = 1; i < this.segments.length; i++) {
      if (isEvenSegment) {
        this.segments[i].drawSquare("Blue");
      } else {
        this.segments[i].drawSquare("Yellow");
      }

      isEvenSegment = !isEvenSegment; // Next segment will be odd
    }
};

//Створюємо нову голову та додаємо її до початку змійки, щоб перезмійку в поточному напрямку
Snake.prototype.move = function () {
    var head = this.segments[0];
    var newHead;

    this.direction = this.nextDirection;

    if (this.direction === "right") {
      newHead = new Block(head.col + 1, head.row);
    } else if (this.direction === "down") {
      newHead = new Block(head.col, head.row + 1);
    } else if (this.direction === "left") {
      newHead = new Block(head.col - 1, head.row);
    } else if (this.direction === "up") {
      newHead = new Block(head.col, head.row - 1);
    }

    if (this.checkCollision(newHead)) {
      gameOver();
      return;
    }

    this.segments.unshift(newHead);

    if (newHead.equal(apple.position)) {
      score++;
      animationTime -= 5;
      apple.move(this.segments);
    } else {
      this.segments.pop();
    }
};

//Перевіряємо, чи нова голова змійки зіткнулася і стіною або з власним тілом
Snake.prototype.checkCollision = function (head) {
    var leftCollision = (head.col === 0);
    var topCollision = (head.row === 0);
    var rightCollision = (head.col === widthInBlocks - 1);
    var bottomCollision = (head.row === heightInBlocks - 1);

    var wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

    var selfCollision = false;

    for (var i = 0; i < this.segments.length; i++) {
      if (head.equal(this.segments[i])) {
        selfCollision = true;
      }
    }

    return wallCollision || selfCollision;
};

//Задаємо наступний напрям руху змійки на основі клавіатури
Snake.prototype.setDirection = function (newDirection) {
    if (this.direction === "up" && newDirection === "down") {
      return;
    } else if (this.direction === "right" && newDirection === "left") {
      return;
    } else if (this.direction === "down" && newDirection === "up") {
      return;
    } else if (this.direction === "left" && newDirection === "right") {
      return;
    }

    this.nextDirection = newDirection;
};

//Конструктор Apple
var Apple = function () {
    this.position = new Block (10, 10);
};

//Малюємо коло на локаці яблучка
Apple.prototype.draw = function () {
    this.position.drawCircle("LimeGreen");
};

//Переміщуємо яблуко на нову випадкову локацію
Apple.prototype.move = function () {
    var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
    var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
    this.position = new Block(randomCol, randomRow);
};

//Створюємо об'єкти змійки та яблука
var snake = new Snake();
var apple = new Apple();

var playing = true;
var animationTime = 100;

//Передаємо функцію анімації до setInterval
var gameLoop = function () {
    ctx.clearRect(0, 0, width, height);
    drawScore();
    snake.move();
    snake.draw();
    apple.draw();
    drawBorder();

    if (playing) {
        setTimeout(gameLoop, animationTime);
    }
};

gameLoop();

//Конвертуємо ключ-коди в напрямки
var directions = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
};

//Обробник keydown для маніпуляції напрямками, заданими натисканням клавіш
$("body").keydown(function (event) {
    var newDirection = directions[event.keyCode];
    if (newDirection !== undefined) {
      snake.setDirection(newDirection);
    }
});