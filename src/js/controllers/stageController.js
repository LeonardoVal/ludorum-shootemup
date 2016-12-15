var StageController = exports.StageController = function StageController(stage, state) {
  this.state = state;
	this.game = state.game;
  this.stage = stage;
  this.createPlayerController();
  this.createPlayerBulletsControllers();
  this.createEnemyControllers();
}

StageController.prototype = {
  createPlayerController: function(){
    this.playerController = new PlayerController(this.stage.player, this.state);
		this.game.camera.follow(this.playerController, Phaser.Camera.FOLLOW_PLATFORMER);
  },

  createPlayerBulletsControllers: function(){
    this.playerBullets = this.game.add.group();
    this.stage.player.bulletPool.forEach(function(bullet){
      var bulletController = new SpriteController(bullet, this.state, 'player_bullet');
      // TODO ver como funciona esto. Se podria sacar perfectamente para que funcione mejor,
      // aunque las "animaciones" de las balas quedan bastante bien (hay mas o menos balas dependiendo del poder).
      // Hay que ver por que se agregan distintas animaciones (this.animations.add('idle',....))
      // en el update (asi estaba hecho originalmente) y no desde un principio en el controller
      bulletController.updateAnimation = function(){ // Override de metodo. Podra haber una clase BulletController y listo
        if (this.gameObject.playAnimation){
          if (this.gameObject.frame !== this.animFrame){
            this.animFrame = this.gameObject.frame;
            this.animations.add('idle', [ this.gameObject.frame ], 5, true);
          }
          this.play(this.gameObject.animation)
          this.gameObject.playAnimation = false;
        }
      };
      this.playerBullets.add(bulletController);
    }, this);
  },

  createEnemyControllers: function(){
    this.enemyBullets = this.game.add.group();
    this.stage.enemyBulletPools.forEach(function(pool){
      pool.forEach(function(bullet){
        this.enemyBullets.add(new SpriteController(bullet, this.state, bullet.image));
      },this);
    },this);
    this.flyingEnemies = this.game.add.group();
    this.stage.mobPools.forEach(function(pool){
      pool.forEach(function(enemy){
        this.flyingEnemies.add(new SpriteController(enemy, this.state, enemy.image));
      },this);
    },this);
    // TODO ground enemies
  }
}
