
// El que maneja la logica de los modelos, completamente independientes de phaser (js puro)
var Director = exports.Director = function Director(stage){
  this.stage = stage;
  this.elapsedTime = 0;

  // TODO crear modelo CollisionManager y mover esto ahi
  this.stage.world.on("beginContact", function(event){
		if (event.bodyA.faction === "PlayerBullet" && event.bodyB.faction === "Enemy"){
      var bullet = event.bodyA, mob = event.bodyB;
      bullet.die();
  		mob.takeDamage(stage.player.strength / 5);	// TODO: constant

      if (mob.health <= 0) {
        mob.die();
        //this.explode(mob);
        bullet.shooter.score += mob.points;
      }
		}
		else if (event.bodyB.faction === "PlayerBullet" && event.bodyA.faction === "Enemy"){
      var bullet = event.bodyB, mob = event.bodyA;
      bullet.die();
  		mob.takeDamage(stage.player.strength / 5);	// TODO: constant
  		if (mob.health <= 0) {
        //mob.die();
        //this.explode(mob);
        bullet.shooter.score += mob.points;
      }
		}
		else if (event.bodyA.faction === "Player" && event.bodyB.faction === "EnemyBullet"){
      var bullet = event.bodyB, player = event.bodyA;
      bullet.die();
      player.takeDamage(10);
		}
		else if (event.bodyB.faction === "Player" && event.bodyA.faction === "EnemyBullet"){
      var bullet = event.bodyA, player = event.bodyB;
      bullet.die();
      player.takeDamage(10);
		}
    else if (event.bodyB.faction === "Player" && event.bodyA.faction === "Enemy"){
      var player = event.bodyB, mob = event.bodyA;
      mob.die();
      player.takeDamage(10);  // TODO: constant
      //if (player.health <= 0) {
      //  player.die();
      //}
    }
    else if (event.bodyB.faction === "Enemy" && event.bodyA.faction === "Player"){
      var player = event.bodyA, mob = event.bodyB;
      mob.die();
      player.takeDamage(10);  // TODO: constant
      //if (player.health <= 0) {
      //  player.die();
      //}
    }
	else if (event.bodyA.faction === "Player" && event.bodyB.faction === "Bonus"){
      var bonus = event.bodyB, player = event.bodyA;
      bonus.die();
	  player.collectUpgrade(bonus.bonusClass);
		}
	else if (event.bodyB.faction === "Player" && event.bodyA.faction === "Bonus"){
      var bonus = event.bodyA, player = event.bodyB;
      bonus.die();
	  player.collectUpgrade(bonus.bonusClass);
		}
	});
};

Director.prototype = {
  // Avanza la logica "delta" milisegundos en el tiempo con un determinado "input",
  // dando "steps" pasos intermedios (util para deltas grandes)
  interpolatedNext: function interpolatedNext(delta, steps, input){
    var interpolationDelta = delta / steps;
    var actualDelta = 0;
    while (actualDelta < delta){
      this.next(interpolationDelta, input);
      actualDelta += interpolationDelta;
    }
  },

  // Avanza la logica "delta" milisegundos en el tiempo con un determinado "input"
  next: function next(delta, input){
    this.elapsedTime += delta; // TODO ver si esto va aca o al final de next (afecta los spawns)
    this.updateEnemySpawn(delta); // TODO crear modelo "spawnManager" y mover esto ahi
    this.updateBackground(delta); // TODO mover esto a otro lado (stage? o crear otro modelo)
    var stage = this.stage;
    // Physics
    stage.world.step(delta/1000);
    // Player ship
    if (stage.player.alive) {
      stage.player.updateLogic(delta, input);
    }
    // Player bullets
    stage.player.bulletPool.forEach(function(bullet){
      if (bullet.alive && bullet.exists){
        bullet.updateLogic(delta);
      }
    });
    // Enemy bullets
    stage.enemyBulletPools.forEach(function(pool){
      pool.forEach(function(bullet){
        if (bullet.alive && bullet.exists){
          bullet.updateLogic(delta);
        }
      },this);
    },this);
    // Enemy (flying)
    stage.mobPools.forEach(function(pool){
      pool.forEach(function(enemy){
        if (enemy.alive && enemy.exists){
          enemy.updateLogic(delta);
        }
      },this);
    },this);
	// Collectibles
	stage.bonuses.forEach(function(bonus){
      if (bonus.alive && bonus.exists){
        bonus.updateLogic(delta);
      }
    });
    // Enemy (ground)
    stage.mobPoolsGround.forEach(function(pool){
      pool.forEach(function(enemy){
        if (enemy.alive && enemy.exists){
          enemy.updateLogic(delta);
        }
      },this);
    },this);
  },

  updateEnemySpawn: function(delta){
    this.updateFlyingEnemySpawn(delta);
    this.updateGroundEnemySpawn(delta);
  },

  updateFlyingEnemySpawn: function(delta){
    var enemy, i;
    for (i = 0; i < this.stage.mobPools.length; i++) {
      if (this.stage.nextEnemyAt[i] < this.elapsedTime
      && this.stage.mobPools[i].find(function(m) { return !m.alive })) {
        // this.stage.nextEnemyAt[i] = this.elapsedTime + this.stage.enemyDelay[i]; // TODO ver cual de las dos es mejor
        this.stage.nextEnemyAt[i] = this.stage.nextEnemyAt[i] + this.stage.enemyDelay[i];
        enemy = this.stage.mobPools[i].find(function(mob){ return mob.exists === false; });
        enemy.revive();
      }
    }
  },

  updateGroundEnemySpawn: function(delta){
    var enemy, i;
    for (i = 0; i < this.stage.mobPoolsGround.length; i++) {
      if (this.stage.nextGroundEnemyAt[i] < this.elapsedTime
      && this.stage.mobPoolsGround[i].find(function(m) { return !m.alive })) {
        // this.stage.nextGroundEnemyAt[i] = this.elapsedTime + this.stage.enemyDelayGround[i]; // TODO ver cual de las dos es mejor
        this.stage.nextGroundEnemyAt[i] = this.stage.nextGroundEnemyAt[i] + this.stage.enemyDelayGround[i];
        enemy = this.stage.mobPoolsGround[i].find(function(mob){return mob.exists === false});
        enemy.revive();
      }
    }
  },

  updateBackground: function (delta) {
		// SCROLLING
    var deltaSeconds = delta / 1000;
		if (this.stage.player.alive && false) { // FIXME
			this.stage.scrollSpeed += CONFIG.SCROLL_ACCEL * deltaSeconds / 60;	// Accelerate scrolling speed
		}
		if (this.stage.groundY < 0 ) {	// Is camera still in the buffer zone ?
			// Let's scroll the ground
			this.stage.groundY += this.stage.scrollSpeed * CONFIG.PIXEL_RATIO * deltaSeconds;
		} else {	// Camera has reached the edge of the buffer zone, next chunk of map
      this.stage.scrollCounter += CONFIG.WORLD_SWAP_HEIGHT;
			if (this.stage.scrollCounter > CONFIG.WORLD_HEIGHT) { // Has camera reached the end of the world ?
				this.stage.scrollCounter = 0;
			}
      this.stage.groundY = -this.stage.scrollMax;
      this.stage.queuedToDraw = true;
		}
	},
}
