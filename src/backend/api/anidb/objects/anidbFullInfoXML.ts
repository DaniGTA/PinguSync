export interface AniDBAnimeFullInfo {
    _declaration?: Declaration;
    anime?:        AniDBAnimeAnime;
    error?:        Error;
}

export interface Declaration {
    _attributes: DeclarationAttributes;
}

export interface DeclarationAttributes {
    version:  string;
    encoding: string;
}

export interface AniDBAnimeAnime {
    _attributes:  PurpleAttributes;
    type:         Error;
    episodecount: Error;
    startdate:    Error;
    titles:       Titles;
    relatedanime: Relatedanime;
    picture:      Error;
    resources:    Resources;
    characters:   Characters;
    tags?:        Tags;
}

export interface PurpleAttributes {
    id:         string;
    restricted: string;
}

export interface Characters {
    character: Character[];
}

export interface Character {
    _attributes:   CharacterAttributes;
    rating:        Rating;
    name:          Error;
    gender:        Error;
    charactertype: Charactertype;
    description?:  Error;
    picture:       Error;
    seiyuu?:       Seiyuu;
}

export interface CharacterAttributes {
    id:     string;
    type:   PurpleType;
    update: Date;
}

export enum PurpleType {
    AppearsIn = "appears in",
    MainCharacterIn = "main character in",
    SecondaryCastIn = "secondary cast in",
}

export interface Charactertype {
    _attributes: CharactertypeAttributes;
    _text:       Text;
}

export interface CharactertypeAttributes {
    id: string;
}

export enum Text {
    Character = "Character",
    Organization = "Organization",
}

export interface Error {
    _text: string;
}

export interface Rating {
    _attributes: RatingAttributes;
    _text:       string;
}

export interface RatingAttributes {
    votes: string;
}

export interface Seiyuu {
    _attributes: SeiyuuAttributes;
    _text:       string;
}

export interface SeiyuuAttributes {
    id:      string;
    picture: string;
}

export interface Relatedanime {
    anime: RelatedanimeAnime[];
}

export interface RelatedanimeAnime {
    _attributes: FluffyAttributes;
    _text:       string;
}

export interface FluffyAttributes {
    id:   string;
    type: string;
}

export interface Resources {
    resource: Resource[];
}

export interface Resource {
    _attributes:    ResourceAttributes;
    externalentity: Externalentity;
}

export interface ResourceAttributes {
    type: string;
}

export interface Externalentity {
    identifier?: Error;
    url?:        Error;
}

export interface Tags {
    tag: Tag[];
}

export interface Tag {
    _attributes:  TagAttributes;
    name:         Error;
    description?: Error;
    picurl?:      Error;
}

export interface TagAttributes {
    id:            string;
    weight:        string;
    localspoiler:  string;
    globalspoiler: string;
    verified:      string;
    update:        Date;
    parentid?:     string;
    infobox?:      string;
}

export interface Titles {
    title: Title[];
}

export interface Title {
    _attributes: TitleAttributes;
    _text:       string;
}

export interface TitleAttributes {
    "xml:lang": string;
    type:       FluffyType;
}

export enum FluffyType {
    Main = "main",
    Official = "official",
    Synonym = "synonym",
}
