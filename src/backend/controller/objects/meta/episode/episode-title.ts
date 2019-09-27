export default class EpisodeTitle{
    lang: string;
    text: string;
    constructor(text: string, lang = 'UNKOWN') {
        this.text = text;
        this.lang = lang;
    }
}