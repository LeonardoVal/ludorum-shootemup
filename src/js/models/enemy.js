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
Enemy.prototype.bulletCancel = false;
Enemy.prototype.shootConfig = {};
Enemy.prototype.getBulletPool = function() {
	return this.stage.pools.enemyBullets.small;
};

Enemy.prototype.updateLogic = function(delta){
	// Call the parent update function
	exports.Mob.prototype.updateLogic.call(this, delta);
	this.shoots.forEach(function(shoot) {
		// FIXME creo que al estar esto dentro de enemy,
		// si ese mismo objeto enemigo del pool muere y revive podrian quedar balas (o shoots) congeladas
		shoot.updateLogic(delta);
	});
	// Mob shoot
	// TODO al igual que para player.fire, ver si esta logica esta bien
	var isTimeToShoot = (this.nextShotDelay -= delta) <= 0;
	if (!isTimeToShoot) return;
	var canShoot =
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
	if (this.spawnInfo.bonusClass != null) {
		this.loot(this.spawnInfo.bonusClass);
	}
	// Explosion sound
	var s = this.maxHealth, f;
	if (s < 80) { f = 1; }
	else if (s < 200) { f = 2; }
	else if (s < 500) { f = 3; }
	else { f = 4; }
	// FIXME this.game.sound['explosion_' + f].play();
};

Enemy.prototype.revive = function (info) {
	this.spawnInfo = info || {};

	this.position[0] = info.x;
	this.position[1] = -32;
	this.velocity[1] = (this.speed + this.stage.scrollSpeed) * CONFIG.PIXEL_RATIO;

	this.nextShotDelay = this.shootDelay;
	// Call the parent revive function
	exports.Mob.prototype.revive.call(this);
};

Enemy.prototype.loot = function(bonusClass) {
	var bonus = this.stage.pools.bonus.find(function(bonus){return !bonus.exists}) // Bonus pool
	if (!bonus) {return}
	bonus.revive(bonusClass)
	//bonus.updateClass();
	bonus.position[0] = this.position[0];
	bonus.position[1] = this.position[1];
	bonus.velocity[1] = (this.stage.scrollSpeed) * CONFIG.PIXEL_RATIO;
	//bonus.body.angularVelocity = 30;
};


// Export the object
exports.Enemy = Enemy;
