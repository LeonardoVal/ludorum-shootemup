/*globals CONFIG */

/************************************************************************************************
 * COLLECTIBLE CLASS
 *
 * Can be picked
 *
 ************************************************************************************************/

function Collectible(state, image) {

	// Call parent constructor
	exports.Actor.call(this, state, image);

	this.alive = true;
	this.updateClass();
}

Collectible.prototype = Object.create(exports.Actor.prototype);
Collectible.prototype.constructor = Collectible;

Collectible.prototype.update = function () {

	// Call parent update function
	exports.Actor.prototype.update.call(this);

	// Kill mob if below the screen
	if (this.position[1] > CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO + 200) {
		this.kill();
		return;
	}
};

Collectible.prototype.updateClass = function () {

	this.bonusClass = this.state.rnd.integerInRange(0, 3);

	// Ugly hack to skip the last spritesheet row (4 instead of 3)
	var fakeClass = this.bonusClass;
	if (fakeClass === 3) { fakeClass = 4; }

	var offset = fakeClass * 3;

	this.sprite.animations.add('idle', [0 + offset, 1 + offset, 2 + offset, 1 + offset], 15, true);
	this.sprite.play('idle');
};


// Export the object
exports.Collectible = Collectible;
