
// Aca deberian estar todas las constantes, ya sea del jugador o de los enemigos
var CONFIG = exports.CONFIG = {
	GAME_WIDTH:   				320,
	GAME_HEIGHT:  				320,
	PIXEL_RATIO:  				2,

	WORLD_WIDTH: 					16,
	WORLD_HEIGHT: 				150,

	WORLD_SWAP_HEIGHT: 		8,

	MOBPOOL_SIZE: 				25,
	BULLETPOOL_SIZE: 			100,
	BULLETPOOL_SIZE_ENNEMY: 			100,
	BONUSPOOL_SIZE: 			20,

	CLOUDPOOL_SIZE: 			10,
	CLOUD_WIND_SPEED: 		20,

	SCROLL_SPEED: 				40,
	SCROLL_ACCEL: 				15,

	BLINK_DAMAGE_TIME: 		8,

	AUDIO_LEVEL: 					0.5,
	LEGACY_GENERATOR:			false,

	BONUS_CLASSES: {
		STRENGTH: 0,
		RATE: 1,
		SPEED: 2,
		ACCEL: 3,
	},

	CLASS_STATS: 					[{
		className: 					'Viper',
		health: 						100,
		speed: 							140,
		accel: 							8,
		strength: 					100,
		rate: 							8
	},{
		className: 					'Cobra',
		health: 						80,
		speed: 							160,
		accel: 							9,
		strength: 					80,
		rate: 							7
	},{
		className: 					'Anaconda',
		health: 						100,
		speed: 							140,
		accel: 							7,
		strength: 					100,
		rate: 							6
	},{
		className: 					'Boa',
		health: 						140,
		speed: 							100,
		accel: 							5,
		strength: 					150,
		rate: 							4
	}],

	DEBUG: {
		bottomInfos: 				true,
		tileset: 						false,
	},
};
