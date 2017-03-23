/*globals CONFIG */

/************************************************************************************************
 * COLLECTIBLE CLASS
 *
 * Can be picked
 *
 ************************************************************************************************/

function Collectible(stage, image) {

	// Call parent constructor
	exports.Actor.call(this, stage);
	this.image = image;
	this.faction = "Bonus";
	this.bonusClass = Math.floor(Math.random() * (3 - 0 + 1) + 0);
	//this.updateClass(); FIXME
}

Collectible.prototype = Object.create(exports.Actor.prototype);
Collectible.prototype.constructor = Collectible;

Collectible.prototype.updateLogic = function (delta) {

	// Call parent update function
	exports.Actor.prototype.updateLogic.call(this, delta);

	// Kill mob if below the screen
	if (this.position[1] > CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO + 200) {
		this.die();
	}
};

Collectible.prototype.updateClass = function () {

	// Ugly hack to skip the last spritesheet row (4 instead of 3)
	var fakeClass = this.bonusClass;
	if (fakeClass === 3) { fakeClass = 4; }

	var offset = fakeClass * 3;

	this.sprite.animations.add('idle', [0 + offset, 1 + offset, 2 + offset, 1 + offset], 15, true);
	this.sprite.play('idle');
};

Collectible.prototype.die = function () {
	this.stage.world.removeBody(this);
	this.alive = false;
	this.exists = false;
	this.visible = false;
};

// Export the object
exports.Collectible = Collectible;
