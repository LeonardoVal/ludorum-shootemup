/*globals*/

/************************************************************************************************
 * PLANE CLASS
 *
 * A specific type of Enemy
 *
 ************************************************************************************************/

function Plane(stage) {
	// Call parent constructor
	exports.Enemy.call(this, stage);
	// random int between 0 and 7
	this.planeClass = Math.floor(Math.random() * (7 - 0 + 1) + 0);
	this.queueAnimation('idle'+this.planeClass);
	this.removeShape(this.shape);
	this.shape = new p2.Convex({ vertices: [[0,50], [-25,0], [25,0]]});
	this.shape.sensor = true;
	this.addShape(this.shape);
}

Plane.prototype = Object.create(exports.Enemy.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.image = 'mob_plane';
Plane.prototype.maxHealth = 30;
Plane.prototype.speed = 60;
Plane.prototype.shootDelay = 500;
Plane.prototype.bulletSpeed = 125;
Plane.prototype.points = 100;
Plane.prototype.shootConfig = {
	bulletType: 0,
	nBullets: 1,
	bulletDelay: 0,
	bulletAngle: 0,
	bulletSpread: 0,
	nShoots: 1,
	shootDelay: 0,
	shootAngle: 999,
	shootRotationSpeed: 0
};

Plane.prototype.animations = [];
for (var i = 0; i < 8; i++){
	var offset = i*3;
	Plane.prototype.addAnimation('left'+i, [offset + 0], 5, true);
	Plane.prototype.addAnimation('idle'+i, [offset + 1], 5, true);
	Plane.prototype.addAnimation('right'+i, [offset + 2], 5, true);
}


/************************************************************************************************
 * VESSEL CLASS
 *
 * A specific type of (big) Enemy
 *
 ************************************************************************************************/

function Vessel(stage) {
	// Call parent constructor
	exports.Enemy.call(this, stage)
	this.queueAnimation('idle');
	this.removeShape(this.shape);
	this.shape = new p2.Convex({ vertices: [[0,50], [-30,0], [30,0]]});
	this.shape.sensor = true;
	this.addShape(this.shape);
}

Vessel.prototype = Object.create(exports.Enemy.prototype);
Vessel.prototype.constructor = Vessel;

Vessel.prototype.image = 'mob_vessel_1';
Vessel.prototype.maxHealth = 100;
Vessel.prototype.speed = 30;
Vessel.prototype.shootDelay = 1000;
Vessel.prototype.points = 500;
Vessel.prototype.shootConfig = {
	bulletType: 0,
	nBullets: 5,
	bulletDelay: 0,
	bulletAngle: 0,
	bulletSpread: 0.2,
	nShoots: 1,
	shootDelay: 0,
	shootAngle: 999,
	shootRotationSpeed: 0
};

Vessel.prototype.animations = [];
Vessel.prototype.addAnimation('idle', [0], 5, true);


/************************************************************************************************
 * FLAGSHIP CLASS
 *
 * A specific type of (huge) Enemy
 *
 ************************************************************************************************/

function Flagship(stage) {
	// Call parent constructor
	exports.Enemy.call(this, stage)
	this.queueAnimation('idle');
	this.removeShape(this.shape);
	this.shape = new p2.Convex({ vertices: [[0,50], [-70,0], [70,0]]});
	this.shape.sensor = true;
	this.addShape(this.shape);
}

Flagship.prototype = Object.create(exports.Enemy.prototype);
Flagship.prototype.constructor = Flagship;

Flagship.prototype.image = 'mob_flagship_1';
Flagship.prototype.maxHealth = 300;
Flagship.prototype.speed = 10;
Flagship.prototype.shootDelay = 2000;
Flagship.prototype.points = 2000;
Flagship.prototype.bulletCancel = true;
Flagship.prototype.shootConfig = {
	bulletType: 1,
	nBullets: 7,
	bulletDelay: 0,
	bulletAngle: 0,
	bulletSpread: 0.2,
	nShoots: 3,
	shootDelay: 500,
	shootAngle: 0,
	shootRotationSpeed: 0.2
};

Flagship.prototype.animations = [];
Flagship.prototype.addAnimation('idle', [0], 5, true);


// Export the objects
exports.Plane = Plane;
exports.Vessel = Vessel;
exports.Flagship = Flagship;
