import Season from '../../../../controller/objects/meta/season';
import EpisodeRange from './EpisodeRange';

export default class EregnyMapping {
    lastModified: Date = new Date();
    MyAnimeListID?: number;
    KitsuID?: number;
    AniListID?: number;
    range: EpisodeRange = new EpisodeRange(0, 0);
    constructor(public season: Season) { }
}