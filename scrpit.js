window.addEventListener('load', () => {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 1000;
  canvas.height = 500;


  class inputHandler {
    constructor(game) {
      this.game = game;
      window.addEventListener('keydown', (e) => {
        if (((e.key === 'ArrowUp') || (e.key === 'ArrowDown')) && this.game.keys.indexOf(e.key) === -1) {
          this.game.keys.push(e.key)
        }
        if (e.key === ' ') {
          this.game.palyer.shootTop();
        }
        if (e.key === 'd') {
          this.game.debug = !this.game.debug;
        } 
      })
      window.addEventListener('keyup', e => {
        if (this.game.keys.indexOf(e.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1)
        }

      })
      
    }
  }
  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 10;
      this.height = 3;
      this.speed = 3;
      this.markedForDeletion = false;
      this.image = document.getElementById('projectile')
    }
    update() {
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y);
    }
  }
  class particle {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.image = document.getElementById('gears');
      this.frameX = Math.floor(Math.random() * 3);
      this.frameY = Math.floor(Math.random() * 3);
      this.spriteSize = 50;
      this.spriteModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
      this.size = this.spriteSize * this.spriteModifier;
      this.speedx = Math.random() * 6 - 3;
      this.speedy = Math.random() * -15;
      this.gravity = 0.5;
      this.markedForDeletion = false;
      this.angle = 0;
      this.va = Math.random() * 0.2 - 0.1;
      this.bounced = 0;
      this.bottomBouncedary = Math.random() * 80 + 60;
    }

    update() {
      this.angle += this.va;
      this.speedY += this.gravity;
      this.x -= this.speedx + this.game.speed;
      this.y += this.speedy;
      if (this.y > this.game.height + this.size || this.x < 0 - this.size)
        this.markedForDeletion = true;

      if (this.y > this.game.height - this.bottomBouncedary && !this.bounced < 2) {
        this.bounced++;
        this.speedy *= -0.2;
      }

    }

    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.drawImage(this.image, this.frameX * this.spriteSize,
        this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, this.size * -0.5,
        this.size * -0.5, this.size, this.size);
      context.restore();
    }
  }
  class palyer {
    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 20;
      this.y = 100;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
      this.speedY = 0;
      this.maxSpeed = 5;
      this.projectiles = [];
      this.image = document.getElementById('plyer');
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpLimit = 10000;

    }
    update(deltaTime) {
      if (this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed
      else if (this.game.keys.includes("ArrowDown")) this.speedY = this.maxSpeed;
      else this.speedY = 0
      this.y += this.speedY;

      // Vertical boundaries
      if (this.y > this.game.height - this.height * 0.6)
        this.y = this.game.height - this.height * 0.6;

      if (this.y < -this.height * 0.1) this.y = -this.height * 0.1;
      //handle projects
      this.projectiles.forEach(projectile => {
        projectile.update();
      });

      this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = 0;

      // power up
      if (this.powerUp) {
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0;
          this.powerUp = false;
          this.frameY = 0;
        } else {
          this.powerUpTimer += deltaTime;
          this.frameY = 1;
          this.game.ammo += 0.1;
        }
      }
    }

    draw(context) {
      if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

      this.projectiles.forEach(projectile => {
        projectile.draw(context);
      });

      context.drawImage(this.image, this.frameX * this.width,
        this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)

    }
    shootTop() {
      if (this.game.ammo > 0) {
        this.projectiles.push(new Projectile(this.game, this.x + 100, this.y + 30));
        this.game.ammo--;
      }
      if (this.powerUp) this.shootBottom();
    }

    shootBottom() {
      if (this.game.ammo > 0) {
        this.projectiles.push(new Projectile(this.game, this.x + 100, this.y + 175));

      }
    }

    enterPowerUp() {
      this.powerUpTimer = 0;
      this.powerUp = true;
      if (this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo;
    }


  }
  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - 0.9;
      this.markedForDeletion = false;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
    }
    update() {
      this.x += this.speedX - this.game.speed
      if (this.x + this.width < 0) this.markedForDeletion = true;
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      }
      else { this.frameX = 0; }
    }
    draw(context) {

      if (!this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height)
      context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)
      if (this.game.debug) {
        context.font = '20px Helvetica';
        context.fillText(this.lives, this.x, this.y);
      }
    }
  }
  class Anglerl extends Enemy {
    constructor(game) {
      super(game);
      this.lives = 5;
      this.scroe = this.lives;
      this.width = 228;
      this.height = 169;
      this.y = Math.random() * (this.game.height * 0.95 - this.height)
      this.image = document.getElementById('angler1');
      this.frameY = Math.floor(Math.random() * 3)
    }
  }
  class Angler2 extends Enemy {
    constructor(game) {
      super(game);
      this.lives = 6;
      this.scroe = this.lives;
      this.width = 213;
      this.height = 165;
      this.y = Math.random() * (this.game.height * 0.95 - this.height)
      this.image = document.getElementById('angler2');
      this.frameY = Math.floor(Math.random() * 3)
    }
  }
  class lucky extends Enemy {
    constructor(game) {
      super(game);
      this.lives = 5;
      this.scroe = 15;
      this.width = 99;
      this.height = 95;
      this.y = Math.random() * (this.game.height * 0.95 - this.height)
      this.image = document.getElementById('lucky');
      this.frameY = Math.floor(Math.random() * 3);
      this.type = 'lucky';

    }
  }
  class HiveWhale extends Enemy {
    constructor(game) {
      super(game);
      this.lives = 20;
      this.scroe = this.lives;
      this.width = 400;
      this.height = 227;
      this.y = Math.random() * (this.game.height * 0.95 - this.height)
      this.image = document.getElementById('hivewhale');
      this.frameY = 0;
      this.type = 'hivewhale';
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }
  class Drone extends Enemy {
    constructor(game, x, y) {
      super(game);
      this.lives = 3;
      this.scroe = this.lives;
      this.width = 115;
      this.height = 95;
      this.y = y;
      this.x = x;
      this.image = document.getElementById('drone');
      this.frameY = Math.floor(Math.random() * 2);
      this.type = 'drone';
      this.speedX = Math.random() * -4.2 - 0.5;
    }
  }

  class layer {
    constructor(game, image, speedModifirer) {
      this.game = game;
      this.image = image;
      this.speedModifirer = speedModifirer;
      this.width = 1768;
      this.height = 500;
      this.x = 0;
      this.y = 0;
    }
    update() {
      if (this.x <= -this.width) this.x = 0;
      this.x -= this.game.speed * this.speedModifirer;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y);
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }
  class background {
    constructor(game) {
      this.game = game;
      this.image1 = document.getElementById('layer1');
      this.image2 = document.getElementById('layer2');
      this.image3 = document.getElementById('layer3');
      this.image4 = document.getElementById('layer4');

      this.layer1 = new layer(this.game, this.image1, 0.2);
      this.layer2 = new layer(this.game, this.image2, 0.4);
      this.layer3 = new layer(this.game, this.image3, 1);
      this.layer4 = new layer(this.game, this.image4, 1.3);
      this.layers = [this.layer1, this.layer2, this.layer3];
    }
    update() {
      this.layers.forEach(layer => layer.update());
    }
    draw(context) {
      this.layers.forEach(layer => layer.draw(context));
    }
  }

  class Explosion {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.soriteWidth = 200;
      this.frameX = 0;
      this.soriteHeight = 200;
      this.timer = 0;
      this.fbs = 33;
      this.interval = 1000 / this.fbs;
      this.markedForDeletion = false;
      this.height = this.soriteHeight;
      this.width = this.soriteWidth;
      this.x = x - this.width * 0.5;
      this.y = y - this.height * 0.5;
    }

    update(deltaTime) {
      this.x -= this.game.speed;
      if (this.timer > this.interval) {
        this.frameX++;
        this.timer = 0;
      }
      else this.timer += deltaTime;
      if (this.frameX > this.maxFrame) this.markedForDeletion = true;
    }
    draw(context) {
      context.drawImage(this.image, this.frameX * this.soriteWidth
        , 0, this.soriteWidth, this.soriteHeight, this.y, this.x, this.y,
        this.width, this.height)
    }
  }

  class somkeExplsion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y);
      this.image = document.getElementById('smoke');


    }
  }

  class fireExplosion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y);
      this.image = document.getElementById('fire');
    }
  }
  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 35;
      this.fontFamily = 'Bangers';
      this.color = '#fff'
    }
    draw(context) {
      //scores
      context.save();
      context.fillStyle = this.color;
      context.shadowOffsetY = 2;
      context.shadowColor = '#544242'
      context.font = this.fontSize + 'px ' + this.fontFamily;
      context.fillText('Scroe: ' + this.game.scroe, 20, 40)

      //timer
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
      context.fillText('Timer: ' + formattedTime, 20, 100);
      // fame over messages
      if (this.game.gameOver) {
        context.textAlign = 'center'
        let message;
        let message2;
        if (this.game.scroe > this.game.winningScore) {
          message = 'You Win';
          message2 = 'Well Done';
        } else {
          message = 'You lose Buddy';
          message2 = 'Try again!';
        }
        context.font = '70px ' + this.fontFamily;
        context.fillText(message, this.game.width * 0.5, this.game.height * 0.5 - 30);
        context.font = '38px ' + this.fontFamily;
        context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 30);
      }
      /// ammo
      if (this.game.palyer.powerUp) context.fillStyle = 'orange'
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i, 50, 3, 15);
      }

      context.restore();
    }
  }
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.background = new background(this)
      this.palyer = new palyer(this);
      this.input = new inputHandler(this);
      this.ui = new UI(this);
      this.keys = [];
      this.enemies = [];
      this.particles = [];
      this.explosions = [];
      this.enemyTimer = 0;
      this.enemyInterval = 2000;
      this.ammo = 20;
      this.maxAmmo = 40;
      this.ammoTimer = 0;
      this.ammoInterval = 350;
      this.gameOver = false;
      this.scroe = 0;
      this.winningScore = 250;
      this.gameTime = 0;
      this.limitTime = 35000;
      this.speed = 1;
      this.debug = false;

    }
    update(deltaTime) {
      if (!this.gameOver) this.gameTime += deltaTime;
      if (this.gameTime > this.limitTime) this.gameOver = true;
      this.background.update();
      this.background.layer4.update();
      this.palyer.update(deltaTime);
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) {
          this.ammo++;
        }
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;
      }
      this.particles.forEach(particle => particle.update());
      this.particles = this.particles.filter(particle => !particle.markedForDeletion);

      this.explosions.forEach(explosion => explosion.update(deltaTime));
      this.explosions = this.explosions.filter(explosion => !explosion.markedForDeletion);
      this.enemies.forEach(enemy => {
        enemy.update();
        if (this.checkCollision(this.palyer, enemy)) {
          enemy.markedForDeletion = true;
          this.addexplodion(enemy);
          for (let i = 0; i < enemy.scroe; i++) {
            this.particles.push(new particle(this, enemy.x + enemy.width * 0.5,
              enemy.y + enemy.height * 0.5))
          }
          if (enemy.type == 'lucky') this.palyer.enterPowerUp();
          else if (!this.gameOver) this.scroe--;
        }
        this.palyer.projectiles.forEach(projectile => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            this.particles.push(new particle(this, enemy.x + enemy.width * 0.5,
              enemy.y + enemy.height * 0.5))
            if (enemy.lives <= 0) {

              for (let i = 0; i < enemy.scroe; i++) {
                this.particles.push(new particle(this, enemy.x + enemy.width * 0.5,
                  enemy.y + enemy.height * 0.5))
              }
              enemy.markedForDeletion = true;
              this.addexplodion(enemy);
              if (enemy.type === 'hivewhale') {
                for (let i = 0; i < 5; i++) {
                  this.enemies.push(new Drone(this, enemy.x + Math.random() * enemy.width,
                    enemy.y + Math.random() * enemy.height * 0.5))
                }
              }
              if (!this.gameOver) this.scroe += enemy.scroe;
              if (this.scroe > this.winningScore) this.gameOver = true;
            }
          }
        })
      })
      this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }

    draw(context) {
      this.background.draw(context);
      this.ui.draw(context);
      this.palyer.draw(context);
      this.particles.forEach(particle => particle.draw(context));
      this.enemies.forEach(enemy => {
        enemy.draw(context);
      })
      this.explosions.forEach(explosion => {
        explosion.draw(context);
      })
      this.background.layer4.draw(context);
    }
    addEnemy() {
      const randomize = Math.random();
      if (randomize < 0.3) this.enemies.push(new Anglerl(this))
      else if (randomize < 0.6) this.enemies.push(new Angler2(this))
      else if (randomize < 0.9) this.enemies.push(new HiveWhale(this))
      else this.enemies.push(new lucky(this))
    }

    addexplodion(enemy) {
      const randomize = Math.random();
      if (randomize < 0.5) {
        this.explosions.push(new somkeExplsion(this,
          enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5))
      } else {
        this.explosions.push(new fireExplosion(this,
          enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5))
      }
    }

    checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y
      )
    }

  }
  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;
  //
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    game.draw(ctx);
    game.update(deltaTime);
    requestAnimationFrame(animate)
  }
  animate(0);
});