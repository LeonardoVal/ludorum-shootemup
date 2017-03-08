function Stage() {
	this.world = new p2.World();
	this.world.applyGravity = false;
	this.player = null;
	this.enemyBulletPools = null;
	this.bonuses = null;
	this.clouds = null;
	this.scrollSpeed = CONFIG.SCROLL_SPEED;
	this.width = CONFIG.GAME_WIDTH * CONFIG.PIXEL_RATIO;
	this.height = CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO;
}

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
		// TODO implementar
		this.createGround();
		// this.createClouds();
		this.createEnemies();
		// this.createBonuses();
		this.createPlayer();
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
		this.enemyBulletPools = [];
		// Small bullets
		this.enemyBulletPools[0] = fillGroupTied("Bullet", CONFIG.BULLETPOOL_SIZE_ENNEMY, 0);
		// Mid bullets
		this.enemyBulletPools[1] = fillGroupTied("Bullet", CONFIG.BULLETPOOL_SIZE_ENNEMY, 1);
		// GROUND ENEMIES
		// TODO
		// this.mobPoolsGround = [];
		// this.mobPoolsGround[0] = fillGroupTied("Turret", CONFIG.MOBPOOL_SIZE);
		// FLYING ENEMIES
		this.mobPools = [];
		this.mobPools[0] = fillGroupTied("Plane", CONFIG.MOBPOOL_SIZE);
		this.mobPools[1] = fillGroupTied("Vessel", CONFIG.MOBPOOL_SIZE);
		this.mobPools[2] = fillGroupTied("Flagship", CONFIG.MOBPOOL_SIZE);
		// DELAYS (flying)
		this.enemyDelay = [];
		this.nextEnemyAt = [];
		this.enemyDelay[0] = 1000;
		this.enemyDelay[1] = 5000;
		this.enemyDelay[2] = 30000;
		this.nextEnemyAt[0] = this.enemyDelay[0];	// TODO in a loop
		this.nextEnemyAt[1] = this.enemyDelay[1];
		this.nextEnemyAt[2] = this.enemyDelay[2];
		// DELAYS (ground)
		this.enemyDelayGround = [];
		this.nextEnemyGroundAt = [];
		this.enemyDelayGround[0] = 5000;
		this.nextEnemyGroundAt[0] = this.enemyDelayGround[0];
	},

	createBonuses: function(){
		this.bonuses = this.newGroup();

		for (var i = 0; i < CONFIG.BONUSPOOL_SIZE; i++) {
			var o = new exports.Collectible(this.state, 'bonus_cube');
			this.bonuses.add(o.sprite);
			o.sprite.exists = false;
			o.sprite.alive = false;
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

		// BEGIN TEST (este codigo lo puse yo para generar un mapa manualmente)
		for (i = 0; i < sizeX - 1; i++) {
			map[i] = [];
			for (j = 0; j < sizeY - 1; j++) {
				// map[i][j] = Math.floor(Math.random() * (50 - 0 + 1) + 0);
				map[i][j] = TILE.EARTH;
			}
		}
		return map;
		// END TEST

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
