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