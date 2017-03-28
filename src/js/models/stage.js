function Stage() {
	this.world = new p2.World();
	this.world.applyGravity = false;
	this.player = null;
	this.pools = {};
	this.scrollSpeed = CONFIG.SCROLL_SPEED;
	this.width = CONFIG.GAME_WIDTH * CONFIG.PIXEL_RATIO;
	this.height = CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO;
}

// TODO: Make getBonus(), getPlane(), getSomething() para poder usar en lugar de pool.find((x) => (!x.alive))

Stage.prototype = {
	newGroup: function(){
		var result = [];
		result.add = result.push;
		return result;
	},

	isBelowScreen: function isBelowScreen(y){
	  return y > CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO + 200;
	},

	outOfBounds: function outOfBounds(x, y){
		var safeRange = 20;
	  return (x < - safeRange * CONFIG.PIXEL_RATIO ||
	    x > (CONFIG.WORLD_WIDTH * 24 + safeRange) * CONFIG.PIXEL_RATIO ||
	    y < - safeRange * CONFIG.PIXEL_RATIO ||
	    y > (CONFIG.GAME_HEIGHT + safeRange) * CONFIG.PIXEL_RATIO);
	},

	createAll: function(){
		this.createGround();
		this.createEnemies();
		this.createBonuses();
		this.createPlayer();
		// this.createClouds();
	},

	createPlayer: function(){
		this.player = new exports.Player(this);
		this.world.addBody(this.player);
	},

	createEnemies: function () {
		function fillGroup(className, amount, param){
			var group = this.newGroup();
			for (var i = 0; i < amount; i++) {
				var entity = new exports[className](this, param);
				group.add(entity);
				entity.alive = false;
				entity.exists = false;
				entity.visible = false;
			}
			return group;
		}
		var fillGroupTied = fillGroup.bind(this);

		// MOB BULLETS
		this.pools.enemyBullets = {
			small: fillGroupTied("Bullet", CONFIG.BULLETPOOL_SIZE_ENNEMY, 0),
			medium: fillGroupTied("Bullet", CONFIG.BULLETPOOL_SIZE_ENNEMY, 1),
		};
		// GROUND ENEMIES
		this.pools.groundEnemies = {
			turret: fillGroupTied("Turret", CONFIG.MOBPOOL_SIZE),
		};
		// FLYING ENEMIES
		this.pools.flyingEnemies = {
			plane: fillGroupTied("Plane", CONFIG.MOBPOOL_SIZE),
			vessel: fillGroupTied("Vessel", CONFIG.MOBPOOL_SIZE),
			flagship: fillGroupTied("Flagship", CONFIG.MOBPOOL_SIZE),
		};

		// TODO move this away
		var planes = this.pools.flyingEnemies.plane;
		var turrets = this.pools.groundEnemies.turret;

		this.lastSpawn = 0;
		this.enemySpawns = [
			{ time: 200, pool: planes, x: this.width * 0.1 },
			{ time: 500, pool: planes, x: this.width * 0.2 },
			{ time: 800, pool: turrets, x: this.width * 0.3 },
			{ time: 1100, pool: planes, x: this.width * 0.4 },
			{ time: 200, pool: planes, x: this.width * 0.9 },
			{ time: 500, pool: planes, x: this.width * 0.8 },
			{ time: 800, pool: turrets, x: this.width * 0.7 },
			{ time: 1100, pool: planes, x: this.width * 0.6 },
			{ time: 1400, pool: turrets, x: this.width * 0.5 },
		].sort(function(a, b) {
			return a.time - b.time;
		});
		this.endTime = 10 * 1000;
	},

	createBonuses: function(){
		this.pools.bonus = this.newGroup();
		for (var i = 0; i < CONFIG.BONUSPOOL_SIZE; i++) {
			var o = new exports.Collectible(this, 'bonus_cube');
			this.pools.bonus.add(o);
			o.exists = false;
			o.alive = false;
			o.visible = false;
		}
	},

	createClouds: function() {
		this.clouds = this.newGroup();

		for (var i = 0; i < CONFIG.CLOUDPOOL_SIZE; i++) {
			var o = new exports.Cloud(this.state);
			this.clouds.add(o.sprite);
			o.sprite.exists = false;
			o.sprite.alive = false;
		}

		this.nextCloudAt = 0;
		this.cloudDelay = 1000;
	},

	createGround: function () {
		//  Creates a new blank layer and sets the map dimensions.
		this.groundWidth = CONFIG.WORLD_WIDTH;
		this.groundHeight = Math.round(CONFIG.GAME_HEIGHT / 28) + 1 + CONFIG.WORLD_SWAP_HEIGHT;

		console.log('Ground logic size      : ' + this.groundWidth + '/' + this.groundHeight);

		// this.scrollMax = Math.round((this.ground.height - this.game.camera.height) / 28) * 28;
		this.scrollMax = CONFIG.WORLD_SWAP_HEIGHT * CONFIG.PIXEL_RATIO * 28 - 1;
		this.groundY = -this.scrollMax;

		this.terrainData = this.generateTerrain();
		this.scrollCounter = 0;
	},

	generateTerrain: function () {
		if (CONFIG.LEGACY_GENERATOR){
			return oldTerrainGenerator();
		} else {
			var sizeX = CONFIG.WORLD_WIDTH + 1;
			var sizeY = CONFIG.WORLD_HEIGHT + 1;

			var map = [];
			var i,j,k;

			var TILE = {
				FORREST: 		6,
				EARTH: 			6 + 15 * 1,
				WATER: 			6 + 15 * 2,
				DEEPWATER: 	6 + 15 * 3
			};

			for (i = 0; i < sizeX - 1; i++) {
				map[i] = [];
				for (j = 0; j < sizeY - 1; j++) {
					map[i][j] = TILE.EARTH;
				}
			}
			return map;
		}
	},

	forEach: function (callback, thisArg) {
		// Player
		[this.player].forEach(callback, thisArg);
		// Enemies
		this.pools.groundEnemies.turret.forEach(callback, thisArg);
		this.pools.flyingEnemies.plane.forEach(callback, thisArg);
		this.pools.flyingEnemies.vessel.forEach(callback, thisArg);
		this.pools.flyingEnemies.flagship.forEach(callback, thisArg);
		// Player Bullets
		this.player.bulletPool.forEach(callback, thisArg);
		// Enemy Bullets
		this.pools.enemyBullets.small.forEach(callback, thisArg);
		this.pools.enemyBullets.medium.forEach(callback, thisArg);
		// Collectibles
		this.pools.bonus.forEach(callback, thisArg);
	},

	oldTerrainGenerator: function (map, tile) {
		var sizeX = CONFIG.WORLD_WIDTH + 1;
		var sizeY = CONFIG.WORLD_HEIGHT + 1;

		var map = [];
		var i,j,k;

		var TILE = {
			FORREST: 		6,
			EARTH: 			6 + 15 * 1,
			WATER: 			6 + 15 * 2,
			DEEPWATER: 	6 + 15 * 3
		};

		var TILESTACK = [TILE.FORREST, TILE.EARTH, TILE.WATER, TILE.DEEPWATER];

		// Populate
		for (i = 0; i < sizeX; i++) {
			map[i] = [];
			for (j = 0; j < sizeY; j++) {
				map[i][j] = Math.floor(Math.random() * (99999 - 0 + 1) + 0);
				// map[i][j] = this.game.rnd.between(0, 90000);
				// map[i][j] = 40000;	// Only sea
			}
		}

		// Average
		for (k = 0; k < 2; k++) {

			for (i = 0; i < sizeX -1 ; i++) {
				for (j = 0; j < sizeY - 1; j++) {

					map[i][j] = (
						map[i  ][j  ] +
						map[i+1][j  ] +
						map[i  ][j+1] +
						map[i+1][j+1]
						) / 4;

					map[i][j] = (
						map[(sizeX-1) - i    ][(sizeY-1) - j    ] +
						map[(sizeX-1) - i - 1][(sizeY-1) - j    ] +
						map[(sizeX-1) - i    ][(sizeY-1) - j - 1] +
						map[(sizeX-1) - i - 1][(sizeY-1) - j - 1]
						) / 4;
				}
			}
		}

		// Converting to tile numbers
		for (i = 0; i < sizeX ; i++) {
			for (j = 0; j < sizeY; j++) {

				var data = map[i][j],
						val;

				if (data > 58000) {
					val = TILE.FORREST;

				} else if (data > 50000) {
					val = TILE.EARTH;

				} else if (data > 38000) {
					val = TILE.WATER;

				} else {
					val = TILE.DEEPWATER;
					// val = TILE.EARTH;
					// val = TILE.WATER;
				}
				map[i][j] = val;
			}
		}

		// Smoothing

		for (var n = 0; n < TILESTACK.length - 1; n++) {

			var tileCurrent = TILESTACK[n],
			tileAbove = -1,
			tileBelow = -1;

			if (n > 0) {
				tileAbove = TILESTACK[n - 1];
			}

			tileBelow = TILESTACK[n + 1];	// There is always a lower layer as we don't proceed last TILESTACK item

			for (i = 0; i < sizeX ; i++) {
				for (j = 0; j < sizeY; j++) {

					// Check each tile against the current layer of terrain
					if (map[i][j] === tileCurrent) {

						// Left up
						if (i > 0         && j > 0         && map[i - 1][j - 1] !== tileCurrent && map[i - 1][j - 1] !== tileAbove && map[i - 1][j - 1] !== tileBelow) { map[i - 1][j - 1] = tileBelow; }
						// Mid up
						if (                 j > 0         && map[i    ][j - 1] !== tileCurrent && map[i    ][j - 1] !== tileAbove && map[i    ][j - 1] !== tileBelow) { map[i    ][j - 1] = tileBelow; }
						// Right up
						if (i < sizeX - 1 && j > 0         && map[i + 1][j - 1] !== tileCurrent && map[i + 1][j - 1] !== tileAbove && map[i + 1][j - 1] !== tileBelow) { map[i + 1][j - 1] = tileBelow; }
						// Right mid
						if (i < sizeX - 1                  && map[i + 1][j    ] !== tileCurrent && map[i + 1][j    ] !== tileAbove && map[i + 1][j    ] !== tileBelow) { map[i + 1][j    ] = tileBelow; }
						// Right down
						if (i < sizeX - 1 && j < sizeY - 1 && map[i + 1][j + 1] !== tileCurrent && map[i + 1][j + 1] !== tileAbove && map[i + 1][j + 1] !== tileBelow) { map[i + 1][j + 1] = tileBelow; }
						// Mid down
						if (                 j < sizeY - 1 && map[i    ][j + 1] !== tileCurrent && map[i    ][j + 1] !== tileAbove && map[i    ][j + 1] !== tileBelow) { map[i    ][j + 1] = tileBelow; }
						// Left down
						if (i > 0         && j < sizeY - 1 && map[i - 1][j + 1] !== tileCurrent && map[i - 1][j + 1] !== tileAbove && map[i - 1][j + 1] !== tileBelow) { map[i - 1][j + 1] = tileBelow; }
						// Left mid
						if (i > 0                          && map[i - 1][j    ] !== tileCurrent && map[i - 1][j    ] !== tileAbove && map[i - 1][j    ] !== tileBelow) { map[i - 1][j    ] = tileBelow; }
					}
				}
			}
		}

		// Transition tiles

		var mapFinal = [];

		for (i = 0; i < sizeX - 1; i++) {
			var row = [];
			for (j = 0; j < sizeY - 1; j++) {
				row[j] = 50; // Void tile
			}
			mapFinal[i] = row;
		}


		for (n = 1; n < TILESTACK.length; n++) {
		// for (n = 2; n < 3; n++) {

			var ab = TILESTACK[n],	// Current layer tile
					cu = TILESTACK[n - 1];	// Upper layer tile

			for (i = 0; i < sizeX - 1; i++) {
				for (j = 0; j < sizeY - 1; j++) {

					var q = [[map[i][j], map[i + 1][j]],
									[map[i][j + 1], map[i + 1][j + 1]]];

					// 4 corners
					if (q.join() === [[cu,cu],[cu,cu]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 6;

					// 3 corners
					} else if (q.join() === [[cu,cu],[cu,ab]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 9;

					} else if (q.join() === [[cu,cu],[ab,cu]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 8;

					} else if (q.join() === [[ab,cu],[cu,cu]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 3;

					} else if (q.join() === [[cu,ab],[cu,cu]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 4;

					// 2 corners
					} else if (q.join() === [[cu,cu],[ab,ab]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 11;

					} else if (q.join() === [[ab,cu],[ab,cu]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 5;

					} else if (q.join() === [[ab,ab],[cu,cu]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 1;

					} else if (q.join() === [[cu,ab],[cu,ab]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 7;

					} else if (q.join() === [[ab,cu],[cu,ab]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 14;

					} else if (q.join() === [[cu,ab],[ab,cu]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 13;

					// 1 corner
					} else if (q.join() === [[cu,ab],[ab,ab]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 12;

					} else if (q.join() === [[ab,cu],[ab,ab]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 10;

					} else if (q.join() === [[ab,ab],[ab,cu]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 0;

					} else if (q.join() === [[ab,ab],[cu,ab]].join()) {
						mapFinal[i][j] = (n - 1) * 15 + 2;

					// no corner
					} else if (q.join() === [[ab,ab],[ab,ab]].join()) {
						mapFinal[i][j] = n * 15 + 6;
					}

				}
			}
		}

		return mapFinal;
	},

};

exports.Stage = Stage;
