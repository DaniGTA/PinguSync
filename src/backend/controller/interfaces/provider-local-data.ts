import Cover from '../objects/meta/cover';
import Banner from '../objects/meta/banner';

export default class ProviderLocalData {
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
     * The provider name
     */
    public readonly provider: string = '';
    /**
     * Saves the raw response from the provider
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

    /**
     * ----------------------
     ** Series metadata stuff
     * ----------------------
    */

    public score?: number;
    public episodes?: number;
    public publicScore?: number;
    public covers: Cover[] = [];
    public banners: Banner[] = [];

    public sequelIds: number[] = [];
    public prequelIds: number[] = [];
}
