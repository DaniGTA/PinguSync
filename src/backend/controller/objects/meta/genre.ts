export default class Genre{
    genre: string;
    weight: number = 0;
    verifid: boolean;
    spoiler: boolean;
    constructor(genre: string, weight = 0, verifid = false, spoiler = false) {
        this.genre = genre;
        this.weight = weight;
        this.verifid = verifid;
        this.spoiler = spoiler;
    }
}