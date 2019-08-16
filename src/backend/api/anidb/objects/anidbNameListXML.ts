export default interface AniDBNameListXML {
    animetitles: Animetitles;
}

interface Animetitles {
    anime: Anime[];
}

export interface Anime {
    _attributes: Attributes2;
    title: Title[];
}

export interface Title {
    _attributes: Attributes3;
    _text: string;
}

interface Attributes3 {
    'xml:lang': string;
    type: string;
}

interface Attributes2 {
    aid: string;
}

interface Declaration {
    _attributes: Attributes;
}

interface Attributes {
    version: string;
    encoding: string;
}
