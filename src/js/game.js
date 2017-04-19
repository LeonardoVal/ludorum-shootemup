/************************************************************************************************
 * MAIN GAME
 *
 *
 ************************************************************************************************/


function Game() {
	this.lastUpdate = 0;
	this.delta = 0;

	this.STATE = {
		preplay:  0,	// no enemy
		play: 	  1,
		postplay: 2 	// no player
	};

	this.gameState = null;
}

Game.prototype = {
	create: function () {
		this.gameState = this.STATE.preplay;
		// STAGE & Director
		this.stage = new exports.Stage();
		this.stage.createAll();
		this.stageController = new StageController(this.stage, this);
		this.director = new Director(this.stage);
		// USER ACTIONS
		this.input.onDown.add(this.onInputDown, this);
		this.cursors = this.input.keyboard.createCursorKeys();
		// --
		this.createGUI();
		// AUDIO
		this.createAudio();
		this.mute = true;
		// Other
		this.inputFunction = this.preplayInput;
		this.deltaAccumulator = 0;
		this.realElapsedTime = 0; // FIXME sacar, solo se usa para debug
	},

	createGUI: function () {
		this.guiText0 = this.add.bitmapText(0, 0, 'minecraftia', 'Get ready\nPress S\nto simulate!');
		this.guiText0.scale.setTo(CONFIG.PIXEL_RATIO, CONFIG.PIXEL_RATIO);
		this.guiText0.x = (this.game.width - this.guiText0.textWidth * CONFIG.PIXEL_RATIO) / 2;
		this.guiText0.y = (this.game.height- this.guiText0.textHeight * CONFIG.PIXEL_RATIO) / 2;
		this.guiText0.fixedToCamera = true;

		this.guiText1 = this.add.bitmapText(0, -5 * CONFIG.PIXEL_RATIO, 'minecraftia', '');
		this.guiText1.scale.setTo(CONFIG.PIXEL_RATIO / 2, CONFIG.PIXEL_RATIO / 2);
		this.guiText1.fixedToCamera = true;

		this.guiText2 = this.add.bitmapText(0, 32, 'minecraftia', '');
		this.guiText2.scale.setTo(CONFIG.PIXEL_RATIO / 4, CONFIG.PIXEL_RATIO / 4);
		this.guiText2.fixedToCamera = true;

		this.updateGUI();
	},

	createAudio: function () {
		this.sound['shoot_player_1'] = this.add.audio('shoot_player_1');
		this.sound['shoot_player_2'] = this.add.audio('shoot_player_2');
		this.sound['shoot_player_3'] = this.add.audio('shoot_player_3');
		this.sound['shoot_player_4'] = this.add.audio('shoot_player_4');
		this.sound['shoot_player_5'] = this.add.audio('shoot_player_5');

		this.sound['explosion_1'] = this.add.audio('explosion_1');
		this.sound['explosion_2'] = this.add.audio('explosion_2');
		this.sound['explosion_3'] = this.add.audio('explosion_3');
		this.sound['explosion_4'] = this.add.audio('explosion_4');

		this.sound['hurt_1'] = this.add.audio('hurt_1');
		this.sound['collect_1'] = this.add.audio('collect_1');

		// TODO : music !
		// this.sound['music_1'] = this.add.audio('music_1');
		// this.sound['music_1'].play();

  	// this.sound['shoot_player'].allowMultiple = true;
	},

	preplayInput: function(input){
		if (input.w || input.e) {
			this.statePreplay2Play();
		}
		if (input.s) {
			this.statePreplay2SimulatedPlay();
		}
	},

	statePreplay2Play: function () {
		this.gameState = this.STATE.play;
		this.inputFunction = this.playInput;
		this.guiText0.setText('');
	},

	statePreplay2SimulatedPlay: function () {
		indexForVisualSimulation = 0;
		this.gameState = this.STATE.play;
		this.inputFunction = this.simulatedInput;
		this.guiText0.setText('');
	},

	// Tiempo entre frames en milisegundos. 16.6 ms -> 60 fps, 33.3 ms -> 30 fps
	// Preferiblemente entero, pero puede ser float.
	// Se utiliza solo en las alternativas de playInput: playInput2 y playInput3
	minFrameTime: 16,

	nextFrameDelay: 0,

	slow: 1,

	// Basico: No interpola ni soluciona la perdida de foco, pero funciona
	playInput: function(input, delta){
		if (input.e){
			this.nextFrameDelay -= delta;
			if (input.f){
				if (this.nextFrameDelay < 0){
					this.director.next(20, input);
					this.nextFrameDelay = 100;
				}
			}
			return;
		}
		this.realElapsedTime += delta;
		var logicDelta = delta;

		if (input.f){
			this.slow -= delta/250;
			if (this.slow < 0.5){
				this.slow = 0.5;
			}
		}
		this.slow += delta/500;
		if (this.slow > 1){
			this.slow = 1;
		}
		this.director.nextWithDelta(logicDelta*this.slow, input);
	},

	simulatedInput: function(input, delta){
		var inputDuration = this.director.fixedStepDelta * stepsForVisualSimulation;
		this.deltaAccumulator += delta;
		if (this.deltaAccumulator >= inputDuration){
			this.deltaAccumulator -= inputDuration;
			this.director.next(stepsForVisualSimulation, inputForVisualSimulation[indexForVisualSimulation++] || input);
		}
	},

	statePlay2Postplay: function () {
		this.gameState = this.STATE.postplay;
		this.inputFunction = this.postplayInput;
		this.guiText0.setText('Game over' + '\n' + this.stage.player.score);
	},

	postplayInput: function(input){
		if (input.w) {
			this.game.state.start('menu');
		}
	},

	update: function () {
		var delta = this.game.time.now - this.lastUpdate;
		this.inputFunction(this.makeInputObject(), delta);
		this.delta = delta / 1000; //in seconds

		// TODO cambiar esto para que no se haga manualmente (como los otros controllers)
		this.stageController.updateBackground();

		if (!this.stage.player.alive) {
			this.statePlay2Postplay();
		}

		this.updateGUI();

		this.lastUpdate = this.game.time.now;
	},

	makeInputObject: function(){
	  return {
	    w: this.input.keyboard.isDown(Phaser.Keyboard.W),
	    s: this.input.keyboard.isDown(Phaser.Keyboard.S),
	    f: this.input.keyboard.isDown(Phaser.Keyboard.F),
	    e: this.input.keyboard.isDown(Phaser.Keyboard.E),
	    up: this.cursors.up.isDown,
	    right: this.cursors.right.isDown,
	    left: this.cursors.left.isDown,
	    down: this.cursors.down.isDown
	  }
	},

	updateCloudSpawn: function () {
		var cloud;
		if (this.stage.nextCloudAt < this.time.now && this.stage.clouds.countDead() > 0) {
			this.stage.nextCloudAt = this.time.now + this.stage.cloudDelay;
			cloud = this.stage.clouds.getFirstExists(false);
			cloud.revive();
		}
	},

	// TODO : mob method
	explode: function (thing) {
		var explosion = this.add.sprite(thing.x, thing.y, 'explosion_1');
		explosion.anchor.setTo(0.5, 0.5);
		explosion.scale.setTo(CONFIG.PIXEL_RATIO, CONFIG.PIXEL_RATIO);
		explosion.animations.add('boom', [ 0, 1, 2, 3, 4 ], 30, false);
		explosion.play('boom', 15, false, true);
	},

	// MISC
	updateGUI: function () {
		var gui = '';
		var life = '';
		for (var i = 0; i < Math.round(this.stage.player.health / 20); i++) {
			life += '@';
		}
		gui += 'HP  ' + life + '\n';
		gui += 'STR ' + this.stage.player.playerStats.strength + '\n';
		gui += 'RAT ' + this.stage.player.playerStats.rate + '\n';
		gui += 'SPD ' + this.stage.player.playerStats.speed + '\n';
		gui += 'ACC ' + this.stage.player.playerStats.accel + '\n';
		this.guiText1.setText(this.stage.player.score + '');
		this.guiText2.setText(gui);
	},

	onInputDown: function () {
		this.game.state.start('menu');
	},

	// -- PLAY INPUT ALTERNATIVOS --

	// Puede usarse para limitar el frameRate. Ademas soluciona que el juego "siga" cuando
	// se pierde el foco (y que cuando se recupera el foco se use un delta inmenso)
	// Con este metodo, si minFrameTime es en promedio menor que delta se enlentece el juego
	// Por esto se recomiendan valores mayores que 17 (phaser intenta tener un delta de 16.6)
	// Si minFrameTime > delta y hubo algun slow-down, el juego se acelera para volver a la normalidad.
	// Si minFrameTime < 16.6 por poco (es decir, tiende a 16.6) hay slow-down practicamente
	// despreciable y se soluciona el problema del foco, pero no se limita el frameRate
	playInput2: function(input, delta){
		this.realElapsedTime += delta;
		this.deltaAccumulator += delta;
		if (this.deltaAccumulator > this.minFrameTime){
			var logicDelta = this.minFrameTime;
			if (input.f){
				logicDelta = logicDelta / 2;
			}
			this.director.next(logicDelta, input);
			this.deltaAccumulator -= this.minFrameTime;
		}
	},

	// Cuando hay un delta grande (por lo menos el doble de minFrameTime) interpola
	// con deltas menores para que la logica no falle, ya que los spawns y
	// colisiones (overlap) pueden fallar con deltas grandes. Si se usa esto y se
	// pierde el foco, la logica del juego (practicamente) seguira corriendo
	playInput3: function(input, delta){
		this.realElapsedTime += delta;
		this.deltaAccumulator += delta;
		if (this.deltaAccumulator > this.minFrameTime){
			var steps = Math.floor(this.deltaAccumulator / this.minFrameTime) + 1;
			var logicDelta = this.deltaAccumulator;
			if (input.f){
				logicDelta = logicDelta / 2;
			}
			this.director.interpolatedNext(logicDelta, steps, input);
			this.deltaAccumulator = 0;
		}
	},

	// RENDER
	render: function () {
		if (CONFIG.DEBUG.bottomInfos) {
			// DEBUG
			this.game.debug.text("Frame Time   : "+this.delta
			, 0, CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO - 16 - 32);
			this.game.debug.text("Director Time: "+this.director.elapsedTime / 1000
			, 0, CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO - 16 - 16);
			// this.game.debug.text("Real Time    : "+this.realElapsedTime
			// , 0, CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO - 16);
			// this.game.debug.text("Delta Time   : "+ (this.realElapsedTime - this.director.elapsedTime)
			// , 0, CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO - 16 + 16);
		}
	}
};

exports.Game = Game;
