export default class EpisodeRelationResult {
    public seasonNumber: number;
    public episodes: number;
    public missingEpisodes: number;
    public episodesFound: number;
    public seasonComplete: boolean;

    constructor(seasonNumber: number, episodes: number, episodesFound: number) {
        this.seasonNumber = seasonNumber;
        this.episodesFound = episodesFound;
        this.episodes = episodes;

        this.missingEpisodes = episodes - episodesFound;
        this.seasonComplete = episodes === episodesFound;
    }
}
