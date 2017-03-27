/*globals CONFIG */

/************************************************************************************************
 * ENEMY CLASS
 *
 * Like Mob, plus can shoot and loot bonuses
 *
 ************************************************************************************************/

function Enemy(stage) {
	// Call parent constructor
	exports.Mob.call(this, stage);
	this.faction = "Enemy"
	this.shoots = [];
}

Enemy.prototype = Object.create(exports.Mob.prototype);
Enemy.prototype.constructor = Enemy;

// Default values
Enemy.prototype.speed = 50;
Enemy.prototype.shootDelay = 1000;
Enemy.prototype.bulletSpeed = 100;
Enemy.prototype.points = 100;
Enemy.prototype.lootProbability = 0.2;
Enemy.prototype.bulletCancel = false;
Enemy.prototype.lootType = 1;
Enemy.prototype.shootConfig = {};
Enemy.prototype.getBulletPool = function() {
	return this.stage.pools.enemyBullets.small;
};

Enemy.prototype.updateLogic = function(delta){
	// Call the parent update function
	exports.Mob.prototype.updateLogic.call(this, delta);
	this.shoots.forEach(function(shoot) {
		shoot.updateLogic(delta);
	});
	// Mob shoot
	// TODO al igual que para player.fire, ver si esta logica esta bien
	var isTimeToShoot = (this.nextShotDelay -= delta) <= 0;
	if (!isTimeToShoot) return;
	var canShoot =
		this.alive && 	// Enemy is alive
		this.stage.player.alive && 	// Player is alive
		this.position[1] < this.stage.player.position[1] - 100 * CONFIG.PIXEL_RATIO && // Enemy above player
		this.getBulletPool().find(function(bullet){return !bullet.alive}); // Bullets in pool
	if (canShoot){
		this.shoot(this.shootConfig);
	} else {
		this.nextShotDelay = 0;
	}
};

Enemy.prototype.shoot = function (shootConfig) {
	this.shoots.push(new exports.Shoot(this.stage, this, shootConfig));
	this.nextShotDelay = this.shootDelay + this.nextShotDelay;
};

Enemy.prototype.die = function () {
	// Call the parent die function
	exports.Mob.prototype.die.call(this);
	// Cancel planned shoots
	var bulletCancel = this.bulletCancel;
	this.shoots.forEach(function(shoot) {
		shoot.die(bulletCancel);
	});
	// Loot things
	if (Math.random() < this.lootProbability) {
		this.loot(this.lootType);
	}
	// Explosion sound
	var s = this.maxHealth, f;
	if (s < 80 ) { f = 1; }
		else if (s < 200 ) { f = 2; }
		else if (s < 500 ) { f = 3; }
		else { f = 4; }
	// FIXME this.game.sound['explosion_' + f].play();
};

Enemy.prototype.revive = function (x) {
	this.position[0] = x;
	this.position[1] = -32;
	this.velocity[1] = (this.speed + this.stage.scrollSpeed) * CONFIG.PIXEL_RATIO;

	var min = 0;
	var max = this.shootDelay;
	// random int between min and max
	this.nextShotDelay = Math.floor(Math.random() * (max - min + 1) + min); // FIXME remove randomness
	// Call the parent revive function
	exports.Mob.prototype.revive.call(this);
};

Enemy.prototype.loot = function(type) {
	var bonus = this.stage.pools.bonus.find(function(bonus){return !bonus.exists}) // Bonus pool
	if (!bonus) {return}
	bonus.exists = true;
	bonus.alive = true;
	bonus.visible = true;
	this.stage.world.addBody(bonus);
	//bonus.updateClass();
	bonus.position[0] = this.position[0];
	bonus.position[1] = this.position[1]
	bonus.velocity[1] = (this.stage.scrollSpeed) * CONFIG.PIXEL_RATIO;
	//bonus.body.angularVelocity = 30;
	//type = type; // FIXME
};


// Export the object
exports.Enemy = Enemy;
