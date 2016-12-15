/*globals CONFIG */

 /************************************************************************************************
 * BULLET CLASS
 *
 * Just one single enemy bullet
 *
 *
 ************************************************************************************************/

function Bullet(stage, type) {
	// Call parent constructor
	GameObject.call(this);
	this.stage = stage;
	if (type !== undefined){
		this.image = 'mob_bullet_' + (type + 1);
	}
	this.energy = 30;
	this.speed = 120;
	this.shooter = undefined; // Por ahora esta en el pool; nadie la disparo
}

Bullet.prototype = Object.create(GameObject.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.revive = function(shooter, angle){
	this.alive = true;
	this.exists = true;
	this.visible = true;
	this.x = shooter.x;
	this.y = shooter.y;
	this.shooter = shooter;
	this.vx = this.speed * Math.sin(angle) * CONFIG.PIXEL_RATIO;
	this.vy = this.speed * Math.cos(angle) * CONFIG.PIXEL_RATIO;
};

Bullet.prototype.updateLogic = function(delta){
	this.updatePosition(delta);
	// Kill bullet if out of the screen
	if (this.stage.outOfBounds(this.x, this.y)){
		this.die();
	}
};

Bullet.prototype.die = function () {
	this.alive = false;
	this.exists = false;
	this.visible = false;
};

// Export the object
exports.Bullet = Bullet;
