/**
 * Force a search mode.
 */
export enum SeasonSearchMode{
    ALL,
    /**
     * The Prequel trace mode will not perform a sequel trace, this prevents a loop.
     */
    PREQUEL_TRACE_MODE,
    /**
     * The Sequel trace mod will not perform prequel trace, this prevents a loop.
     */
    SEQUEL_TRACE_MODE,
    PREQUEL_TRACE_ONLY,
    SEQUEL_TRACE_ONLY,
    TITLE_ONLY,
    TRACE_ONLY,
    PROVIDER_SEASON_VALUE_ONLY
}