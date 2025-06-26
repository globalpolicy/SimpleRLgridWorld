class Policy<TState, TAction> {
  private policyMap = new Map<string, TAction>();

  public SetAction(state: TState, action: TAction) {
    this.policyMap.set(JSON.stringify(state), action);
  }

  public GetAction(state: TState): TAction | undefined {
    return this.policyMap.get(JSON.stringify(state));
  }
}
