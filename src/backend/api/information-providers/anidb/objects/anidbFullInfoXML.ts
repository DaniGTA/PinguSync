export interface AniDBAnimeFullInfo {
    _declaration: Declaration;
    anime: AniDBAnimeAnime;
}

export interface Declaration {
    _attributes: DeclarationAttributes;
}

export interface DeclarationAttributes {
    version: string;
    encoding: string;
}

export interface AniDBAnimeAnime {
    _attributes: PurpleAttributes;
    type: Description;
    episodecount: Description;
    startdate: Description;
    enddate: Description;
    titles: Titles;
    relatedanime?: Relatedanime;
    recommendations?: Recommendations;
    url?: Description;
    creators?: Creators;
    description?: Description;
    ratings: Ratings;
    picture: Description;
    resources: AnimeResources;
    tags?: Tags;
    characters?: Characters;
    episodes: Episodes;
    similaranime?: Similaranime;
}

export interface PurpleAttributes {
    id: string;
    restricted: string;
}

export interface Characters {
    character: Character[];
}

export interface Character {
    _attributes: CharacterAttributes;
    rating?: Rating;
    name: Description;
    gender: Description;
    charactertype: Charactertype;
    description?: Description;
    picture?: Description;
    seiyuu?: SeiyuuElement[] | SeiyuuElement;
}

export interface CharacterAttributes {
    id: string;
    type: PurpleType;
    update: Date;
}

export enum PurpleType {
    AppearsIn = 'appears in',
    MainCharacterIn = 'main character in',
    SecondaryCastIn = 'secondary cast in',
}

export interface Charactertype {
    _attributes: CharactertypeAttributes;
    _text: Text;
}

export interface CharactertypeAttributes {
    id: string;
}

export enum Text {
    Character = 'Character',
    Mecha = 'Mecha',
    Organization = 'Organization',
}

export interface Description {
    _text: string;
}

export interface Rating {
    _attributes: RatingAttributes;
    _text: string;
}

export interface RatingAttributes {
    votes: string;
}

export interface SeiyuuElement {
    _attributes: SeiyuuAttributes;
    _text: string;
}

export interface SeiyuuAttributes {
    id: string;
    picture: string;
}

export interface Creators {
    name: AttributeInfo[];
}

export interface AttributeInfo {
    _attributes: NameAttributes;
    _text: string;
}

export interface NameAttributes {
    id: string;
    type: string;
}

export interface Episodes {
    episode: EpisodeElement[] | PurpleEpisode;
}

export interface EpisodeElement {
    _attributes: EpisodeAttributes;
    epno: Epno;
    length: Description;
    airdate?: Description;
    rating?: Rating;
    title: TitleTitle[] | TitleTitle;
    summary?: Description;
    resources?: EpisodeResources;
}

export interface EpisodeAttributes {
    id: string;
    update: Date;
}

export interface Epno {
    _attributes: EpnoAttributes;
    _text: string;
}

export interface EpnoAttributes {
    type: string;
}

export interface EpisodeResources {
    resource: ResourcesResourceClass;
}

export interface ResourcesResourceClass {
    _attributes: EpnoAttributes;
    externalentity: PurpleExternalentity;
}

export interface PurpleExternalentity {
    identifier: Description[];
}

export interface TitleTitle {
    _attributes: FluffyAttributes;
    _text: string;
}

export interface FluffyAttributes {
    'xml:lang': XMLLang;
}

export enum XMLLang {
    Ar = 'ar',
    En = 'en',
    Fr = 'fr',
    Ja = 'ja',
    Th = 'th',
    XJat = 'x-jat',
}

export interface PurpleEpisode {
    _attributes: EpisodeAttributes;
    epno: Epno;
    length: Description;
    title: TitleTitle;
    airdate?: Description;
}

export interface Ratings {
    permanent: Permanent;
    temporary: Permanent;
    review?: Permanent;
}

export interface Permanent {
    _attributes: PermanentAttributes;
    _text: string;
}

export interface PermanentAttributes {
    count: string;
}

export interface Recommendations {
    _attributes: RecommendationsAttributes;
    recommendation: RecommendationElement[] | RecommendationElement;
}

export interface RecommendationsAttributes {
    total: string;
}

export interface RecommendationElement {
    _attributes: RecommendationAttributes;
    _text: string;
}

export interface RecommendationAttributes {
    type: FluffyType;
    uid: string;
}

export enum FluffyType {
    ForFans = 'For Fans',
    MustSee = 'Must See',
    Recommended = 'Recommended',
}

export interface Relatedanime {
    anime: AttributeInfo[] | AttributeInfo;
}

export interface AnimeResources {
    resource: ResourceElement[] | PurpleResource;
}

export interface ResourceElement {
    _attributes: EpnoAttributes;
    externalentity: ExternalentityElement[] | FluffyExternalentity;
}

export interface ExternalentityElement {
    identifier: Description;
}

export interface FluffyExternalentity {
    identifier?: Description[] | Description;
    url?: Description;
}

export interface PurpleResource {
    _attributes: EpnoAttributes;
    externalentity: ExternalentityElement;
}

export interface Similaranime {
    anime: AnimeElement[];
}

export interface AnimeElement {
    _attributes: TentacledAttributes;
    _text: string;
}

export interface TentacledAttributes {
    id: string;
    approval: string;
    total: string;
}

export interface Tags {
    tag: Tag[];
}

export interface Tag {
    _attributes: TagAttributes;
    name: Description;
    description?: Description;
    picurl?: Description;
}

export interface TagAttributes {
    id: string;
    parentid?: string;
    infobox?: string;
    weight: string;
    localspoiler: string;
    globalspoiler: string;
    verified: string;
    update: Date;
}

export interface Titles {
    title: TitlesTitle[];
}

export interface TitlesTitle {
    _attributes: StickyAttributes;
    _text: string;
}

export interface StickyAttributes {
    'xml:lang': string;
    type: TentacledType;
}

export enum TentacledType {
    Main = 'main',
    Official = 'official',
    Short = 'short',
    Synonym = 'synonym',
}
