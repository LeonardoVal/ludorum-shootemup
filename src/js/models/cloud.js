/*globals CONFIG */

/************************************************************************************************
 * CLOUD CLASS
 *
 * A specific type of (ground) Enemy
 *
 ************************************************************************************************/

function Cloud(state) {

	// Call parent constructor
	exports.Mob.call(this, state, 'clouds');

	this.speed = 0;
	this.type = 0;
	var animations = this.sprite.animations;
  animations.add('idle_0', [0]);
  animations.add('idle_1', [1]);
  animations.add('idle_2', [2]);
  animations.add('idle_3', [3]);
  animations.add('idle_4', [4]);
  animations.add('idle_5', [5]);
  animations.add('idle_6', [6]);
  animations.add('idle_7', [7]);
}

Cloud.prototype = Object.create(exports.Mob.prototype);
Cloud.prototype.constructor = Cloud;

Cloud.prototype.update = function () {

	// Call the parent update function
	exports.Mob.prototype.update.call(this);
};

Cloud.prototype.revive = function () {

	this.reset(
		this.game.rnd.integerInRange(0, CONFIG.WORLD_WIDTH) * 24 * CONFIG.PIXEL_RATIO,
		- 3 * 28 * CONFIG.PIXEL_RATIO
		);

	this.body.velocity.y = (this.game.rnd.realInRange(- 1, 1) * CONFIG.CLOUD_WIND_SPEED + CONFIG.CLOUD_WIND_SPEED + this.stage.scrollSpeed) * CONFIG.PIXEL_RATIO;

	this.type = this.game.rnd.integerInRange(0, 7);
	this.play('idle_' + this.type);

	// Call the parent revive function
	exports.Mob.prototype.revive.call(this);
};


// Export the object
exports.Cloud = Cloud;
