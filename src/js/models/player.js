/*globals CONFIG */

/************************************************************************************************
 * PLAYER CLASS
 *
 * Like a Mob, plus :
 *   - handles user inputs
 *   - can move with inertia
 *   - can fire (and has its own bullet pool)
 *
 ************************************************************************************************/

function Player(stage){
	exports.Mob.call(this, stage);

	this.faction = "Player";
	// this.playerClass = Math.floor(Math.random()*4+1); // FIXME remove randomness
	this.playerClass = 1;
	var config = CONFIG.CLASS_STATS[this.playerClass - 1]
	this.playerStats = {
		className: config.className,
		health: config.health,
		strength: config.strength,
		rate: config.rate,
		speed: config.speed,
		accel: config.accel,
	};
	this.hitbox = { width: 7, height: 7, offsetX: 0, offsetY: 3 };
	this.setInitialPosition();
	this.queueAnimation("idle");

	this.score = 0;
	this.health = this.playerStats.health;
	this.calculateStats();
	this.nextShotDelay = 0;
	this.lastUpdate = 0;
	this.exists = true;
	this.visible = true;
	// PLAYER BULLETS
	this.createBulletPool();
}

Player.prototype = Object.create(exports.Mob.prototype);
Player.prototype.constructor = Player;

Player.prototype.animations = [];

Player.prototype.addAnimation('left_full', [ 0 ], 5, true);
Player.prototype.addAnimation('left', [ 1 ], 5, true);
Player.prototype.addAnimation('idle', [ 2 ], 5, true);
Player.prototype.addAnimation('right', [ 3 ], 5, true);
Player.prototype.addAnimation('right_full', [ 4 ], 5, true);

Player.prototype.setInitialPosition = function() {
	this.position[0] = this.stage.width / 2;
	this.position[1] = this.stage.height / 4 * 3;
};

Player.prototype.updateLogic = function(delta, input) {
	// Call the parent update function
	exports.Mob.prototype.updateLogic.call(this, delta);
	this.updateFromInput(delta, input);
	this.updateAnimation();
	this.updateBullets();
};

Player.prototype.calculateStats = function () {
	this.speed = this.playerStats.speed * CONFIG.PIXEL_RATIO;
	this.accel = this.speed * this.playerStats.accel;
	this.strength = this.playerStats.strength;
	this.shootDelay = 1000 / this.playerStats.rate;
};

Player.prototype.updateFromInput = function (delta, input) {
	var isDown = input;
	// Move (horizontal)
	if (isDown.left && this.position[0] > 20 * CONFIG.PIXEL_RATIO) {
		this.moveLeft(delta);
	} else if (isDown.right && this.position[0] < (CONFIG.WORLD_WIDTH * 24 - 20) * CONFIG.PIXEL_RATIO) {
		this.moveRight(delta);
	} else {
		this.floatH(delta);
	}
	// Move (vertical)
	if (isDown.up && this.position[1] > 30 * CONFIG.PIXEL_RATIO) {
		this.moveUp(delta);
	} else if (isDown.down && this.position[1] < (CONFIG.GAME_HEIGHT - 20) * CONFIG.PIXEL_RATIO) {
		this.moveDown(delta);
	} else {
		this.floatV(delta);
	}
	// Fire
	this.nextShotDelay -= delta;
	if (isDown.w) {
		this.firing = true;
		this.fire(delta);
	} else {
		this.firing = false;
		if (this.nextShotDelay < 0){
			this.nextShotDelay = 0;
		}
	}
};

Player.prototype.updateAnimation = function () {
	var spd = this.velocity[0];
	if (spd < - this.speed / 4 * 3) {
		this.queueAnimation('left_full');
	} else if (spd > this.speed / 4 * 3) {
		this.queueAnimation('right_full');
	} else if (spd < - this.speed / 5) {
		this.queueAnimation('left');
	} else if (spd > this.speed / 5) {
		this.queueAnimation('right');
	} else {
		this.queueAnimation('idle');
	}
};

Player.prototype.moveLeft = function (delta) {
	this.velocity[0] -= this.accel * delta;
	if (this.velocity[0] < -this.speed) {
		this.velocity[0] = -this.speed;
	}
};

Player.prototype.moveRight = function (delta) {
	this.velocity[0] += this.accel * delta;
	if (this.velocity[0] > this.speed) {
		this.velocity[0] = this.speed;
	}
};

