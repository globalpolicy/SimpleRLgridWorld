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

  /**
   * Obtain the action in the specified state that has the highest value
   * @param state The state to obtain the argmax over actions for
   * @returns A tuple of the best action and its corresponding value
   */
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