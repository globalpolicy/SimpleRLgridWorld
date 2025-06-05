type State = { x: number; y: number };
type Action = "E" | "W" | "N" | "S";

class GridWorld implements IEnvironment<State, Action> {
  obstacleReward = -2;
  idleReward = -1;
  targetReward = 1;

  private numRows: number = 0;
  private numColumns: number = 0;

  // current location of the agent. zero-indexed
  private agentLocation: { x: number; y: number } = { x: 0, y: 0 };

  // list of (x,y) coordinates (as size 2 arrays) for obstacles. zero-indexed
  private obstacles: Array<[x: number, y: number]> = [];

  // location of the target (x,y). zero-indexed
  private targetLocation: { x: number; y: number } = { x: 0, y: 0 };

  constructor(numRows: number, numColumns: number) {
    this.numRows = numRows;
    this.numColumns = numColumns;
  }

  /**
   * Put the agent at a specified location. Zero-indexed.
   * @param {number} x Starts from 0 at the left, increases rightwards.
   * @param {number} y Starts from 0 at the top, increases downwards.
   */
  SetAgentLocation(x: number, y: number) {
    this.agentLocation.x = x;
    this.agentLocation.y = y;
  }

  /**
   * Retrieve the location of the agent. Zero-indexed
   * @returns {{x:number, y:number}}
   */
  GetAgentLocation() {
    return {
      x: this.agentLocation.x,
      y: this.agentLocation.y,
    };
  }

  /**
   * Put the target at a specified location. Zero-indexed
   * @param {number} x
   * @param {number} y
   */
  SetTargetLocation(x: number, y: number) {
    this.targetLocation.x = x;
    this.targetLocation.y = y;
  }

  /**
   * Retrieve the location of the target. Zero-indexed
   * @returns {{x:number, y:number}}
   */
  GetTargetLocation(): { x: number; y: number } {
    return {
      x: this.targetLocation.x,
      y: this.targetLocation.y,
    };
  }

  /**
   * Add a list of obstacles to the grid world
   * @param {Array<[number,number]>} obstacleCoordinates
   */
  AddObstacles(obstacleCoordinates: Array<[x: number, y: number]>) {
    for (let i = 0; i < obstacleCoordinates.length; i++) {
      let thisObstacle = obstacleCoordinates[i];
      if (
        this.obstacles.some(
          (el) => el[0] === thisObstacle[0] && el[1] === thisObstacle[1]
        )
      )
        continue; // this obstacle already exists in our obstacle list, so skip it
      this.obstacles.push(thisObstacle); // add to our obstacle list
    }
  }

  /**
   * Retrieve the list of obstacles in the grid world
   * @returns {Array<[x:number,y:number]>} An array of obstacles, each represented as a size 2 array with x and y coordinates
   */
  GetObstacles(): Array<[x: number, y: number]> {
    return this.obstacles;
  }

  /**
   * Removes the specified obstacle from the grid world
   * @param obstacle Coordinate of the obstacle to remove
   */
  RemoveObstacle(obstacle: [x: number, y: number]) {
    let obstacleIndex = this.obstacles.findIndex(
      (el) => el[0] === obstacle[0] && el[1] === obstacle[1]
    );
    if (obstacleIndex > -1) {
      this.obstacles.splice(obstacleIndex, 1);
    }
  }