Player.prototype.moveUp = function (delta) {
	this.velocity[1] -= this.accel * delta;
	if (this.velocity[1] < - this.speed) {
		this.velocity[1] = - this.speed;
	}
};

Player.prototype.moveDown = function (delta) {
	this.velocity[1] += this.accel * delta;
	if (this.velocity[1] > this.speed) {
		this.velocity[1] = this.speed;
	}
};

Player.prototype.floatH = function (delta) {
	if (this.velocity[0] > 0) {
		this.velocity[0] -= this.accel * delta;
		if (this.velocity[0] < 0) {
			this.velocity[0] = 0;
		}
	} else {
		this.velocity[0] += this.accel * delta;
		if (this.velocity[0] > 0) {
			this.velocity[0] = 0;
		}
	}
};

Player.prototype.floatV = function (delta) {
	if (this.velocity[1] > 0) {
		this.velocity[1] -= this.accel * delta;
		if (this.velocity[1] < 0) {
			this.velocity[1] = 0;
		}
	} else {
		this.velocity[1] += this.accel * delta;
		if (this.velocity[1] > 0) {
			this.velocity[1] = 0;
		}
	}
};

Player.prototype.fire = function(){
	// OLD: if player.alive
	if (this.nextShotDelay > 0) {
		return;
	}
	// TODO: Confirmar que es el DPS sea constante con el calculo de abajo
	// y que no dependa de que delta random que decidio poner js
	this.nextShotDelay = this.shootDelay + this.nextShotDelay;
	var bullet = this.bulletPool.find(function(bullet) { return bullet.exists === false });
	this.stage.world.addBody(bullet);
	bullet.alive = true;
	bullet.exists = true;
	bullet.visible = true;
	bullet.position[0] = this.position[0];
	bullet.position[1] = this.position[1] - 20;
	bullet.velocity[1] = -500 * CONFIG.PIXEL_RATIO;
	bullet.shooter = this;

	// --
	// TODO in calculateBulletAnim instead !!!
	var f, s = this.strength;
	if (s < 100 ) { f = 1; }
		else if (s < 120 ) { f = 2; }
		else if (s < 140 ) { f = 3; }
		else if (s < 160 ) { f = 4; }
		else { f = 5; }
	this.firingSound = f;
	this.playSound = true;
};

Player.prototype.createBulletPool = function(){
	// TODO move this pool to stage
	this.bulletPool = [];
	for(var i = 0; i < 100; i++){
		var bullet = new Bullet(this.stage);
		bullet.alive = false;
		bullet.exists = false;
		bullet.visible = false;
		bullet.faction = "PlayerBullet";
		this.bulletPool.push(bullet);
	}
	this.calculateBulletAnim();
};

Player.prototype.updateBullets = function() {
	// PLAYER BULLETS
	// (dunno why some hi-speed bullets stay alive outside of the screen / world)
	this.bulletPool.filter(function(bullet){return bullet.alive || bullet.exists;}).forEach(function (bullet) {
		if (bullet.position[1] < -200) {
			bullet.die();
		}
	});
};

Player.prototype.calculateBulletAnim = function() {
	var s = this.strength, f;
	if (s < 100 ) { f = 0; }
		else if (s < 120 ) { f = 1; }
		else if (s < 160 ) { f = 2; }
		else { f = 3; }
	this.bulletPool.forEach(function(bullet){
		bullet.frame = f;
		bullet.queueAnimation('idle');
	});
};

Player.prototype.collectUpgrade = function(upgrade){
	// TODO : relative upgrades
	// var nSteps = 7; // Number of upgrades needed for max level
	// var maxFactor = 2; // How many times the base (read class) level
	// var nParts = 0;
	// for (var i = 1; i < nSteps; i++) {
	// 	nParts += i;
	// };
	// var strengthPart = this.classStats.strength * (maxFactor - 1);
	//

	if (upgrade === CONFIG.BONUS_CLASSES.STRENGTH) {
		this.playerStats.strength += 10;
	} else if (upgrade === CONFIG.BONUS_CLASSES.RATE) {
		this.playerStats.rate += 1;
	} else if (upgrade === CONFIG.BONUS_CLASSES.SPEED) {
		this.playerStats.speed += 10;
	} else {
		this.playerStats.accel += 1;
	}
	this.calculateStats();
	this.calculateBulletAnim();
	// this.state.sound['collect_1'].play(); FIXME
};


// Export the object
exports.Player = Player;
