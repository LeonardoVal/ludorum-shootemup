var StageController = exports.StageController = function StageController(stage, state) {
  this.state = state;
	this.game = state.game;
  this.stage = stage;
  this.createTilemap();
  this.createPlayerController();
  this.createBonusControllers();
  this.createPlayerBulletsControllers();
  this.createEnemyControllers();
}

StageController.prototype = {
  updateBackground: function() {
    if (this.stage.queuedToDraw) { // Camera has reached the edge of the buffer zone, next chunk of map
			this.drawGround();
      this.stage.queuedToDraw = false;
		}
    this.ground.y = this.stage.groundY;
  },

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

  makeControllersFromPool: function(pool, storage) {
    pool.forEach(function (poolElement) {
      storage.add(new SpriteController(poolElement, this.state, poolElement.image));
    }, this);
  },

  makeControllersFromPoolContainer: function(pools, storage) {
    for (var pool in pools) {
      if (pools.hasOwnProperty(pool)) {
        this.makeControllersFromPool(pools[pool], storage);
      }
    }
  },

  createEnemyControllers: function(){
    this.enemyBullets = this.game.add.group();
    this.makeControllersFromPoolContainer(this.stage.pools.enemyBullets, this.enemyBullets);

    this.groundEnemies = this.game.add.group();
    this.makeControllersFromPoolContainer(this.stage.pools.groundEnemies, this.groundEnemies);

    this.flyingEnemies = this.game.add.group();
    this.makeControllersFromPoolContainer(this.stage.pools.flyingEnemies, this.flyingEnemies);
  },

  createBonusControllers: function(){
    this.bonuses = this.game.add.group();
    this.makeControllersFromPool(this.stage.pools.bonus, this.bonuses)
  },

  createTilemap: function() {
    this.map = this.game.add.tilemap();

    if (CONFIG.DEBUG.tileset) {
      this.map.addTilesetImage('tileset_1', 'tileset_1_debug', 24, 28, null, null, 0);
    } else {
      this.map.addTilesetImage('tileset_1', 'tileset_1', 24, 28, null, null, 0);
    }

    // this.ground = map.create('layer0', CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT, 24, 28);
    this.ground = this.map.create('layer0', this.stage.groundWidth, this.stage.groundHeight, 24, 28);
    this.ground.fixedToCamera = false;
    this.ground.scale.setTo(CONFIG.PIXEL_RATIO, CONFIG.PIXEL_RATIO);
    this.ground.scrollFactorX = 0.0000125; /// WTF ??? Layer seems to have double x scroll speed
    this.ground.y = this.stage.groundY;

    console.log('Ground real size       : ' + this.ground.width + '/' + this.ground.height);

    this.drawGround();
  },

  drawGround: function () {
    for (var i = 0; i < CONFIG.WORLD_WIDTH; i++) {
			for(var j = 0; j < this.stage.groundHeight; j++) {
				var rowOffset = CONFIG.WORLD_HEIGHT - (this.stage.groundHeight + this.stage.scrollCounter) + j;
				if (rowOffset < 0) {
					rowOffset += CONFIG.WORLD_HEIGHT;
				}
				this.map.putTile(this.stage.terrainData[i][rowOffset], i, j, this.ground);
			}
		}
  }
}
