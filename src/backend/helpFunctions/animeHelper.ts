import Anime from "../controller/objects/anime";

class AnimeHelper {
    public async isSameSeason(a: Anime, b: Anime): Promise<boolean> {
        if (typeof a.seasonNumber != 'undefined' && typeof b.seasonNumber != 'undefined') {
            if (a.seasonNumber == b.seasonNumber) {
                return true;
            }
        }
        return false;
    }
}

export default new AnimeHelper();