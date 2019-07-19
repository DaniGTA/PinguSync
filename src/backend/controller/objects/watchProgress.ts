export class WatchProgress {
    episode: number = -1;
    played?: Date;
    playCount: number = 1;
    constructor(episode: number, playCount?: number, played?: Date) {
        this.episode = episode;
        this.played = played;
        if (typeof playCount != 'undefined') {
            this.playCount = playCount;
        }
    }
}
