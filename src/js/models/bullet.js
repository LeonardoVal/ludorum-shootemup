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
	this.faction = "EnemyBullet";
	this.energy = 30;
	this.speed = 120;
	this.shooter = undefined; // Por ahora esta en el pool; nadie la disparo
}

Bullet.prototype = Object.create(GameObject.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.revive = function(shooter, angle){
	this.alive = true;
	this.stage.world.addBody(this);
	this.exists = true;
	this.visible = true;
	this.position[0] = shooter.position[0];
	this.position[1] = shooter.position[1];
	this.shooter = shooter;
	this.velocity[0] = this.speed * Math.sin(angle) * CONFIG.PIXEL_RATIO;
	this.velocity[1] = this.speed * Math.cos(angle) * CONFIG.PIXEL_RATIO;
};

Bullet.prototype.updateLogic = function(delta){
	// Kill bullet if out of the screen
	if (this.stage.outOfBounds(this.position[0], this.position[1])){
		this.die();
	}
};

Bullet.prototype.die = function () {
	this.stage.world.removeBody(this);
	this.alive = false;
	this.exists = false;
	this.visible = false;
};

// Export the object
exports.Bullet = Bullet;
