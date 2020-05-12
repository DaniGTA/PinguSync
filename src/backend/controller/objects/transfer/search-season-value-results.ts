import Season from '../meta/season';
import RelationSearchResults from './relation-search-results';
import { SeasonError } from './season-error';

/**
 * On a error the season number will be always undefined.
 */
export default class SearchSeasonValueResult {
    public season?: Season;
    public seasonError: SeasonError;
    public foundType = 'NONE';
    public searchResultDetails?: RelationSearchResults;
    constructor(seasonNumber: Season, foundType: string, seasonError: SeasonError = SeasonError.NONE, searchResultDetails?: RelationSearchResults) {
        if (seasonError === SeasonError.NONE) {
            this.season = seasonNumber;
        }
        this.foundType = foundType;
        this.seasonError = seasonError;
        this.searchResultDetails = searchResultDetails;
    }
}
