export default class ComperatorResult {
    public matchAble: number = 0;
    public matches: number = 0;
    public isAbsolute: AbsoluteResult = AbsoluteResult.ABSOLUTE_NONE;
}


export enum AbsoluteResult {
    ABSOLUTE_NONE,
    ABSOLUTE_FALSE,
    ABSOLUTE_TRUE,
    /**
     * At this state it cant be absolute true.
     */
    NOT_ABSOLUTE_TRUE,
}
