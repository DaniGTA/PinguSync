export default class SearchSeasonValueResult {
    season: number;
    foundType: string = 'NONE';
    constructor(seasonNumber: number, foundType: string) {
        this.season = seasonNumber;
        this.foundType = foundType;
    }
}
