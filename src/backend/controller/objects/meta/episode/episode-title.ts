export default class EpisodeTitle {
    public lang: string;
    public text: string;
    constructor(text: string, lang = 'UNKOWN') {
        this.text = text;
        this.lang = lang;
    }
}
