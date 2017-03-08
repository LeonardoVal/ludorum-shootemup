/*globals CONFIG */

/************************************************************************************************
 * TURRET CLASS
 *
 * A specific type of (ground) Enemy
 *
 ************************************************************************************************/

function Turret(stage) {
	// Call parent constructor
	exports.Enemy.call(this, stage);
}

Turret.prototype = Object.create(exports.Enemy.prototype);
Turret.prototype.constructor = Turret;

Turret.prototype.image = 'mob_turret_1';
Turret.prototype.maxHealth = 150;
Turret.prototype.speed = 0;
Turret.prototype.isPinnedToGround = true;
Turret.prototype.bulletType = 1;
Turret.prototype.shootDelay = 5000;
Turret.prototype.points = 5000;
Turret.prototype.lootProbability = 0.5;

Turret.prototype.shootConfig = {
	bulletType: 1,
	nBullets: 4,
	bulletDelay: 0,
	bulletAngle: 0,
	bulletSpread: 0,
	nShoots: 3,
	shootDelay: 50,
	shootAngle: 0,
	shootRotationSpeed: 0.1
};

// TODO agregar a esta funcion comportamiento para animaciones. Si eso no es necesario puede borrarse esta funcion
Turret.prototype.shoot = function(shootConfig) {

	// this.play('pre-shoot');

	// Call the parent shoot function
	exports.Enemy.prototype.shoot.call(this, shootConfig);
};

// TODO sacar esta funcion? o sacar el else en Enemy.revive
Turret.prototype.revive = function (i, j) {

	// this.reset(
	// 	(i + 0.5) * 24 * CONFIG.PIXEL_RATIO,
	// 	((j + 0.5) - CONFIG.WORLD_SWAP_HEIGHT) * 28 * CONFIG.PIXEL_RATIO
	// 	);
	//
	// this.body.velocity.y = this.stage.scrollSpeed * CONFIG.PIXEL_RATIO;
	//
	// this.nextShotAt = this.game.rnd.integerInRange(0, this.shootDelay);

	// Call the parent revive function
	exports.Enemy.prototype.revive.call(this);
};

function animationStuff() {
	var animations = this.sprite.animations;

	var preshoot = animations.add('pre-shoot', [0, 1, 2, 3, 4, 5, 6, 7, 8], 15, false);

	// preshoot.onStart.add(animationStarted, this);
	preshoot.onComplete.add(function (sprite) {

		// Call the parent shoot function
		exports.Enemy.prototype.shoot.call(this, this.shootConfig);

		sprite.play('shoot');
	}, this.sprite);

	var shoot = animations.add('shoot', [8, 7, 6, 5, 4, 3, 2, 1, 0], 15, false);
	shoot.onComplete.add(function (sprite) {

		sprite.play('idle');
	}, this.sprite);

	animations.add('idle', [0], 5, true);
	// animations.add('pre-shoot', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, true);
	// animations.add('shoot', [8, 7, 6, 5, 4, 3, 2, 1, 0], 10, true);
	this.sprite.play('idle');
}

exports.Turret = Turret;
