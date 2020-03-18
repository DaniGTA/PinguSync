export default interface AniDBNameListXML {
    animetitles: IAnimetitles;
}

interface IAnimetitles {
    anime: Anime[];
}

export interface Anime {
    _attributes: IAttributes2;
    title: Title[];
}

export interface Title {
    _attributes: IAttributes3;
    _text: string;
}

interface IAttributes3 {
    'xml:lang': string;
    type: string;
}

interface IAttributes2 {
    aid: string;
}

interface IDeclaration {
    _attributes: IAttributes;
}

interface IAttributes {
    version: string;
    encoding: string;
}
