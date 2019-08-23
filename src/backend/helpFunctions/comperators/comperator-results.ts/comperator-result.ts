export default class ComperatorResult {
    matchAble = 0;
    matches = 0;
    isAbsolute: AbsoluteResult = AbsoluteResult.ABSOLUTE_NONE;
}


export enum AbsoluteResult {
    ABSOLUTE_NONE,
    ABSOLUTE_FALSE,
    ABSOLUTE_TRUE,
}
