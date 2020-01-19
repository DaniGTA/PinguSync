export default class EpisodeRelationResult {
    public seasonNumber: number;
    public episodes: number;
    public missingEpisodes: number;
    public episodesFound: number;
    public seasonComplete: boolean;
    public maxEpisodeNumberFound: number;
    public maxDifference: number;

    constructor(seasonNumber: number, episodes: number, episodesFound: number, maxEpisodeNumberFound: number, maxDifference: number) {
        this.seasonNumber = seasonNumber;
        this.episodesFound = episodesFound;
        this.episodes = episodes;
        this.maxEpisodeNumberFound = maxEpisodeNumberFound;
        this.missingEpisodes = episodes - episodesFound;
        this.maxDifference = maxDifference;
        this.seasonComplete = episodes === maxDifference + maxEpisodeNumberFound;
    }
}
