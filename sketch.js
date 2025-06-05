const numRows = 20;
const numCols = 20;

const canvasWidth = 1500;
const canvasHeight = 800;

const delX = Math.floor(canvasWidth / numCols);
const delY = Math.floor(canvasHeight / numRows);

let gridWorld;
let agentLocation;
let targetLocation;

let policySolver;
let monteCarloSolver;

let activeSolver = 0; // 0 for policySolver, 1 for monteCarloSolver

let directionMapping = {
  N: "↑",
  S: "↓",
  E: "→",
  W: "←",
};

//#region p5js callbacks

function setup() {
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent("canvasContainer");
  frameRate(5);
  background(120);
  drawGrid();
  setupGridWorld();

  policySolver = new PolicyIterationSolver(gridWorld);
  policySolver.Initialize();

  monteCarloSolver = new MonteCarloSolver(gridWorld);
  monteCarloSolver.Initialize();
}

function draw() {
  background(120);
  drawGrid();

  drawAgent();
  drawTarget();
  drawObstacles();

  if (activeSolver == 0) drawPolicyAndValuesGPI();
  else if (activeSolver == 1) drawPolicyMonteCarlo();
}

function mouseDragged(mouseEvent) {
  if (mouseEvent.shiftKey)
    gridWorld.RemoveObstacle([
      Math.floor(mouseX / delX),
      Math.floor(mouseY / delY),
    ]);
  else
    gridWorld.AddObstacles([
      [Math.floor(mouseX / delX), Math.floor(mouseY / delY)],
    ]);
  //console.log(gridWorld.GetObstacles());
}

function doubleClicked() {
  gridWorld.SetTargetLocation(
    Math.floor(mouseX / delX),
    Math.floor(mouseY / delY)
  );
}

//#endregion

function drawPolicyAndValuesGPI() {
  let policy = policySolver.Policy;
  let values = policySolver.Values;
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      // don't draw values or actions on obstacles and targets
      if (gridWorld.GetObstacles().some((el) => el[0] === j && el[1] === i))
        continue;
      let targetLocation = gridWorld.GetTargetLocation();
      if (targetLocation.x === j && targetLocation.y === i) continue;

      let index = i * numCols + j;

      let action = policy[index];
      let value = values[index];

      fill("black");
      textSize(parseInt(document.getElementById("rangeFontSize").value));
      textAlign(CENTER, CENTER);
      text(value.toFixed(2), j * delX + delX / 2, i * delY + delY / 6);

      if (action !== null) {
        textSize(parseInt(document.getElementById("rangeArrowSize").value));
        fill("blue");
        text(
          directionMapping[action],
          j * delX + delX / 2,
          i * delY + delY / 2
        );
      }
    }
  }
}

function drawPolicyMonteCarlo() {
  let policy = monteCarloSolver.Policy;
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      // don't draw actions on obstacles and targets
      if (gridWorld.GetObstacles().some((el) => el[0] === j && el[1] === i))
        continue;
      let targetLocation = gridWorld.GetTargetLocation();
      if (targetLocation.x === j && targetLocation.y === i) continue;

      let index = i * numCols + j;

      let action = policy[index];
      textAlign(CENTER, CENTER);

      if (action !== null) {
        textSize(parseInt(document.getElementById("rangeArrowSize").value));
        fill("blue");
        text(
          directionMapping[action],
          j * delX + delX / 2,
          i * delY + delY / 2
        );
      }
    }
  }
}

function drawTarget() {
  targetLocation = gridWorld.GetTargetLocation();

  fill("green");
  triangle(
    targetLocation.x * delX + delX / 2,
    targetLocation.y * delY + delY / 6,
    targetLocation.x * delX + delX / 6,
    targetLocation.y * delY + (5 * delY) / 6,
    targetLocation.x * delX + (5 * delX) / 6,
    targetLocation.y * delY + (5 * delY) / 6
  );
  noFill();
}

function drawObstacles() {
  let obstacles = gridWorld.GetObstacles();
  fill("red");
  for (let obstacle of obstacles) {
    rect(obstacle[0] * delX, obstacle[1] * delY, delX, delY);
  }
  noFill();
}

function drawAgent() {
  agentLocation = gridWorld.GetAgentLocation();

  fill("orange");
  circle(
    agentLocation.x * delX + delX / 2,
    agentLocation.y * delY + delY / 2,
    Math.min(delX, delY) / 1.5
  );
  noFill();
}

function drawGrid() {
  for (let i = 0; i < canvasWidth / numCols; i++) {
    // draw vertical lines
    line(i * delX, 0, i * delX, canvasHeight);
  }
  for (let j = 0; j < canvasHeight / numRows; j++) {
    // draw horizontal lines
    line(0, j * delY, canvasWidth, j * delY);
  }
}

function setupGridWorld() {
  gridWorld = new GridWorld(numRows, numCols);
  gridWorld.AddObstacles([
    [3, 2],
    [3, 3],
    [5, 6],
    [6, 6],
    [6, 5],
    [6, 4],
    [4, 4],
    [4, 6],
    [5, 4],
    [6, 1],
    [6, 2],
    [6, 3],
    [7, 1],
    [8, 1],
    [9, 1],
  ]);
  gridWorld.SetTargetLocation(
    Math.floor(numRows * 0.8),
    Math.floor(numCols * 0.5)
  );
  gridWorld.SetAgentLocation(0, 1);
}

//#region UI event handlers
//#region Policy iteration

function btnClickEvaluate() {
  //console.log("Policy evaluation started!");

  activeSolver = 0;

  let numIterations = document.getElementById("numberOfIterations").value;
  for (let i = 0; i < numIterations; i++) {
    policySolver.PolicyEvaluate();
  }

  //console.log("Policy evaluation completed!");
}

function btnClickImprove() {
  policySolver.PolicyImprove();
}

function btnAutomate() {
  let policyChanged = true;
  let iterCount = 0;

  while (policyChanged && iterCount < 100) {
    // there's no need to evaluate till convergence. 10 iterations is enough
    for (let i = 0; i < 10; i++) policySolver.PolicyEvaluate();
    // improve the policy based on the policy reached above
    policyChanged = policySolver.PolicyImprove();
    // increment the iteration threshold counter
    iterCount++;
  }

  if (!policyChanged) console.log("Policy converged!");
}

//#endregion

//#region Monte Carlo Exploration Starts algorithm

function btnClickRunMCESEpisodes() {
  activeSolver = 1;

  let maxSteps = document.getElementById(
    "maxIterationsMonteCarloPerEpisode"
  ).value;
  monteCarloSolver.MaxSteps = maxSteps;
  let numEpisodes = document.getElementById("noOfEpisodesMCES").value;
  for (let i = 0; i < numEpisodes; i++) {
    monteCarloSolver.PolicyEvaluate();
  }
}

function btnClickImprovePolicyMCES() {
  monteCarloSolver.PolicyImprove();
}

function btnAutomateMCES() {
  let policyChanged = true;
  let iterCount = 0;

  while (policyChanged && iterCount < 100) {
    // sample the specified number of episodes
    btnClickRunMCESEpisodes();
    // improve the policy based on the action-values estimated above for the lucky states
    policyChanged = monteCarloSolver.PolicyImprove();
    // increment the iteration threshold counter
    iterCount++;
  }

  if (!policyChanged) console.log("Policy converged!");
}

//#endregion

//#endregion
