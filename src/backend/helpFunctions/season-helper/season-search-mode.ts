/**
 * Force a search mode.
 */
export enum SeasonSearchMode {
    /**
     * If no cached results are avaible it will perform all searches avaible to get the results.
     */
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
    PROVIDER_SEASON_VALUE_ONLY,
    /**
     * This will force the function to not perform any search just passthrough cached results.
     */
    NO_SEARCH,
    /**
     * This prevents the prequels/sequels to generate extra query requests.
     */
    NO_EXTRA_TRACE_REQUESTS,
}
