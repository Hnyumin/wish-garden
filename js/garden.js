// 🌼 전체 코드: 줄기 시작점 랜덤 + circle.svg 효과 느리게 + 겹치지 않게 + grass 위치 수정 완료

let flowerImages = [];
let grassImg;
let circleImg;
let flowers = [];
let availableX = [];
let wishes = [];
let currentIndex = 0;

const stemColors = [
  '#bcf660', // type 0: 건강
  '#ffff00', // type 1: 재물
  '#ff7fc2', // type 2: 사랑
  '#ff9058', // type 3: 관계
  '#4dbbff'  // type 4: 성장
];

function preload() {
  for (let i = 0; i < 5; i++) {
    flowerImages[i] = loadImage(`img/flower_${i}.svg`);
  }
  grassImg = loadImage("img/grass.svg");
  circleImg = loadImage("img/circle.svg");
}

function setup() {
  let c = createCanvas(window.innerWidth, window.innerHeight);
  c.position(0, 0); // 브라우저 좌측 상단 고정
  c.style('display', 'block'); // 여백 제거
  textAlign(CENTER, CENTER);
  textSize(14);

  wishes = getWishes();
  let flowerCount = wishes.length || 20;
  for (let i = 0; i < flowerCount; i++) {
    let x = map(i, 0, flowerCount - 1, 80, width - 80);
    availableX.push(x);
  }
   currentIndex = 0; // ✅ 꽃 다시 자라게!
}

function draw() {
  clear();  // 이전 프레임 삭제

  // 배경색 채우기
  background('#fefaf3');

  imageMode(CORNER);
  image(grassImg, 0, height - 120 - 90, width, 208);

  for (let f of flowers) {
    f.update();
    f.display();
  }
}
function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function mousePressed() {
  wishes = getWishes();
  if (!wishes || wishes.length === 0) return;

  let clickedOnFlower = false;
  for (let f of flowers) {
    let d = dist(mouseX, mouseY, f.x, f.baseY - f.height);
    if (d < 40) {
      f.checkClick(mouseX, mouseY);
      clickedOnFlower = true;
      break;
    }
  }

  if (!clickedOnFlower && currentIndex < wishes.length && availableX.length > 0) {
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
    this.baseY = random(height - 200, height - 100); // 🌟 줄기 시작점 랜덤
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
        let offsetX = random(-30, 30); // 겹치지 않게 위치 흩어짐
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
      image(flowerImages[type], 0, 0, 200, 170);
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
      mx >= flowerX &&
      mx <= flowerX + flowerWidth &&
      my >= flowerY &&
      my <= flowerY + flowerHeight
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
    this.alpha -= 4;
    this.speed = random(0.5, 1.2);
  }

  update() {
    this.y -= this.speed;
    this.alpha -= 1.2; // 💨 느리게 사라짐
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
  return this.alpha <= 0 || this.y < 0;
 }
}
