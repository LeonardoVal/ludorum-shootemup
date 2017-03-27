
// El que maneja la logica de los modelos, completamente independientes de phaser (js puro)
var Director = exports.Director = function Director(stage){
  this.stage = stage;
  this.elapsedTime = 0;

  // TODO crear modelo CollisionManager y mover esto ahi
  this.stage.world.on("beginContact", function(event){
    // bodyA.collide(bodyB) TODO masks
    // bodyB.collide(bodyA)
		if (event.bodyA.faction === "PlayerBullet" && event.bodyB.faction === "Enemy"){
      var bullet = event.bodyA, mob = event.bodyB;
      bullet.die();
  		mob.takeDamage(stage.player.strength / 5);	// TODO: constant

      if (mob.health <= 0) {
        //this.explode(mob);
        bullet.shooter.score += mob.points;
      }
		}
		else if (event.bodyB.faction === "PlayerBullet" && event.bodyA.faction === "Enemy"){
      var bullet = event.bodyB, mob = event.bodyA;
      bullet.die();
  		mob.takeDamage(stage.player.strength / 5);	// TODO: constant
  		if (mob.health <= 0) {
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
    }
    else if (event.bodyB.faction === "Enemy" && event.bodyA.faction === "Player"){
      var player = event.bodyA, mob = event.bodyB;
      mob.die();
      player.takeDamage(10);  // TODO: constant
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
    // Physics
    this.stage.world.step(delta/1000);
    // updateLogic of basic gameObjects
    this.stage.forEach(function (gameObject) {
      if (gameObject.alive && gameObject.exists){
        gameObject.updateLogic(delta, input);
      }
    });
  },

  updateEnemySpawn: function(delta) { // NOTE: ver detalles de tiempos
    var spawn = this.stage.enemySpawns[this.stage.lastSpawn];
    while (spawn && spawn.time < this.elapsedTime){
      var enemy = spawn.pool.find(function(mob){ return mob.exists === false; });
      enemy.revive(spawn.x);
      spawn = this.stage.enemySpawns[++this.stage.lastSpawn]
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