  /**
   * Returns the immediate reward obtained by taking the specified action from specified state, and the new state
   * @param {{x:number,y:number}} state The state from where to take action
   * @param {Action} action
   */
  SimulateAction(
    state: State,
    action: Action
  ): { reward: number; state: State } {
    let retval: { reward: number; state: State } = {
      reward: 0,
      state: { x: 0, y: 0 },
    };

    if (this.targetLocation.x == state.x && this.targetLocation.y == state.y) {
      // the agent is already at the target location
      // THIS IS CRITICAL FOR CONVERGENCE (EMPIRICAL OBSERVATION)
      retval.reward = 0;
      retval.state = { x: state.x, y: state.y };
    } else {
      switch (action.toUpperCase()) {
        case "E":
          if (state.x == this.numColumns - 1) {
            // the agent is at the eastern most boundary of the grid
            retval.reward = this.idleReward;
            retval.state = { x: state.x, y: state.y };
          } else if (
            this.obstacles.some(
              (el) => el[0] === state.x + 1 && el[1] === state.y
            )
          ) {
            // there is an obstacle to the right of the agent; obstacle penalty + no change in state
            retval.reward = this.obstacleReward;
            retval.state = { x: state.x, y: state.y };
          } else if (
            this.targetLocation.x == state.x + 1 &&
            this.targetLocation.y == state.y
          ) {
            // the target is to the right of the agent
            retval.reward = this.targetReward;
            retval.state = { x: state.x + 1, y: state.y };
          } else {
            retval.reward = this.idleReward;
            retval.state = { x: state.x + 1, y: state.y };
          }
          break;
        case "N":
          if (state.y == 0) {
            // the agent is at the northern most boundary of the grid OR there is an obstacle above the agent
            retval.reward = this.idleReward;
            retval.state = { x: state.x, y: state.y };
          } else if (
            this.obstacles.some(
              (el) => el[0] === state.x && el[1] === state.y - 1
            )
          ) {
            // there is an obstacle above the agent; obstacle penalty + no change in state
            retval.reward = this.obstacleReward;
            retval.state = { x: state.x, y: state.y };
          } else if (
            this.targetLocation.x == state.x &&
            this.targetLocation.y == state.y - 1
          ) {
            // the target is above the agent
            retval.reward = this.targetReward;
            retval.state = { x: state.x, y: state.y - 1 };
          } else {
            retval.reward = this.idleReward;
            retval.state = { x: state.x, y: state.y - 1 };
          }
          break;
        case "W":
          if (state.x == 0) {
            // the agent is at the western most boundary of the grid OR there is an obstacle to the left of the agent
            retval.reward = this.idleReward;
            retval.state = { x: state.x, y: state.y };
          } else if (
            this.obstacles.some(
              (el) => el[0] === state.x - 1 && el[1] === state.y
            )
          ) {
            // there is an obstacle to the left of the agent; obstacle penalty + no change in state
            retval.reward = this.obstacleReward;
            retval.state = { x: state.x, y: state.y };
          } else if (
            this.targetLocation.x == state.x - 1 &&
            this.targetLocation.y == state.y
          ) {
            // the target is to the left of the agent
            retval.reward = this.targetReward;
            retval.state = { x: state.x - 1, y: state.y };
          } else {
            retval.reward = this.idleReward;
            retval.state = { x: state.x - 1, y: state.y };
          }
          break;
        case "S":
          if (state.y == this.numRows - 1) {
            // the agent is at the southern most boundary of the grid OR there is an obstacle below the agent
            retval.reward = this.idleReward;
            retval.state = { x: state.x, y: state.y };
          } else if (
            this.obstacles.some(
              (el) => el[0] === state.x && el[1] === state.y + 1
            )
          ) {
            // there is an obstacle below the agent; obstacle penalty + no change in state
            retval.reward = this.obstacleReward;
            retval.state = { x: state.x, y: state.y };
          } else if (
            this.targetLocation.x == state.x &&
            this.targetLocation.y == state.y + 1
          ) {
            // the target is below the agent
            retval.reward = this.targetReward;
            retval.state = { x: state.x, y: state.y + 1 };
          } else {
            retval.reward = this.idleReward;
            retval.state = { x: state.x, y: state.y + 1 };
          }
          break;
      }
    }

    return retval;
  }

  /**
   * Checks if the two given states are equal
   * @param state1 First state
   * @param state2 Second state
   * @returns
   */
  AreStatesEqual(state1: State, state2: State): boolean {
    return state1.x == state2.x && state1.y == state2.y;
  }

  /**
   * Checks if the two given actions are equal
   * @param action1 First action
   * @param action2 Second action
   * @returns
   */
  AreActionsEqual(action1: Action, action2: Action): boolean {
    return action1.toUpperCase() == action2.toUpperCase();
  }

  /**
   * Checks if the given state is terminal (all possible actions loop back to itself). Currently, only the target location is a valid terminal state.
   * @param state State to check if it's terminal
   * @returns
   */
  IsStateTerminal(state: State): boolean {
    if (
      state.x === this.targetLocation.x &&
      state.y === this.targetLocation.y
    ) {
      return true;
    } else return false;
  }

  /**
   * Returns the set of states in this environment
   * @returns {Array<State>} An array of states
   */
  GetStates(): State[] {
    let retval: State[] = [];
    for (let i = 0; i < this.numColumns * this.numRows; i++) {
      let x = i % this.numColumns;
      let y = Math.floor(i / this.numColumns);
      retval.push({ x: x, y: y });
    }
    return retval;
  }
  /**
   * Returns the set of actions that can be taken in this environment
   * @returns {Set<Action>} A set of actions
   */
  GetActions(): Set<Action> {
    return new Set<Action>(["E", "W", "N", "S"]);
  }
}
