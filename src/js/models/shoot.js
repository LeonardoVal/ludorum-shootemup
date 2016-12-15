/*globals*/
/*jshint -W083 */

/************************************************************************************************
 * SHOOT CLASS
 *
 * One enemy shoot, firing one or several salve of one or several Bullets, all at once or one-by-one
 *
 *
 ************************************************************************************************/

function Shoot(stage, shooter, shootConfig) {
	this.stage = stage;
	this.shooter = shooter;
	this.shootConfig = shootConfig;
	// this.nBulletsAlive = shootConfig.nBullets;
	this.currentTime = 0; // TODO ver si vale la pena usar director.elapsedTime en lugar de guardar currentTime
	this.bullets = [];
	this.actions = [];
	this.actionTimers = [];
	for (var j = 0; j < shootConfig.nShoots; j++) {
		// bulletDelay: 0,
		// bulletAngle: 0,
		// shootRotationSpeed: 0.2
		this.actions[j] = (function(that, x) { return function() {	// Closure
			var config = that.shootConfig;
			// Shoot angle
			var shootAngle;
			if (config.shootAngle === 999) {	// Auto-aim player
				shootAngle = that.shooter.getAngleTo(that.stage.player);
			} else if (config.shootAngle === -999) {	// Random aim
				shootAngle = Math.random() * 2 * Math.PI;
			} else {
				shootAngle = config.shootAngle;
			}
			// Shoot rotation speed
			shootAngle += x * config.shootRotationSpeed;
			// Bullets spread
			var bulletAngleStep = 0;
			if (config.nBullets > 1) {
				if (config.bulletSpread === 0) { // This is the "auto-pan" at 360° special mode
					bulletAngleStep = 2 * Math.PI / config.nBullets;
				} else {
					bulletAngleStep = config.bulletSpread;
				}
			}
			// One salve
			for (var i = 0; i < config.nBullets; i++) {
				var deadBullet = that.stage.enemyBulletPools[config.bulletType].find(function(b){return !b.alive});
				if (deadBullet) {
					that.bullets[i] = deadBullet;
					// Homing bullet LOL --> this.state.physics.arcade.moveToObject(bullet, this.stage.player, this.bulletSpeed * CONFIG.PIXEL_RATIO);
					var angle;
					if (config.bulletSpread === 0) {
						angle = shootAngle + (i * bulletAngleStep);
					} else {
						angle = shootAngle + ((i - (config.nBullets - 1) / 2) * bulletAngleStep);
					}
					if (angle < 0 || angle >= 2 * Math.PI) {
						angle = angle % (2 * Math.PI);
					}
					that.bullets[i].revive(shooter, angle);
				}
			}
		}; })(this, j);
		this.actionTimers[j] = j * shootConfig.shootDelay;
	}
}

Shoot.prototype.updateLogic = function(delta){
	// TODO ver si hay una forma mas eficiente de hacer esto
	// Antes, se usaba setTimeout que era mucho mas eficiente pero un poco impredecible
	this.currentTime += delta;
	for (var j = 0; j < this.shootConfig.nShoots; j++) {
		if (this.currentTime > this.actionTimers[j]){
			if (this.actions[j]){
				this.actions[j]();
				this.actions[j] = null;
			}
		}
	}
};

Shoot.prototype.die = function(bulletCancel) {
	// Bullet cancel : kill all bullets of the shoot
	if (bulletCancel) {
		this.bullets.forEach(function(bullet) {
			bullet.die();
		});
	}
	// Cancel all running timers
	this.actions = [];
};

// Export the object
exports.Shoot = Shoot;
