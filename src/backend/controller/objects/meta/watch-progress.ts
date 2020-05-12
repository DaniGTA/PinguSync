export default class WatchProgress {
    public episode = -1;
    public played?: Date;
    public playCount = 1;
    constructor(episode: number, playCount?: number, played?: Date) {
        this.episode = episode;
        this.played = played;
        if (playCount) {
            this.playCount = playCount;
        }
    }
}
