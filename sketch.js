let horaPaz;
let relojes = [];

const PUNTO_PENDIENTE = 0;
const DDA = 1;
const BRESENHAM = 2;

function setup() {
  createCanvas(400, 400);
  frameRate(1); // Set the frame rate to 1 so we can see the clock ticking

  horaPaz = createInput();
  horaPaz.position(20, 20);

  startButton = createButton("Start");
  startButton.position(20, 50);
  startButton.mousePressed(loadRelojes);
}

function loadRelojes() {
  relojes = [];

  const diferenciaHorariaCiudadMexico = 1;
  const diferenciaHorariaBarcelona = 9;

  let [h, m, s] = horaPaz.value().split(":").map(Number);
  console.log(h, m, s);
  relojes.push(new Reloj(90, 200, h, m, s, PUNTO_PENDIENTE, "La Paz"));
  relojes.push(
    new Reloj(
      200,
      200,
      h + diferenciaHorariaCiudadMexico,
      m,
      s,
      DDA,
      "Ciudad de México"
    )
  );
  relojes.push(
    new Reloj(
      310,
      200,
      h + diferenciaHorariaBarcelona,
      m,
      s,
      BRESENHAM,
      "Barcelona"
    )
  );
}

function draw() {
  background(220);

  for (let reloj of relojes) {
    reloj.dibujar();
    reloj.actualizarTiempo();
  }
}

class Reloj {
  constructor(x, y, hora, minuto, segundo, algoritmo, nombre) {
    this.x = x;
    this.y = y;
    this.hora = hora;
    this.minuto = minuto;
    this.segundo = segundo;
    this.algoritmo = algoritmo;
    this.nombre = nombre;
  }

  dibujar() {
    push();
    translate(this.x, this.y);

    // Dibuja la esfera del reloj
    this.drawCircle(0, 0, 50);

    // Dibuja las manecillas utilizando el algoritmo especificado
    switch (this.algoritmo) {
      case PUNTO_PENDIENTE:
        push();
        rotate(map((this.hora %= 12), 0, 12, 0, TWO_PI) - HALF_PI);
        this.drawLinePP(0, 0, 20, 0);
        pop();

        push();
        rotate(map(this.minuto, 0, 60, 0, TWO_PI) - HALF_PI);
        this.drawLinePP(0, 0, 30, 0);
        pop();

        push();
        stroke("red"); // Set the stroke color to red
        rotate(map(this.segundo, 0, 60, 0, TWO_PI) - HALF_PI);
        this.drawLinePP(0, 0, 40, 0);
        stroke("black"); // Reset the stroke color to black
        pop();
        break;
      case DDA:
        push();
        rotate(map((this.hora %= 12), 0, 12, 0, TWO_PI) - HALF_PI);
        this.drawLineDDA(0, 0, 20, 0);
        pop();

        push();
        rotate(map(this.minuto, 0, 60, 0, TWO_PI) - HALF_PI);
        this.drawLineDDA(0, 0, 30, 0);
        pop();

        push();
        stroke("red"); // Set the stroke color to red
        rotate(map(this.segundo, 0, 60, 0, TWO_PI) - HALF_PI);
        this.drawLineDDA(0, 0, 40, 0);
        stroke("black"); // Reset the stroke color to black
        pop();
        break;
      case BRESENHAM:
        push();
        rotate(map((this.hora %= 12), 0, 12, 0, TWO_PI) - HALF_PI);
        this.drawLineBresenham(0, 0, 20, 0);
        pop();

        push();
        rotate(map(this.minuto, 0, 60, 0, TWO_PI) - HALF_PI);
        this.drawLineBresenham(0, 0, 30, 0);
        pop();

        push();
        stroke("red"); // Set the stroke color to red
        rotate(map(this.segundo, 0, 60, 0, TWO_PI) - HALF_PI);
        this.drawLineBresenham(0, 0, 40, 0);
        stroke("black"); // Reset the stroke color to black
        pop();
        break;
    }

    // Draw the name of the clock below it
    textAlign(CENTER, CENTER);
    text(this.nombre, 0, 60);

    pop();
  }

  actualizarTiempo() {
    this.segundo = (this.segundo + 1) % 60;
    if (this.segundo === 0) {
      this.minuto = (this.minuto + 1) % 60;
      if (this.minuto === 0) {
        this.hora = (this.hora + 1) % 24;
      }
    }
  }

  drawCircle(xc, yc, r) {
    let x = 0;
    let y = r;
    let d = 1 - r;

    this.drawCirclePoints(xc, yc, x, y);

    while (x < y) {
      if (d < 0) {
        d += 2 * x + 3;
      } else {
        d += 2 * (x - y) + 5;
        y--;
      }
      x++;
      this.drawCirclePoints(xc, yc, x, y);
    }
  }

  drawCirclePoints(xc, yc, x, y) {
    point(xc + x, yc + y, 0);
    point(xc - x, yc + y, 0);
    point(xc + x, yc - y, 0);
    point(xc - x, yc - y, 0);
    point(xc + y, yc + x, 0);
    point(xc - y, yc + x, 0);
    point(xc + y, yc - x, 0);
    point(xc - y, yc - x, 0);
  }

  drawLinePP(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const m = dy / dx;

    for (let x = x1; x <= x2; x++) {
      const y = m * (x - x1) + y1;
      point(Math.round(x), Math.round(y));
    }
  }

  drawLineDDA(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    const xIncrement = dx / steps;
    const yIncrement = dy / steps;

    let x = x1;
    let y = y1;

    for (let i = 0; i <= steps; i++) {
      point(Math.round(x), Math.round(y));
      x += xIncrement;
      y += yIncrement;
    }
  }

  drawLineBresenham(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
      point(x, y);

      if (x === x2 && y === y2) {
        break;
      }

      const e2 = 2 * err;

      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }

      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }
}
