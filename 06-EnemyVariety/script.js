window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 500;
  canvas.height = 500;

  class Game {
    constructor(ctx, width, height) {
      this.ctx = ctx;
      this.width = width;
      this.height = height;
      this.enemies = [];
      this.enemyInterval = 250;
      this.enemyTimer = 0;
      this.enemyTypes = ['worm', 'ghost', 'spider']
    }
    update(deltaTime) {
      /** Delta time is to ensure same speed of rendering on
       * machines of different speed and refresh rates
       */
      if (this.enemyTimer > this.enemyInterval) {
        /** Check for enemies outside canvas and delete them */
        this.enemies = this.enemies.filter(x => !x.markedForDeletion)
        
        this.#addNewEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
      this.enemies.forEach(enemy => enemy.update(deltaTime));
    }
    draw() {
      this.enemies.forEach(enemy => enemy.draw(this.ctx));
    }
    /** Private method */
    #addNewEnemy() {
      const randomEnemy = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)]
      if (randomEnemy === 'ghost') {
        this.enemies.push(new Ghost(this));
      } else if (randomEnemy === 'worm') {
        this.enemies.push(new Worm(this));
      } else if (randomEnemy === 'spider') {
        this.enemies.push(new Spider(this));
      }
      /** Sorts to ensure elements higher in the y axis are drawn
       * behind elements lower in the y axis
       */
      // this.enemies.sort((a, b) => {
      //   return a.y - b.y;
      // })
    }
  }

  class Enemy {
    constructor(game) {
      this.game = game;
      this.markedForDeletion = false;
      this.frameX = 0;
      this.maxFrame = 5;
      this.frameInterval = 100;
      this.frameTimer = 0;
    }
    update(deltaTime) {
      this.x -= this.vx * deltaTime;
      if (this.x < 0 - this.width) {
        this.markedForDeletion = true;
      }

      if (this.frameTimer > this.frameInterval) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = 0;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
    }
    draw(ctx) {
      ctx.drawImage(
        this.image, /** Image src */
        this.frameX * this.spriteWidth, 
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x, this.y, this.width, this.height)
    }
  } 

  class Worm extends Enemy {
    constructor(game) {
      /** Super used to call parent constructor
       * call super before using this object 
       */
      super(game);
      this.spriteWidth = 229;
      this.spriteHeight = 171;
      this.width = this.spriteWidth/2;
      this.height = this.spriteHeight/2;
      this.x = this.game.width;
      /** -height to make the assets(worms), stick to the ground */
      this.y = this.game.height -this.height;
      /** In Html, an element (image) with an id, is automatically mapped to that id word 
       * Hence 'worm' image with id="worm", get assigned to "worm" keyword below
      */
      this.image = worm;
      this.vx = Math.random() * 0.1 + 0.1;
    }
  }

  class Ghost extends Enemy {
    constructor(game) {
      /** Super used to call parent constructor
       * call super before using this object 
       */
      super(game);
      this.spriteWidth = 261;
      this.spriteHeight = 209;
      this.width = this.spriteWidth/2;
      this.height = this.spriteHeight/2;
      this.x = this.game.width;
      /** 0.8 to restrict the asset render to 60% of height from top */
      this.y = this.game.height * Math.random() * 0.6;
      /** In Html, an element (image) with an id, is automatically mapped to that id word 
       * Hence 'ghost' image with id="ghost", get assigned to "ghost" keyword below
      */
      this.image = ghost;
      this.vx = Math.random() * 0.1 + 0.3;
      this.angle = 0;
      this.curve = Math.random() * 3;
    }
    draw(ctx) {
      /** Save global Values of ctx before modifying */
      ctx.save();

      /** Set opacity of asset to 50% */
      ctx.globalAlpha = 0.7;
      /** Calling draw method of the parent (Enemy) class */
      super.draw(ctx);

      /** Restore ctx values to the state before altering them */
      ctx.restore();
    }
    update(deltaTime) {
      super.update(deltaTime);
      this.y += Math.sin(this.angle) * this.curve;
      this.angle += 0.04;
    }
  }

  class Spider extends Enemy {
    constructor(game) {
      /** Super used to call parent constructor
       * call super before using this object 
       */
      super(game);
      this.spriteWidth = 310;
      this.spriteHeight = 175;
      this.width = this.spriteWidth/2;
      this.height = this.spriteHeight / 2;
      /** Render Spiders anywhere between 0 and game width */
      this.x = Math.random() * this.game.width;
      /** 0- : To set the assets to start from just behind the top area */
      this.y = 0 - this.height;
      /** In Html, an element (image) with an id, is automatically mapped to that id word 
       * Hence 'spider' image with id="spider", get assigned to "spider" keyword below
      */
      this.image = spider;
      this.vx = 0;
      /** Random num b/w 0.1 and 0.2 :  Added random vertical speed */
      this.vy = Math.random() * 0.1 + 0.1;
      this.maxLength = Math.random() * this.game.height;
    }
    update(deltaTime) {
      super.update(deltaTime);
      /** Add different condition of deletion as spiders move vertically */
      if (this.y < 0 - this.height * 2) this.markedForDeletion = true;
      /** deltaTime multiplied to have consistent speed on different machine */
      this.y += this.vy * deltaTime;
      if (this.y > this.maxLength) {
        this.vy += -1;
      }
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.moveTo(this.x + this.width/2, 0);
      ctx.lineTo(this.x + this.width/2, this.y + 10);
      ctx.stroke();
      super.draw(ctx);
    }
  }

  const game = new Game(ctx, canvas.width, canvas.height);
  let lastTime = 1;
  function animate(timeStamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    game.update(deltaTime);
    game.draw();
    /** Some code */
    requestAnimationFrame(animate)
  };
  animate(0);
})