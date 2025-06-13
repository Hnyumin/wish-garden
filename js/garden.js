let flowerImages = [];
let grassImg;
let circleImg;
let flowers = [];
let availableX = [];
let wishes = [];
let currentIndex = 0;

const stemColors = [
  '#bcf660', // 건강
  '#ffff00', // 재물
  '#ff7fc2', // 사랑
  '#ff9058', // 관계
  '#4dbbff'  // 성장
];

function preload() {
  for (let i = 0; i < 5; i++) {
    flowerImages[i] = loadImage("img/flower_" + i + ".png");
  }
  grassImg = loadImage("img/grass.svg");
  circleImg = loadImage("img/circle.svg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // ✅ 커서 이미지 적용
  let c = document.querySelector('canvas');
  c.style.cursor = "url('/wish-garden/img/cursor.png') 8 8, auto";

  textAlign(CENTER, CENTER);
  textSize(14);

  wishes = getWishes();
  let flowerCount = wishes.length || 20;

  let margin = 80;
  let currentX = margin;

  for (let i = 0; i < flowerCount; i++) {
    let gap = random(100, 160);
    currentX += gap;
    if (currentX > width - margin) break;
    availableX.push(currentX);
  }
}

function draw() {
  background('#fefaf3');
  imageMode(CORNER);
  image(grassImg, 0, height - 120 - 90, width, 208);

  for (let f of flowers) {
    f.update();
    f.display();
  }
}

function mousePressed() {
  wishes = getWishes();
  if (!wishes || wishes.length === 0) return;

  for (let f of flowers) {
    let d = dist(mouseX, mouseY, f.x, f.baseY - f.height);
    if (d < 40) {
      f.checkClick(mouseX, mouseY);
      return;
    }
  }

  if (currentIndex < wishes.length && availableX.length > 0) {
    let index = floor(random(availableX.length));
    let x = availableX[index];
    availableX.splice(index, 1);

    let y = random(60, 160);
    let w = wishes[currentIndex];
    flowers.push(new Flower(x, y, w.text, w.type));
    currentIndex++;
  }
}

function getWishes() {
  let data = localStorage.getItem("wishes");
  return data ? JSON.parse(data) : [];
}

function openPopup(msg) {
  document.getElementById("popup-text").innerText = msg;
  document.getElementById("popup").style.display = "block";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

class Flower {
  constructor(x, maxHeight, wish, type = 0) {
    this.x = x;
    this.baseY = random(height - 220, height - 180);
    this.height = 0;
    this.maxHeight = maxHeight;
    this.wish = wish;
    this.type = type;
    this.growSpeed = 2;
    this.particles = [];
    this.hasBloomed = false;
  }

  update() {
    if (this.height < this.maxHeight) {
      this.height += this.growSpeed;
    } else if (!this.hasBloomed) {
      for (let i = 0; i < 3; i++) {
        let offsetX = random(-30, 30);
        let offsetY = random(-10, 10);
        this.particles.push(new Particle(this.x + offsetX, this.baseY - this.maxHeight + offsetY));
      }
      this.hasBloomed = true;
    }

    for (let p of this.particles) {
      p.update();
    }

    this.particles = this.particles.filter(p => !p.isDead());
  }

  display() {
    push();
    translate(this.x, this.baseY);

    stroke(stemColors[this.type] || '#89e000');
    strokeWeight(8);
    line(0, 0, 0, -this.height);

    translate(0, -this.height - 50);
    this.drawFlower(this.type);
    pop();

    for (let p of this.particles) {
      p.display();
    }
  }

  drawFlower(type) {
    if (flowerImages[type]) {
      imageMode(CENTER);
      let flowerW = width * 0.12;
      let flowerH = height * 0.15;
      image(flowerImages[type], 0, 0, flowerW, flowerH);
    } else {
      fill('#aaa');
      ellipse(0, 0, 60);
    }
  }

  checkClick(mx, my) {
    const flowerWidth = 100;
    const flowerHeight = 100;
    const flowerX = this.x - flowerWidth / 2;
    const flowerY = this.baseY - this.height - flowerHeight / 2;

    if (
      mx >= flowerX && mx <= flowerX + flowerWidth &&
      my >= flowerY && my <= flowerY + flowerHeight
    ) {
      openPopup(this.wish);
    }
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(16, 24);
    this.alpha = 255;
    this.speed = random(0.5, 1.2);
  }

  update() {
    this.y -= this.speed;
    this.alpha -= 2;
  }

  display() {
    if (this.alpha <= 0 || !circleImg) return;
    push();
    tint(255, this.alpha);
    imageMode(CENTER);
    image(circleImg, this.x, this.y, this.size, this.size);
    pop();
  }

  isDead() {
    return this.alpha <= 0 || this.y < -50;
  }
}
