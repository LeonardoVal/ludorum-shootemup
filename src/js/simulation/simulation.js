// Generic Method
window.simulateGame = function(inputArray, delta) {
  var stage = new exports.Stage();
  stage.createAll();
  var director = new exports.Director(stage);
  inputArray.forEach(function(input) {
    director.next(delta, input);
  });
  return director.stage.player.score;
}

exports.simulationInputReduced = []

// Only 60 of the 601 inputs
for (var i = 0; i < exports.simulationInput.length; i = i + 10){
  exports.simulationInputReduced.push(exports.simulationInput[i]);
}

// var inputForVisualSimulation = exports.simulationInputReduced;
// var stepsForVisualSimulation = 10;
var inputForVisualSimulation = exports.simulationInput;
var stepsForVisualSimulation = 1;

var indexForVisualSimulation = 0;

window.simulateSameAsVisual = function(){
  return window.simulateGame(inputForVisualSimulation, stepsForVisualSimulation);
}
