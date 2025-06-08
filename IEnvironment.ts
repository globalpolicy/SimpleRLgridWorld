interface IEnvironment<TState, TAction> {
  SimulateAction(
    state: TState,
    action: TAction
  ): { reward: number; state: TState };

  AreStatesEqual(state1: TState, state2: TState): boolean;
  AreActionsEqual(action1: TAction, action2: TAction): boolean;
  IsStateTerminal(state:TState):boolean;

  GetStates(): Array<TState>;
  GetActions(): Set<TAction>;

}
