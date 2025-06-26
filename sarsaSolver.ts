class SarsaSolver<TState, TAction> implements ISolver<TAction> {
  private environment: IEnvironment<TState, TAction>;
  private discountGamma: number;
  private states: Array<TState>;
  private actions: Array<TAction>;
  private learningRateAlpha: number;
  private maxStepsPerEpisode: number;
  private minEpsilon: number; //

  private policy = new Policy<TState, TAction>();

  private qFunction = new QFunction<TState, TAction>();

  constructor(
    environment: IEnvironment<TState, TAction>,
    discountGamma: number = 0.99,
    learningRateAlpha: number = 0.5,
    maxStepsPerEpisode: number = 500,
    epsilon: number = 0.01
  ) {
    this.environment = environment;
    this.discountGamma = discountGamma;
    this.states = environment.GetStates();
    this.actions = Array.from(environment.GetActions());
    this.learningRateAlpha = learningRateAlpha;
    this.maxStepsPerEpisode = maxStepsPerEpisode;
    this.minEpsilon = epsilon;
  }

  Initialize(): void {
    this.policy = new Policy<TState, TAction>();
  }

  /**
   * Sweep through all the states, executing the current policy trajectory while performing action-value updates at each step along the way
   */
  PolicyEvaluate(): void {
    let runningEpsilon = 1; // this epsilon decays every episode

    for (let i = 0; i < this.states.length; i++) {
      runningEpsilon *= (this.states.length - i) / this.states.length; // decay

      let state = this.states[i];
      let action = this.policy.GetAction(state) ?? this.actions[0]; // the null-coalescing operation is for when the policy is empty

      let noOfSteps = 0;
      while (noOfSteps++ < this.maxStepsPerEpisode) {
        if (this.environment.IsStateTerminal(state)) break;

        const currentQValue = this.qFunction.GetValue(state, action) ?? 0; // 0 if the Q-function doesn't have this state-action pair yet

        const nextStateAndReward = this.environment.SimulateAction(
          state,
          action
        );
        const nextStateAction =
          Math.random() > Math.max(this.minEpsilon, runningEpsilon)
            ? this.policy.GetAction(nextStateAndReward.state) ?? this.actions[0]
            : this.actions[Math.floor(Math.random() * this.actions.length)];
        const nextStateQValue =
          this.qFunction.GetValue(nextStateAndReward.state, nextStateAction) ??
          0;

        const tdTarget =
          nextStateAndReward.reward + this.discountGamma * nextStateQValue;
        this.qFunction.SetValue(
          state,
          action,
          currentQValue + this.learningRateAlpha * (tdTarget - currentQValue)
        );

        state = nextStateAndReward.state;
        action = nextStateAction;
      }
    }
  }

  /**
   * Improve the working policy in place using the refined action-values (Q function) after the policy evaluation phase
   * @returns True if the policy changed
   */
  PolicyImprove(): boolean {
    let policyChanged = false;

    for (let i = 0; i < this.states.length; i++) {
      let state = this.states[i];
      let actionAndValue = this.qFunction.ArgMaxAction(state);
      let bestActionForState = actionAndValue[0] ?? this.actions[0];
      let currentActionForState =
        this.policy.GetAction(state) ?? this.actions[0];

      if (
        !this.environment.AreActionsEqual(
          currentActionForState,
          bestActionForState
        )
      ) {
        policyChanged = true;
        this.policy.SetAction(state, bestActionForState);
      }
    }

    return policyChanged;
  }

  get Policy(): TAction[] {
    let retval = new Array<TAction>();
    for (let i = 0; i < this.states.length; i++) {
      retval.push(this.policy.GetAction(this.states[i]) ?? this.actions[0]);
    }
    return retval;
  }

  set MaxStepsPerEpisode(maxSteps: number) {
    this.maxStepsPerEpisode = maxSteps;
  }

  set LearningRateAlpha(alpha: number) {
    this.learningRateAlpha = alpha;
  }

  set DiscountFactorGamma(gamma: number) {
    this.discountGamma = gamma;
  }

  set Epsilon(epsilon: number) {
    this.minEpsilon = epsilon;
  }
}
