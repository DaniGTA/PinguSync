import Season from '../../controller/objects/meta/season';
export default class SeasonHelper {

    public static isSeasonFirstSeason(season?: Season): boolean {
        if (season?.isSeasonNumberPresent() && season.seasonNumbers.includes(1)) {
            if (season.seasonPart === 1 || season.seasonPart === undefined) {
                return true;
            }
        }
        return false;
    }

    public static isSeasonUndefined(currentSeason?: Season): boolean {
        if (currentSeason === undefined) {
            return true;
        }
        return currentSeason.isSeasonUndefined();
    }
}
