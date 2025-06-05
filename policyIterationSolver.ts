// Mostly based on Miguel Morales' Grokking Deep Reinforcement Learning book (2020)
class PolicyIterationSolver<TState, TAction> implements ISolver<TAction> {
  private states: Array<TState>;
  private actionSet: Set<TAction>;
  private environment: IEnvironment<TState, TAction>;
  private discountGamma: number;

  // these must be the same length as states
  private policy: Array<TAction> = [];
  private values: Array<number> = [];

  public get Policy(): Array<TAction> {
    return this.policy;
  }
  public get Values(): Array<number> {
    return this.values;
  }

  public constructor(
    environment: IEnvironment<TState, TAction>,
    discountGamma: number = 0.99
  ) {
    this.states = environment.GetStates();
    this.actionSet = environment.GetActions();
    this.environment = environment;
    this.discountGamma = discountGamma;
  }

  public Initialize() {
    // initialize the policy array and the values array
    this.policy = [];
    this.values = [];
    const firstAction = this.actionSet.values().next();
    if (firstAction.done) throw new Error("Action set is empty!");

    for (let i = 0; i < this.states.length; i++) {
      this.policy.push(firstAction.value); // initialize policy with the first element of the action set
      this.values.push(0); // initialize the values array with zeroes
    }
  }

  /**
   * Updates the values array on each invocation using the Bellman backup equation
   */
  public PolicyEvaluate() {
    // runs one iteration of policy evaluation
    for (let i = 0; i < this.values.length; i++) {
      const nextStateAndReward = this.environment.SimulateAction(
        this.states[i],
        this.policy[i]
      );
      this.values[i] =
        nextStateAndReward.reward +
        this.discountGamma *
          this.values[this.FindIndexOfState(nextStateAndReward.state)];
    }
  }

  private FindIndexOfState(state: TState): number {
    for (let i = 0; i < this.states.length; i++) {
      let thisState = this.states[i];
      if (this.environment.AreStatesEqual(thisState, state)) return i;
    }
    throw new Error("Given state not found!");
  }

  /**
   * Updates the policy array on each invocation using the greedy policy update
   * @returns true if there was a change in policy, false otherwise
   */
  public PolicyImprove(): boolean {
    let policyChanged = false;
    for (let i = 0; i < this.states.length; i++) {
      const currentState = this.states[i];
      const currentAction = this.policy[i];
      let bestAction = currentAction;
      let bestValue = -Infinity;

      for (const action of this.actionSet) {
        const nextStateAndReward = this.environment.SimulateAction(
          currentState,
          action
        );
        const nextStateIndex = this.FindIndexOfState(nextStateAndReward.state);
        const value =
          nextStateAndReward.reward +
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
