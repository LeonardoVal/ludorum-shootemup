/*globals CONFIG */

/************************************************************************************************
 * MOB CLASS
 *
 * Have health, can take damage and die
 * Dies if below the screen
 * Parent of both player and enemies
 *
 ************************************************************************************************/

function Mob(stage) {
	// Call parent constructor
	Actor.call(this, stage);
	// Mob properties
	this.alive = true;
	this.health = 100;
	this.maxHealth = this.health;
	this.isDamaged = false;
	this.damageBlinkDuration = 0;
	this.tint = 0xffffff;
}

Mob.prototype = Object.create(Actor.prototype);
Mob.prototype.constructor = Mob;

Mob.prototype.updateLogic = function(delta) {
	Actor.prototype.updateLogic.call(this, delta);
	// Kill mob if outside stage
	if (this.stage.isBelowScreen(this.y)) {
		this.die();
		return;
	}
	this.updateTint(delta);
};

Mob.prototype.updateTint = function(delta){
	// Mob hit
	if (this.isDamaged){
		this.damageBlinkDuration -= delta;
		if (this.damageBlinkDuration < 0) {
			this.isDamaged = false;
		}
	}
	if (this.isDamaged){
		this.tint = 0xff0000;
	} else {
		this.tint = 0xffffff;
	}
};

Mob.prototype.takeDamage = function (damage) {
	this.health -= damage;
	if (this.health <= 0) {
		this.die();
	} else {
		this.blink();
	}
};

Mob.prototype.blink = function () {
	this.isDamaged = true;
	this.damageBlinkDuration = 250; // 0.25 seconds
};

Mob.prototype.revive = function () {
	this.health = this.maxHealth;
	this.alive = true;
	this.exists = true;
	this.visible = true;
	this.isDamaged = false;
};

Mob.prototype.die = function () {
	this.health = 0;
	this.alive = false;
	this.exists = false;
	this.visible = false;
	this.isDamaged = false;
};


// Export the object
exports.Mob = Mob;
