
// ✅ Array mit Pfaden zu den PNGs für jede Form
const shapeImagePaths = [
  ["assets/shape7/1.png", "assets/shape7/2.png", "assets/shape7/3.png"],
  ["assets/shape3/1.png", "assets/shape3/2.png", "assets/shape3/3.png"],
  ["assets/shape4/1.png", "assets/shape4/2.png", "assets/shape4/3.png"],
  ["assets/shape5/1.png", "assets/shape5/2.png", "assets/shape5/3.png"],
  ["assets/shape6/1.png", "assets/shape6/2.png", "assets/shape6/3.png"]
];

function preload() {
  // Lade alle Bilder vor dem Setup
  for (let i = 0; i < shapeImagePaths.length; i++) {
    for (let j = 0; j < shapeImagePaths[i].length; j++) {
      loadImage(shapeImagePaths[i][j], () => {}, () => {
        console.error("Fehler beim Laden von:", shapeImagePaths[i][j]);
      });
    }
  }
}

// Globale Variablen
let shapes = [];
const numShapes = 5;
const radius = 60;
const speed = 2.0;

// ✅ Kollisionsschutz
let lastCollision = [];

class Shape {
  constructor(x, y, imgPaths) {
    this.x = x;
    this.y = y;
    let angle = random(TWO_PI);
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    this.imgPaths = imgPaths;
    this.currentImgIndex = 0;
    this.img = loadImage(imgPaths[0], () => {}, () => {
  console.error("Fehler beim Laden von:", imgPaths[0]);
});
    this.radius = radius;
    this.id = shapes.length;
    
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Kollision mit Wänden
    if (this.x < this.radius) {
      this.x = this.radius;
      this.vx *= -1;
    }
    if (this.x > width - this.radius) {
      this.x = width - this.radius;
      this.vx *= -1;
    }
    if (this.y < this.radius) {
      this.y = this.radius;
      this.vy *= -1;
    }
    if (this.y > height - this.radius) {
      this.y = height - this.radius;
      this.vy *= -1;
    }
  }

  checkCollision(other) {
    let dx = this.x - other.x;
    let dy = this.y - other.y;
    let distance = sqrt(dx * dx + dy * dy);
    return distance < this.radius + other.radius;
  }

 handleCollision(other) {
  // ✅ Bildwechsel: nächstes PNG aus Array
  this.currentImgIndex = (this.currentImgIndex + 1) % this.imgPaths.length;
   this.img = loadImage(this.imgPaths[this.currentImgIndex], () => {}, () => {
    console.error("Fehler beim Laden von:", this.imgPaths[this.currentImgIndex]);
  });


    // ✅ Normalvektor (von other zu this)
    let dx = this.x - other.x;
    let dy = this.y - other.y;
    let dist = sqrt(dx * dx + dy * dy);

    if (dist === 0) return;

    let nx = dx / dist;
    let ny = dy / dist;

    // Geschwindigkeitsvektor von this
    let v1x = this.vx;
    let v1y = this.vy;

    // Geschwindigkeitsvektor von other
    let v2x = other.vx;
    let v2y = other.vy;

    // ✅ Projektion der Geschwindigkeiten auf die Normale
    let dot1 = v1x * nx + v1y * ny;
    let dot2 = v2x * nx + v2y * ny;

    // ✅ Stärkere Reflexion: nur die Normalkomponente wird umgekehrt
    this.vx = v1x - 2 * dot1 * nx;
    this.vy = v1y - 2 * dot1 * ny;

    other.vx = v2x - 2 * dot2 * nx;
    other.vy = v2y - 2 * dot2 * ny;

  // ✅ Trennabstand
  
  let overlap = (this.radius + other.radius) - dist;
  if (overlap > 0) {
    let pushX = nx * overlap * 0.5;
    let pushY = ny * overlap * 0.5;
    this.x += pushX;
    this.y += pushY;
    other.x -= pushX;
    other.y -= pushY;
  }

  // ✅ Kollisionsschutz
  lastCollision[this.id] = frameCount;
  lastCollision[other.id] = frameCount;
}

  display() {
    if (this.img) {
      image(
        this.img,
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        this.radius * 2
      );
    }
  }
}

function setup() {
  createCanvas(600, 800);
  colorMode(HSB, 360, 100, 100, 1);

  // Zufällige Startpositionen
  for (let i = 0; i < numShapes; i++) {
    let x = random(100, width - 100);
    let y = random(100, height - 100);
    shapes.push(new Shape(x, y, shapeImagePaths[i]));
  }

  // ✅ Kollisionsschutz initialisieren
  for (let i = 0; i < numShapes; i++) {
    lastCollision[i] = 0;
  }
}

function draw() {
  background(10, 10, 10);

for (let i = 0; i < shapes.length; i++) {
  for (let j = i + 1; j < shapes.length; j++) {
    let s1 = shapes[i];
    let s2 = shapes[j];

    if (frameCount - lastCollision[i] < 10 || frameCount - lastCollision[j] < 10) {
      continue;
    }

    if (s1.checkCollision(s2)) {
      // ✅ Beide Formen wechseln das Bild!
      s1.handleCollision(s2);
      s2.handleCollision(s1); // ← Hier: s2 ruft handleCollision auf
    }
  }
}
  }

  // Alle Formen anzeigen
  for (let shape of shapes) {
    shape.update();
    shape.display();
  }
