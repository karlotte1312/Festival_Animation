// Globale Variablen
let shapes = [];
const numShapes = 7
const radius = 30;
const speed = 1.6; // ✅ Geschwindigkeit: 2.0 (schneller!)

// Farbpalette (HSB)
const colors = [
  [0, 100, 100],   // Rot
  [60, 100, 100],  // Gelb
  [120, 100, 100], // Grün
  [180, 100, 100], // Cyan
  [240, 100, 100], // Blau
  [300, 100, 100], // Magenta
  [360, 100, 100]  // Rot (wieder)
];

// ✅ Kollisionsschutz: Track, ob Kollision gerade stattgefunden hat
let lastCollision = [];

class Shape {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    let angle = random(TWO_PI);
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    this.color = colors[floor(random(colors.length))];
    this.radius = radius;
    this.id = shapes.length; // ID für Kollisionsschutz
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Kollision mit Wänden (Bildrand)
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
    return distance < (this.radius + other.radius);
  }

  handleCollision(other) {
    // ✅ Farbwechsel
    this.color = colors[floor(random(colors.length))];
    other.color = colors[floor(random(colors.length))];

    // ✅ Normalvektor
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

    // Projektion der Geschwindigkeiten auf die Normale
    let dot1 = v1x * nx + v1y * ny;
    let dot2 = v2x * nx + v2y * ny;

    // ✅ Reflexion (Billard-Physik)
    this.vx = v1x - 2 * dot1 * nx;
    this.vy = v1y - 2 * dot1 * ny;

    other.vx = v2x - 2 * dot2 * nx;
    other.vy = v2y - 2 * dot2 * ny;

    // ✅ Trennabstand: schiebe sie leicht auseinander
    let overlap = (this.radius + other.radius) - dist;
    if (overlap > 0) {
      let pushX = nx * overlap * 0.5;
      let pushY = ny * overlap * 0.5;
      this.x += pushX;
      this.y += pushY;
      other.x -= pushX;
      other.y -= pushY;
    }

    // ✅ Kollisionsschutz: verhindere sofortige Wiederholung
    lastCollision[this.id] = frameCount;
    lastCollision[other.id] = frameCount;
  }

  display() {
    fill(this.color[0], this.color[1], this.color[2]);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2);
  }
}

function setup() {
  createCanvas(300, 400); // ✅ Bildgröße: 600 × 800 px
  colorMode(HSB, 360, 100, 100, 1);

  // Zufällige Startpositionen
  for (let i = 0; i < numShapes; i++) {
    let x = random(100, width - 100);
    let y = random(100, height - 100);
    let shape = new Shape(x, y);
    shapes.push(shape);
  }

  // ✅ Initialisiere Kollisionsschutz
  for (let i = 0; i < numShapes; i++) {
    lastCollision[i] = 0;
  }
}

function draw() {
  background(10, 10, 10);

  // Kollisionen prüfen und behandeln
  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      let s1 = shapes[i];
      let s2 = shapes[j];

      // ✅ Kollisionsschutz: verhindere Kollision, wenn gerade passiert
      if (frameCount - lastCollision[i] < 10 || frameCount - lastCollision[j] < 10) {
        continue;
      }

      if (s1.checkCollision(s2)) {
        s1.handleCollision(s2);
      }
    }
  }

  // Alle Formen aktualisieren und anzeigen
  for (let shape of shapes) {
    shape.update();
    shape.display();
  }
}
