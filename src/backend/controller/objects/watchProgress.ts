export class WatchProgress {
    episode: number = -1;
    played?: Date;
    playCount: number = 1;
    constructor(episode: number, played?: Date, playCount?: number) {
        this.episode = episode;
        this.played = played;
        if (typeof playCount != 'undefined') {
            this.playCount = playCount;
        }
    }
}
