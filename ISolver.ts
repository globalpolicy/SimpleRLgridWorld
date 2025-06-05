interface ISolver<TAction>{
    Initialize():void;
    PolicyEvaluate():void;
    PolicyImprove():boolean;
    get Policy():Array<TAction>;
}