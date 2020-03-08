export default class EpisodeRelationResult {

    public maxEpisodeNumberOfSeasonHolder: number | undefined;
    public minEpisodeNumberOfSeasonHolder: number | undefined;

    public minEpisodeNumberOfCurrentSeason: number | undefined;

    public missingEpisodes: number;
    public seasonComplete: boolean;

    private toleranze = 1;
    constructor(
        public seasonNumber: number[] | undefined,
        public episodes: number,
        public episodesFound: number,
        public maxEpisodeNumberFound: number,
        public maxDifference: number) {

        this.seasonNumber = seasonNumber;
        this.episodesFound = episodesFound;
        this.episodes = episodes;
        this.maxEpisodeNumberFound = maxEpisodeNumberFound;
        this.missingEpisodes = episodes - episodesFound;
        this.maxDifference = maxDifference;
        this.seasonComplete = (episodes === maxDifference + maxEpisodeNumberFound) || this.missingEpisodes === this.toleranze;
    }
}
