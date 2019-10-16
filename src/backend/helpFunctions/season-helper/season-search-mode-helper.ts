import { SeasonSearchMode } from './season-search-mode';

export default class SeasonSearchModeHelper {
    /**
     * Checks if the search mode is able to perform a title search.
     * @param searchMode
     */
    public static canPerformATitleSearch(searchMode: SeasonSearchMode): boolean {
        switch (searchMode) {
            case SeasonSearchMode.ALL:
                return true;
            case SeasonSearchMode.PREQUEL_TRACE_MODE:
                return true;
            case SeasonSearchMode.SEQUEL_TRACE_MODE:
                return true;
            case SeasonSearchMode.TITLE_ONLY:
                return true;
            case SeasonSearchMode.NO_EXTRA_TRACE_REQUESTS:
                return true;
            default:
                return false;
        }
    }

    /**
     * Checks if the search mode is able to perform a prequel trace.
     * @param searchMode
     */
    public static canPerformAPrequelTrace(searchMode: SeasonSearchMode): boolean {
        switch (searchMode) {
            case SeasonSearchMode.ALL:
                return true;
            case SeasonSearchMode.PREQUEL_TRACE_MODE:
                return true;
            case SeasonSearchMode.PREQUEL_TRACE_ONLY:
                return true;
            case SeasonSearchMode.TRACE_ONLY:
                return true;
            case SeasonSearchMode.NO_EXTRA_TRACE_REQUESTS:
                return true;
            default:
                return false;
        }
    }

    /**
     * Checks if the search mode is able to perform a sequel trace.
     * @param searchMode
     */
    public static canPerformASequelTrace(searchMode: SeasonSearchMode): boolean {
        switch (searchMode) {
            case SeasonSearchMode.ALL:
                return true;
            case SeasonSearchMode.SEQUEL_TRACE_MODE:
                return true;
            case SeasonSearchMode.SEQUEL_TRACE_ONLY:
                return true;
            case SeasonSearchMode.TRACE_ONLY:
                return true;
            case SeasonSearchMode.NO_EXTRA_TRACE_REQUESTS:
                return true;
            default:
                return false;
        }
    }

    /**
     * Checks if the search mode is able to perform a seaon value search.
     * @param searchMode
     */
    public static canPerformAProviderSeasonValueSearch(searchMode: SeasonSearchMode): boolean {
        switch (searchMode) {
            case SeasonSearchMode.ALL:
                return true;
            case SeasonSearchMode.SEQUEL_TRACE_MODE:
                return true;
            case SeasonSearchMode.PREQUEL_TRACE_MODE:
                return true;
            case SeasonSearchMode.PROVIDER_SEASON_VALUE_ONLY:
                return true;
            case SeasonSearchMode.NO_EXTRA_TRACE_REQUESTS:
                return true;
            default:
                return false;
        }
    }
}
