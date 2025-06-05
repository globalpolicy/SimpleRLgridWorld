class QValue<TState, TAction> {
  private state: TState;
  private action: TAction;
  private value: number; // the action action value of this state-action pair

  public get State() {
    return this.state;
  }

  public get Action() {
    return this.action;
  }

  public get Value() {
    return this.value;
  }

  public constructor(state: TState, action: TAction, value: number) {
    this.state = state;
    this.action = action;
    this.value = value;
  }

  public IsSame(anotherQValue: QValue<TState, TAction>): boolean {
    return (
      anotherQValue.action === this.action && anotherQValue.state === this.state
    );
  }
}

class QFunction<TState, TAction> {
  private static DELIM = "{||}";
  private store = new Map<string, number>();
  private actionSet = new Set<TAction>(); // only to keep track of unique actions in the store

  private HashStateActionPair(state: TState, action: TAction): string {
    return JSON.stringify(state) + QFunction.DELIM + JSON.stringify(action);
  }

  public GetValue(state: TState, action: TAction): number | undefined {
    return this.store.get(this.HashStateActionPair(state, action));
  }

  public SetValue(state: TState, action: TAction, value: number) {
    this.actionSet.add(action);
    this.store.set(this.HashStateActionPair(state, action), value);
  }

  public ArgMaxAction(state: TState): [TAction | undefined, number] {
    let bestAction: TAction | undefined = undefined;
    let bestValue = -Infinity;
    for (const action of this.actionSet) {
      let potentialStoreValue = this.store.get(
        this.HashStateActionPair(state, action)
      );
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

// Implemented according to the procedure described by Professor Saeed Saeedvand @ https://www.youtube.com/watch?v=oGB3dkI-Lt0
class MonteCarloSolver<TState, TAction> implements ISolver<TAction> {
  private states: Array<TState>;
  private actions: Array<TAction>;
  private environment: IEnvironment<TState, TAction>;
  private discountGamma: number;
  private maxSteps: number;
  // private averageQValues = new Array<QValue<TState, TAction>>(); // average action values calculated during policy improvement from the sampled episodes
  private averageQValues = new QFunction<TState, TAction>();

  // these must be the same length as states
  private policy: Array<TAction> = [];
  private qvalues: Array<QValue<TState, TAction>> = [];

  public get Policy() {
    return this.policy;
  }

  public set MaxSteps(maxSteps: number) {
    this.maxSteps = maxSteps;
  }

  public get MaxSteps() {
    return this.maxSteps;
  }
  /**
   *
   * @param environment
   * @param discountGamma
   * @param maxSteps The maximum number of steps the agent takes before stopping the episode
   */
  public constructor(
    environment: IEnvironment<TState, TAction>,
    discountGamma: number = 0.99,
    maxSteps: number = 500
  ) {
    this.states = environment.GetStates();
    this.actions = Array.from(environment.GetActions());
    this.environment = environment;
    this.discountGamma = discountGamma;
    this.maxSteps = maxSteps;
  }

  public Initialize() {
    // initialize the policy array and the qvalue array and the average qvalue function
    this.policy = [];
    this.qvalues = [];
    this.averageQValues = new QFunction<TState, TAction>();

    for (let i = 0; i < this.states.length; i++) {
      this.policy.push(this.actions[0]); // initialize policy with the first element of the actions array
    }
  }

  public PolicyEvaluate(): void {
    this.SampleEpisode();
  }

  /**
   * Improves the existing policy based on the q-values array populated in the episode sampling phase
   * @returns True if policy improvement occurred
   */
  public PolicyImprove(): boolean {
    let retval: boolean = false;

    //#region Averaging the q-values

    //this.averageQValues = new Array<QValue<TState, TAction>>(); <-- don't clear the average Q-values. BAD for convergence (empirically observed)

    for (let i = 0; i < this.states.length; i++) {
      let state = this.states[i];
      for (let action of this.actions) {
        let qValueSum = 0; // sum of q-values for this state-action pair
        let n = 0; // counter for this q-values of this state-action pair
        for (const qValue of this.qvalues) {
          if (
            this.environment.AreStatesEqual(state, qValue.State) &&
            this.environment.AreActionsEqual(action, qValue.Action)
          ) {
            qValueSum += qValue.Value;
            n++;
          }
        }
        if (n > 0) this.averageQValues.SetValue(state, action, qValueSum / n); // populate the q-function with the average for each (s,a) pair
      }
    }
    //#endregion

    //#region Extracting new policy from the average q-values.
    for (let i = 0; i < this.states.length; i++) {
      let state = this.states[i];
      let bestQVal = this.averageQValues.ArgMaxAction(state)[1];
      let bestAction: TAction =
        this.averageQValues.ArgMaxAction(state)[0] ?? this.policy[i]; // default is the existing one

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
  private SampleEpisode() {
    const randomStateIndex = Math.floor(Math.random() * this.states.length);
    const randomActionIndex = Math.floor(Math.random() * this.actions.length);

    let state: TState = this.states[randomStateIndex];
    let action: TAction = this.actions[randomActionIndex];
    let qValue = 0;
    for (let i = 0; i < this.maxSteps; i++) {
      const rewardAndAction = this.environment.SimulateAction(state, action);
      state = rewardAndAction.state; // update state
      action = this.policy[this.FindIndexOfState(state)]; // update action
      qValue += Math.pow(this.discountGamma, i) * rewardAndAction.reward; // discounted reward accumulation
      if (this.environment.IsStateTerminal(state)) break; // if we've reached a terminal state, exit for
    }

    this.qvalues.push(
      new QValue(
        this.states[randomStateIndex],
        this.actions[randomActionIndex],
        qValue
      )
    ); // update the experience buffer. CAREFUL: the state and action must be the one we started with randomly - I got tripped up by this
  }

  private FindIndexOfState(state: TState): number {
    for (let i = 0; i < this.states.length; i++) {
      let thisState = this.states[i];
      if (this.environment.AreStatesEqual(thisState, state)) return i;
    }
    throw new Error("Given state not found!");
  }
}
