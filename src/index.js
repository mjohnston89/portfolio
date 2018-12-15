import "./scss/main.scss";

if(module.hot) {
  module.hot.accept();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  randBetween(min, max) {
    return min + Math.random() * (max - min);
  }
}

class Snowflake extends Particle {
  constructor() {
    super();
    this.vx = 0;
    this.vy = 0;
    this.radius = 0;
    this.alpha = 0;
    this.reset();
  }

  reset() {
    this.x = this.randBetween(0, window.innerWidth);
    this.y = this.randBetween(-window.innerHeight, 0);
    this.vx = this.randBetween(-0.5, 0.5);
    this.vy = this.randBetween(0.1, 0.5);
    this.radius = this.randBetween(1, 4);
    this.alpha = this.randBetween(0.1, 0.3);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if ((this.y + this.radius) > window.innerHeight) {
      this.reset();
    }
  }
}

class Circle extends Particle {
  constructor() {
    super();
    this.vx = 0;
    this.vy = 0;
    this.radius = 0;
    this.rotation = 0;
    this.alpha = 0;
    this.reset();
  }

  reset() {
    this.x = this.randBetween(0, window.innerWidth);
    this.y = this.randBetween(0, window.innerHeight);
    this.vx = this.randBetween(-0.5, 0.5);
    this.vy = this.randBetween(-0.5, 0.5);
    this.radius = this.randBetween(0.5, 5);
    this.alpha = this.randBetween(0.05, 0.25);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    // this needs updated to reset when x or y is offscreen
    if (this.y < -20 || this.y > (window.innerHeight + 20) || this.x < -20 || this.x > (window.innerWidth + 20)) {
      this.reset();
    }
  }
}

class Triangle extends Particle {
  constructor() {
    super();
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.alpha = 0;
    this.reset();
  }

  reset() {
    this.x = this.randBetween(0, window.innerWidth);
    this.y = this.randBetween(0, window.innerHeight);
    this.vx = this.randBetween(-0.5, 0.5);
    this.vy = this.randBetween(-0.5, 0.5);
    this.rotation = this.randBetween(0, 90);
    this.alpha = this.randBetween(0.1, 0.3);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    // this needs updated to reset when x or y is offscreen
    if (this.y < -20 || this.y > window.innerHeight + 20 || this.x < -20 || this.x > window.innerWidth + 20) {
      this.reset();
    }
  }
}

class Particles {
  constructor(type = 'circle') {
    this.type = type;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    document.getElementById('intro').appendChild(this.canvas);

    window.addEventListener('resize', () => this.onResize());
    this.onResize();

    this.updateBound = this.update.bind(this);
    requestAnimationFrame(this.updateBound);

    this.generateParticles();
  }

  generateParticles() {
    const particleCount = window.innerWidth / 6;
    this.particles = [];
    for (let p = 0; p < particleCount; p++) {
      if (this.type === 'snow') {
        this.particles.push(new Snowflake());
      } else if (this.type === 'triangles') {
        this.particles.push(new Triangle());
      } else {
        this.particles.push(new Circle());
      }
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  update() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for(const p of this.particles) {
      p.update();
      this.ctx.save();
      if (this.type === 'snow') {
        this.updateSnow(this.ctx, p);
      } else if (this.type === 'circle') {
        this.updateCircle(this.ctx, p);
      } else if (this.type === 'triangle') {
        this.updateTriangle(this.ctx, p);
      }
      this.ctx.restore();
    }
    requestAnimationFrame(this.updateBound);
  }

  updateCircle(ctx, p) {
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
    ctx.closePath();
    ctx.globalAlpha = p.alpha;
    ctx.stroke();
  }

  updateSnow(ctx, p) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
    ctx.closePath();
    ctx.globalAlpha = p.alpha;
    ctx.fill();
  }

  updateTriangle(ctx, p) {
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.rotate((Math.PI / 180) * p.rotation);
    ctx.moveTo(p.x + 25, p.y + 25);
    ctx.lineTo(p.x + 25, p.y + 9);
    ctx.lineTo(p.x + 9, p.y + 25);
    ctx.closePath();
    ctx.globalAlpha = p.alpha;
    ctx.stroke();
  }
}

document.addEventListener('DOMContentLoaded', function(){ 
  const isHome = document.getElementById('intro');
  if (isHome) {
    const theDate = new Date();
    const d = theDate.getDate(), m = theDate.getMonth();
    if (m === 11 && d < 26) {
      new Particles('snow');
    } else {
      new Particles();
    }
    document.querySelector('#control-language').addEventListener('click', function() { updateSkills(); });
    document.querySelector('#control-framework').addEventListener('click', function() { updateSkills(); });
    document.querySelector('#control-tool').addEventListener('click', function() { updateSkills(); });
  }
}, false);

function updateSkills() {
  const types = {
    language: document.querySelector('#control-language').checked,
    framework: document.querySelector('#control-framework').checked,
    tool: document.querySelector('#control-tool').checked
  }
  const chips = document.querySelectorAll('.chip');
  for (let c = 0; c < chips.length; c++) {
    chips[c].dataset.vis = types[chips[c].dataset.type] ? 'show': 'hide';
    if (chips[c].dataset.vis === 'show') {
      chips[c].classList.remove('hide');
      chips[c].classList.add('show');
      setTimeout(() => { chips[c].style.display = 'flex'; }, 0);
    } else {
      chips[c].classList.remove('show');
      chips[c].classList.add('hide');
      // set display to none with time to match css animation length
      setTimeout(() => { chips[c].style.display = 'none'; }, 200);
    }
  }
  
}

function updateAnimation(type) {
  for(const c of document.getElementsByTagName('canvas')) {
    c.remove();
  }
  new Particles(type);
}
