let particles = [];
let animStarted = false;
let animStartTime = 0;
let circleImg;
let clickX = 0;
let clickY = 0;

function preload() {
  circleImg = loadImage("circle.svg");
}

function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.position(0, 0);
  c.style('pointer-events', 'none');
  c.style('z-index', '999');
  noLoop(); // draw 수동 실행

  // 입력 처리
  const input = select('#wish-input');
  const button = select('#wish-button');
  const goButton = select('#go-garden-button');
goButton.mousePressed((e) => goToGarden({ target: e.target }));

  input.elt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      plantWish({ target: button.elt });
    }
  });

  button.mousePressed((e) => plantWish({ target: e.target }));
}

function draw() {
  clear();

  if (animStarted) {
    for (let p of particles) {
      p.update();
      p.display();
    }

    if (millis() - animStartTime > 1300) {
      animStarted = false;
      particles = []; // 🌱 파티클 배열 비우기
      document.getElementById("welcome-screen").style.display = "none";
      document.getElementById("wish-screen").style.display = "block";
      noLoop(); // ✅ draw 루프 중단
    }
  }
}

function enterGarden(event) {
  const rect = event.target.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  triggerParticles(x, y);
  loop(); // draw 시작
}

function plantWish(event) {
  const input = document.getElementById("wish-input");
  const wishText = input.value.trim();
  if (!wishText) return;

  // 소원 저장
  let wishes = getWishes();
  let flowerType = assignFlowerType(wishText);
  wishes.push({ text: wishText, type: flowerType, timestamp: Date.now() });
  localStorage.setItem("wishes", JSON.stringify(wishes));
  input.value = "";

  // 클릭 위치에서 효과 실행
  const rect = event.target.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  triggerParticles(x, y);
  loop(); // draw 시작
}

function triggerParticles(x, y) {
  particles = [];
  animStarted = true;
  animStartTime = millis();

  for (let i = 0; i < 4; i++) {
    particles.push(new Particle(x + random(-30, 30), y + random(-20, 20)));
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(15, 25);
    this.alpha = 255;
    this.speed = random(0.5, 1.5);
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
}

function getWishes() {
  let data = localStorage.getItem("wishes");
  return data ? JSON.parse(data) : [];
}

function assignFlowerType(text) {
  text = text.toLowerCase();

  const categories = [
    { type: 0, keywords: ["건강", "회복", "병", "치유", "운동", "활력", "아프", "낫게"] },
    { type: 1, keywords: ["돈", "부자", "재산", "월급", "복권", "사업"] },
    { type: 2, keywords: ["사랑", "연애", "결혼", "마음", "고백", "짝사랑", "사귀"] },
    { type: 3, keywords: ["가족", "친구", "관계", "부모", "아이", "소통", "인간관계", "화해"] },
    { type: 4, keywords: ["성장", "꿈", "목표", "공부", "성공", "노력", "개발", "자기"] }
  ];

  for (let category of categories) {
    for (let keyword of category.keywords) {
      if (text.includes(keyword)) return category.type;
    }
  }

  return Math.floor(Math.random() * 5);
}

function goToGarden(event) {
  const rect = event.target.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  triggerParticles(x, y);
  loop(); // ✅ 이 줄을 꼭 추가해야 draw()가 실행돼!

  animStarted = true;
  animStartTime = millis();

  // 기존 파티클 초기화 및 생성
  particles = [];
  for (let i = 0; i < 4; i++) {
    particles.push(new Particle(x + random(-30, 30), y + random(-20, 20)));
  }

  // 1.3초 후 페이지 이동
  setTimeout(() => {
    window.location.href = "garden.html";
  }, 1300);
}