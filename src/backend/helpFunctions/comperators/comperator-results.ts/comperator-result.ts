export enum AbsoluteResult {
    ABSOLUTE_NONE,
    ABSOLUTE_FALSE,
    ABSOLUTE_TRUE,
    /**
     * At this state it cant be absolute true.
     */
    NOT_ABSOLUTE_TRUE,
}

export default class ComperatorResult {
    public matchAble = 0;
    public matches = 0;
    public isAbsolute: AbsoluteResult = AbsoluteResult.ABSOLUTE_NONE;
}
