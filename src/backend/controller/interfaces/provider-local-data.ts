import Cover from '../objects/meta/cover';
import Banner from '../objects/meta/banner';
import { MediaType } from '../objects/meta/media-type';
import Name from '../objects/meta/name';
import Overview from '../objects/meta/overview';
import ExternalProvider from '../../api/external-provider';
import ProviderList from '../provider-manager/provider-list';

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
     * Cant get more info from this provider. 
     */
    public fullInfo: boolean = true;
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
    public mediaType: MediaType = MediaType.UNKOWN;
    public releaseYear?: number;
    public runTime?: number;
    protected names: Name[] = [];
    protected overviews: Overview[] = [];
    public isNSFW = false;


    public sequelIds: number[] = [];
    public prequelIds: number[] = [];

    /**
* Prevents too have double entrys for same name.
* @param infoProvider 
*/
    public addSeriesName(...names: Name[]) {
        for (const name of names) {
            if (name && name.name && name.name != 'null') {
                if (this.names.findIndex(x => x.name === name.name && x.lang === x.lang) === -1) {
                    this.names.push(name);
                }
            }
        }
        if (names.length > 25) {
            console.log(".");
        }
    }

    /**
     * Adds an Overview too the Anime and prevents adding if overview is already present.
     * @param newOverview 
     */
    public addOverview(...newOverviews: Overview[]): boolean {
        this.overviews = [...this.overviews];
        for (const newOverview of newOverviews) {


            if (this.overviews.findIndex(x => x == newOverview) == -1) {
                this.overviews.push(newOverview);
                return true;
            }
        }
        return false;
    }

    getAllNames(): Name[] {
        return this.names;
    }

    getAllOverviews(): Overview[] {
        return this.overviews;
    }
    public getExternalProviderInstance(): ExternalProvider {
        for (const provider of ProviderList.getListProviderList()) {
            if (provider.providerName === this.provider) {
                return provider;
            }
        }
        for (const provider of ProviderList.getInfoProviderList()) {
            if (provider.providerName === this.provider) {
                return provider;
            }
        }
        throw 'NoProviderFound';
    }
}
