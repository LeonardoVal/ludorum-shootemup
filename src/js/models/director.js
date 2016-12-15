
// El que maneja la logica de los modelos, completamente independientes de phaser (js puro)
var Director = exports.Director = function Director(stage){
  this.stage = stage;
  this.elapsedTime = 0;
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
    var stage = this.stage;
    if (stage.player.alive) {
      stage.player.updateLogic(delta, input);
    }
    stage.player.bulletPool.forEach(function(bullet){
      if (bullet.alive && bullet.exists){
        bullet.updateLogic(delta);
      }
    });
    stage.enemyBulletPools.forEach(function(pool){
      pool.forEach(function(bullet){
        if (bullet.alive && bullet.exists){
          bullet.updateLogic(delta);
        }
      },this);
    },this);
    stage.mobPools.forEach(function(pool){
      pool.forEach(function(enemy){
        if (enemy.alive && enemy.exists){
          enemy.updateLogic(delta);
        }
      },this);
    },this);
    // TODO ground enemies
  },

  updateEnemySpawn: function(delta){
    var enemy, i;
    for (i = 0; i < this.stage.mobPools.length; i++) {
      if (this.stage.nextEnemyAt[i] < this.elapsedTime
      && this.stage.mobPools[i].find(function(m) { return !m.alive })) {
        // this.stage.nextEnemyAt[i] = this.elapsedTime + this.stage.enemyDelay[i]; // TODO ver cual de las dos es mejor
        this.stage.nextEnemyAt[i] = this.stage.nextEnemyAt[i] + this.stage.enemyDelay[i];
        enemy = this.stage.mobPools[i].find(function(mob){return mob.exists === false});
        enemy.revive();
      }
    }
  },
}
