export default class Genre {
    public genre: string;
    public weight = 0;
    public verifid: boolean;
    public spoiler: boolean;
    constructor(genre: string, weight = 0, verifid = false, spoiler = false) {
        this.genre = genre;
        this.weight = weight;
        this.verifid = verifid;
        this.spoiler = spoiler;
    }
}
