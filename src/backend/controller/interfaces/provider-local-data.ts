import Banner from '../objects/meta/banner';
import Cover from '../objects/meta/cover';
import Episode from '../objects/meta/episode/episode';
import { EpisodeType } from '../objects/meta/episode/episode-type';
import Genre from '../objects/meta/genre';
import { MediaType } from '../objects/meta/media-type';
import Name from '../objects/meta/name';
import Overview from '../objects/meta/overview';

export default class ProviderLocalData {
    // ------------------
    //  Provider metadata stuff
    // ------------------

    /**
     * The version number of the data object.
     * If this get raised the client knows it needs too update his own data.
     */
    public version: number = 1;
    /**
     * Provider series id.
     */
    public id: number | string = -1;
    /**
     * Cant get more info from this provider.
     */
    public hasFullInfo: boolean = false;
    /**
     * The provider name
     */
    public readonly provider: string = '';
    /**
     * Saves the raw response from the provider
     *
     * This data can be very usefull in debug sessions.
     *
     * Info: This var has no logic its just data that sits here.
     */
    public rawEntry: any;
    /**
     * Saves the last update from the last refresh of the data.
     */
    public lastUpdate: Date = new Date();
    /**
     * Save the last update from the provider.
     */
    public lastExternalChange: Date = new Date(0);


    // ----------------------
    // Series metadata stuff
    // ----------------------

    public detailEpisodeInfo: Episode[] = [];
    public score?: number;
    public episodes?: number;
    public publicScore?: number;
    public covers: Cover[] = [];
    public banners: Banner[] = [];
    public mediaType: MediaType = MediaType.UNKOWN;
    public releaseYear?: number;
    public runTime?: number;
    public isNSFW = false;
    public targetSeason?: number;
    public country?: string;
    public genres: Genre[] = [];

    /**
     * Only fill this if provider give sequel ids and have different ids for every season.
     */
    public sequelIds: number[] = [];
    /**
     * Only fill this if provider give prequel ids and have different ids for every season.
     */
    public prequelIds: number[] = [];
    /**
     *
     * Alternative IDs from the same provider.
     * This prevents merging alternatives together.
     */
    public alternativeIds: number[] = [];

    /**
     * Protected
     */
    protected names: Name[] = [];
    protected overviews: Overview[] = [];

    public async getDetailedEpisodeLength(): Promise<number> {
        let length = 0;

        for (const episode of this.detailEpisodeInfo) {
            if (episode.type === EpisodeType.REGULAR_EPISODE || episode.type === EpisodeType.SPECIAL || episode.type === EpisodeType.UNKOWN) {
                length++;
            }
        }

        return length;
    }

    // ------------------
    //  Function section
    // ------------------

    /**
     * Prevents too have double entrys for same name.
     * @param infoProvider
     */
    public addSeriesName(...names: Name[]) {
        for (const name of names) {
            if (name && name.name && name.name !== 'null') {
                if (this.names.findIndex((x) => x.name === name.name && x.lang === x.lang) === -1) {
                    this.names.push(name);
                }
            }
        }
        if (names.length > 25) {
            console.log('.');
        }
    }

    /**
     * Adds an Overview too the Anime and prevents adding if overview is already present.
     * @param newOverview
     */
    public addOverview(...newOverviews: Overview[]): boolean {
        this.overviews = [...this.overviews];
        for (const newOverview of newOverviews) {


            if (this.overviews.findIndex((x) => x === newOverview) === -1) {
                this.overviews.push(newOverview);
                return true;
            }
        }
        return false;
    }

    /**
     * Returns all names that this provider have.
     *
     * DIRECT ACCESS IS FORBIDDEN TO PREVENT DOUBLE ENTRYS.
     */
    public getAllNames(): readonly Name[] {
        return Object.freeze([...this.names]);
    }

    /**
     * Returns all overviews that this provider have.
     *
     * DIRECT ACCESS IS FORBIDDEN TO PREVENT DOUBLE ENTRYS.
     */
    public getAllOverviews(): readonly Overview[] {
        return Object.freeze([...this.overviews]);
    }

    /**
     * Simple function that checks if the provider data is from media type movie.
     */
    public isMediaTypeMovie(): boolean {
        return this.mediaType === MediaType.MOVIE;
    }
}
