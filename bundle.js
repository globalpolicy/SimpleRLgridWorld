"use strict";
class GridWorld {
    constructor(numRows, numColumns) {
        this.obstacleReward = -2;
        this.idleReward = -1;
        this.targetReward = 1;
        this.numRows = 0;
        this.numColumns = 0;
        // current location of the agent. zero-indexed
        this.agentLocation = { x: 0, y: 0 };
        // list of (x,y) coordinates (as size 2 arrays) for obstacles. zero-indexed
        this.obstacles = [];
        // location of the target (x,y). zero-indexed
        this.targetLocation = { x: 0, y: 0 };
        this.numRows = numRows;
        this.numColumns = numColumns;
    }
    /**
     * Put the agent at a specified location. Zero-indexed.
     * @param {number} x Starts from 0 at the left, increases rightwards.
     * @param {number} y Starts from 0 at the top, increases downwards.
     */
    SetAgentLocation(x, y) {
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
    SetTargetLocation(x, y) {
        this.targetLocation.x = x;
        this.targetLocation.y = y;
    }
    /**
     * Retrieve the location of the target. Zero-indexed
     * @returns {{x:number, y:number}}
     */
    GetTargetLocation() {
        return {
            x: this.targetLocation.x,
            y: this.targetLocation.y,
        };
    }
    /**
     * Add a list of obstacles to the grid world
     * @param {Array<[number,number]>} obstacleCoordinates
     */
    AddObstacles(obstacleCoordinates) {
        for (let i = 0; i < obstacleCoordinates.length; i++) {
            let thisObstacle = obstacleCoordinates[i];
            if (this.obstacles.some((el) => el[0] === thisObstacle[0] && el[1] === thisObstacle[1]))
                continue; // this obstacle already exists in our obstacle list, so skip it
            this.obstacles.push(thisObstacle); // add to our obstacle list
        }
    }
    /**
     * Retrieve the list of obstacles in the grid world
     * @returns {Array<[x:number,y:number]>} An array of obstacles, each represented as a size 2 array with x and y coordinates
     */
    GetObstacles() {
        return this.obstacles;
    }
    /**
     * Removes the specified obstacle from the grid world
     * @param obstacle Coordinate of the obstacle to remove
     */
    RemoveObstacle(obstacle) {
        let obstacleIndex = this.obstacles.findIndex((el) => el[0] === obstacle[0] && el[1] === obstacle[1]);
        if (obstacleIndex > -1) {
            this.obstacles.splice(obstacleIndex, 1);
        }
    }
    /**
     * Returns the immediate reward obtained by taking the specified action from specified state, and the new state
     * @param {{x:number,y:number}} state The state from where to take action
     * @param {Action} action
     */
    SimulateAction(state, action) {
        let retval = {
            reward: 0,
            state: { x: 0, y: 0 },
        };
        if (this.targetLocation.x == state.x && this.targetLocation.y == state.y) {
            // the agent is already at the target location
            // THIS IS CRITICAL FOR CONVERGENCE (EMPIRICAL OBSERVATION)
            retval.reward = 0;
            retval.state = { x: state.x, y: state.y };
        }
        else {
            switch (action.toUpperCase()) {
                case "E":
                    if (state.x == this.numColumns - 1) {
                        // the agent is at the eastern most boundary of the grid
                        retval.reward = this.idleReward;
                        retval.state = { x: state.x, y: state.y };
                    }
                    else if (this.obstacles.some((el) => el[0] === state.x + 1 && el[1] === state.y)) {
                        // there is an obstacle to the right of the agent; obstacle penalty + no change in state
                        retval.reward = this.obstacleReward;
                        retval.state = { x: state.x, y: state.y };
                    }
                    else if (this.targetLocation.x == state.x + 1 &&
                        this.targetLocation.y == state.y) {
                        // the target is to the right of the agent
                        retval.reward = this.targetReward;
                        retval.state = { x: state.x + 1, y: state.y };
                    }
                    else {
                        retval.reward = this.idleReward;
                        retval.state = { x: state.x + 1, y: state.y };
                    }
                    break;
                case "N":
                    if (state.y == 0) {
                        // the agent is at the northern most boundary of the grid OR there is an obstacle above the agent
                        retval.reward = this.idleReward;
                        retval.state = { x: state.x, y: state.y };
                    }
                    else if (this.obstacles.some((el) => el[0] === state.x && el[1] === state.y - 1)) {
                        // there is an obstacle above the agent; obstacle penalty + no change in state
                        retval.reward = this.obstacleReward;
                        retval.state = { x: state.x, y: state.y };
                    }
                    else if (this.targetLocation.x == state.x &&
                        this.targetLocation.y == state.y - 1) {
                        // the target is above the agent
                        retval.reward = this.targetReward;
                        retval.state = { x: state.x, y: state.y - 1 };
                    }
                    else {
                        retval.reward = this.idleReward;
                        retval.state = { x: state.x, y: state.y - 1 };
                    }
                    break;
                case "W":
                    if (state.x == 0) {
                        // the agent is at the western most boundary of the grid OR there is an obstacle to the left of the agent
                        retval.reward = this.idleReward;
                        retval.state = { x: state.x, y: state.y };
                    }
                    else if (this.obstacles.some((el) => el[0] === state.x - 1 && el[1] === state.y)) {
                        // there is an obstacle to the left of the agent; obstacle penalty + no change in state
                        retval.reward = this.obstacleReward;
                        retval.state = { x: state.x, y: state.y };
                    }
                    else if (this.targetLocation.x == state.x - 1 &&
                        this.targetLocation.y == state.y) {
                        // the target is to the left of the agent
                        retval.reward = this.targetReward;
                        retval.state = { x: state.x - 1, y: state.y };
                    }
                    else {
                        retval.reward = this.idleReward;
                        retval.state = { x: state.x - 1, y: state.y };
                    }
                    break;
                case "S":
                    if (state.y == this.numRows - 1) {
                        // the agent is at the southern most boundary of the grid OR there is an obstacle below the agent
                        retval.reward = this.idleReward;
                        retval.state = { x: state.x, y: state.y };
                    }
                    else if (this.obstacles.some((el) => el[0] === state.x && el[1] === state.y + 1)) {
                        // there is an obstacle below the agent; obstacle penalty + no change in state
                        retval.reward = this.obstacleReward;
                        retval.state = { x: state.x, y: state.y };
                    }
                    else if (this.targetLocation.x == state.x &&
                        this.targetLocation.y == state.y + 1) {
                        // the target is below the agent
                        retval.reward = this.targetReward;
                        retval.state = { x: state.x, y: state.y + 1 };
                    }
                    else {
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
    AreStatesEqual(state1, state2) {
        return state1.x == state2.x && state1.y == state2.y;
    }
    /**
     * Checks if the two given actions are equal
     * @param action1 First action
     * @param action2 Second action
     * @returns
     */
    AreActionsEqual(action1, action2) {
        return action1.toUpperCase() == action2.toUpperCase();
    }
    /**
     * Checks if the given state is terminal (all possible actions loop back to itself). Currently, only the target location is a valid terminal state.
     * @param state State to check if it's terminal
     * @returns
     */
    IsStateTerminal(state) {
        if (state.x === this.targetLocation.x &&
            state.y === this.targetLocation.y) {
            return true;
        }
        else
            return false;
    }
    /**
     * Returns the set of states in this environment
     * @returns {Array<State>} An array of states
     */
    GetStates() {
        let retval = [];
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
    GetActions() {
        return new Set(["E", "W", "N", "S"]);
    }
}
class QValue {
    get State() {
        return this.state;
    }
    get Action() {
        return this.action;
    }
    get Value() {
        return this.value;
    }
    constructor(state, action, value) {
        this.state = state;
        this.action = action;
        this.value = value;
    }
    IsSame(anotherQValue) {
        return (anotherQValue.action === this.action && anotherQValue.state === this.state);
    }
}
class QFunction {
    constructor() {
        this.store = new Map();
        this.actionSet = new Set(); // only to keep track of unique actions in the store
    }
    HashStateActionPair(state, action) {
        return JSON.stringify(state) + QFunction.DELIM + JSON.stringify(action);
    }
    GetValue(state, action) {
        return this.store.get(this.HashStateActionPair(state, action));
    }
    SetValue(state, action, value) {
        this.actionSet.add(action);
        this.store.set(this.HashStateActionPair(state, action), value);
    }
    ArgMaxAction(state) {
        let bestAction = undefined;
        let bestValue = -Infinity;
        for (const action of this.actionSet) {
            let potentialStoreValue = this.store.get(this.HashStateActionPair(state, action));
            if (potentialStoreValue != undefined) {
                if (potentialStoreValue > bestValue) {
                    bestValue = potentialStoreValue;
                    bestAction = action;
                }
            }
        }
        return [bestAction, bestValue];
    }
}
QFunction.DELIM = "{||}";
// Implemented according to the procedure described by Professor Saeed Saeedvand @ https://www.youtube.com/watch?v=oGB3dkI-Lt0
class MonteCarloSolver {
    get Policy() {
        return this.policy;
    }
    set MaxSteps(maxSteps) {
        this.maxSteps = maxSteps;
    }
    get MaxSteps() {
        return this.maxSteps;
    }
    /**
     *
     * @param environment
     * @param discountGamma
     * @param maxSteps The maximum number of steps the agent takes before stopping the episode
     */
    constructor(environment, discountGamma = 0.99, maxSteps = 500) {
        // private averageQValues = new Array<QValue<TState, TAction>>(); // average action values calculated during policy improvement from the sampled episodes
        this.averageQValues = new QFunction();
        // these must be the same length as states
        this.policy = [];
        this.qvalues = [];
        this.states = environment.GetStates();
        this.actions = Array.from(environment.GetActions());
        this.environment = environment;
        this.discountGamma = discountGamma;
        this.maxSteps = maxSteps;
    }
    Initialize() {
        // initialize the policy array and the qvalue array and the average qvalue function
        this.policy = [];
        this.qvalues = [];
        this.averageQValues = new QFunction();
        for (let i = 0; i < this.states.length; i++) {
            this.policy.push(this.actions[0]); // initialize policy with the first element of the actions array
        }
    }
    PolicyEvaluate() {
        this.SampleEpisode();
    }
    /**
     * Improves the existing policy based on the q-values array populated in the episode sampling phase
     * @returns True if policy improvement occurred
     */
    PolicyImprove() {
        var _a;
        let retval = false;
        //#region Averaging the q-values
        //this.averageQValues = new Array<QValue<TState, TAction>>(); <-- don't clear the average Q-values. BAD for convergence (empirically observed)
        for (let i = 0; i < this.states.length; i++) {
            let state = this.states[i];
            for (let action of this.actions) {
                let qValueSum = 0; // sum of q-values for this state-action pair
                let n = 0; // counter for this q-values of this state-action pair
                for (const qValue of this.qvalues) {
                    if (this.environment.AreStatesEqual(state, qValue.State) &&
                        this.environment.AreActionsEqual(action, qValue.Action)) {
                        qValueSum += qValue.Value;
                        n++;
                    }
                }
                if (n > 0)
                    this.averageQValues.SetValue(state, action, qValueSum / n); // populate the q-function with the average for each (s,a) pair
            }
        }
        //#endregion
        //#region Extracting new policy from the average q-values.
        for (let i = 0; i < this.states.length; i++) {
            let state = this.states[i];
            let bestQVal = this.averageQValues.ArgMaxAction(state)[1];
            let bestAction = (_a = this.averageQValues.ArgMaxAction(state)[0]) !== null && _a !== void 0 ? _a : this.policy[i]; // default is the existing one
            if (!this.environment.AreActionsEqual(this.policy[i], bestAction)) {
                this.policy[i] = bestAction;
                retval = true;
            }
        }
        //#endregion
        this.qvalues = []; // clear the Q(s,a) values gathered over the episodes sampled for the current policy.
        return retval;
    }
    /**
     * Runs one episode of Monte Carlo Exploring Starts algorithm. Selects a random (s,a) pair, obtains reward 'r' due to action 'a', then accumulates discounted
     * rewards by following the active policy thereafter till end of episode, then stores the sum as the action-value for the (s,a) pair in the qvalues array.
     *
     */
    SampleEpisode() {
        const randomStateIndex = Math.floor(Math.random() * this.states.length);
        const randomActionIndex = Math.floor(Math.random() * this.actions.length);
        let state = this.states[randomStateIndex];
        let action = this.actions[randomActionIndex];
        let qValue = 0;
        for (let i = 0; i < this.maxSteps; i++) {
            const rewardAndAction = this.environment.SimulateAction(state, action);
            state = rewardAndAction.state; // update state
            action = this.policy[this.FindIndexOfState(state)]; // update action
            qValue += Math.pow(this.discountGamma, i) * rewardAndAction.reward; // discounted reward accumulation
            if (this.environment.IsStateTerminal(state))
                break; // if we've reached a terminal state, exit for
        }
        this.qvalues.push(new QValue(this.states[randomStateIndex], this.actions[randomActionIndex], qValue)); // update the experience buffer. CAREFUL: the state and action must be the one we started with randomly - I got tripped up by this
    }
    FindIndexOfState(state) {
        for (let i = 0; i < this.states.length; i++) {
            let thisState = this.states[i];
            if (this.environment.AreStatesEqual(thisState, state))
                return i;
        }
        throw new Error("Given state not found!");
    }
}
// Mostly based on Miguel Morales' Grokking Deep Reinforcement Learning book (2020)
class PolicyIterationSolver {
    get Policy() {
        return this.policy;
    }
    get Values() {
        return this.values;
    }
    constructor(environment, discountGamma = 0.99) {
        // these must be the same length as states
        this.policy = [];
        this.values = [];
        this.states = environment.GetStates();
        this.actionSet = environment.GetActions();
        this.environment = environment;
        this.discountGamma = discountGamma;
    }
    Initialize() {
        // initialize the policy array and the values array
        this.policy = [];
        this.values = [];
        const firstAction = this.actionSet.values().next();
        if (firstAction.done)
            throw new Error("Action set is empty!");
        for (let i = 0; i < this.states.length; i++) {
            this.policy.push(firstAction.value); // initialize policy with the first element of the action set
            this.values.push(0); // initialize the values array with zeroes
        }
    }
    /**
     * Updates the values array on each invocation using the Bellman backup equation
     */
    PolicyEvaluate() {
        // runs one iteration of policy evaluation
        for (let i = 0; i < this.values.length; i++) {
            const nextStateAndReward = this.environment.SimulateAction(this.states[i], this.policy[i]);
            this.values[i] =
                nextStateAndReward.reward +
                    this.discountGamma *
                        this.values[this.FindIndexOfState(nextStateAndReward.state)];
        }
    }
    FindIndexOfState(state) {
        for (let i = 0; i < this.states.length; i++) {
            let thisState = this.states[i];
            if (this.environment.AreStatesEqual(thisState, state))
                return i;
        }
        throw new Error("Given state not found!");
    }
    /**
     * Updates the policy array on each invocation using the greedy policy update
     * @returns true if there was a change in policy, false otherwise
     */
    PolicyImprove() {
        let policyChanged = false;
        for (let i = 0; i < this.states.length; i++) {
            const currentState = this.states[i];
            const currentAction = this.policy[i];
            let bestAction = currentAction;
            let bestValue = -Infinity;
            for (const action of this.actionSet) {
                const nextStateAndReward = this.environment.SimulateAction(currentState, action);
                const nextStateIndex = this.FindIndexOfState(nextStateAndReward.state);
                const value = nextStateAndReward.reward +
                    this.discountGamma * this.values[nextStateIndex];
                if (value > bestValue) {
                    bestValue = value;
                    bestAction = action;
                }
            }
            if (!this.environment.AreActionsEqual(bestAction, currentAction)) {
                this.policy[i] = bestAction;
                policyChanged = true;
            }
        }
        return policyChanged;
    }
}
