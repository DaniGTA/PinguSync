import RelationSearchResults from './relation-search-results';

export default class SearchSeasonValueResult {
    season: number;
    foundType: string = 'NONE';
    searchResultDetails?: RelationSearchResults;
    constructor(seasonNumber: number, foundType: string,searchResultDetails?:RelationSearchResults) {
        this.season = seasonNumber;
        this.foundType = foundType;
        this.searchResultDetails = searchResultDetails;
    }
}
