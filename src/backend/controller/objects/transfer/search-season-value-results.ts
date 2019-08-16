export default class SearchSeasonValueResult {
    season: number | undefined;
    foundType: string = 'NONE';
    constructor(seasonNumber: number | undefined, foundType: string) {
        this.season = seasonNumber;
        this.foundType = foundType;
    }
}