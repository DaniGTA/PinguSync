
import { MediaType } from '../../controller/objects/meta/media-type';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import timeHelper from '../../helpFunctions/time-helper';
import MultiProviderResult from './multi-provider-result';

export default abstract class ExternalProvider {
    public hasEpisodeTitleOnFullInfo = false;
    /**
     * If a series name should contain any letters that are not in the basic latin table it will not try to perform a name search.
     * Basic Latin table (UTF-8):
     * http://memory.loc.gov/diglib/codetables/42.html
     *
     * @memberof ExternalProvider
     */
    public supportOnlyBasicLatinForNameSearch = true;

    public abstract providerName: string;
    public abstract hasUniqueIdForSeasons: boolean;
    public abstract supportedMediaTypes: MediaType[];
    public abstract supportedOtherProvider: Array<(new () => ExternalProvider)>;
    public abstract potentialSubProviders: Array<(new () => ExternalProvider)>;
    public abstract version: number;

    protected requestRateLimitInMs = 400;

    private lastRequestTimestamp = 0;
    private requestCounter = 0;

    public abstract getMoreSeriesInfoByName(searchTitle: string, season?: number): Promise<MultiProviderResult[]>;
    public abstract getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult>;
    public abstract isProviderAvailable(): Promise<boolean>;

    public async waitUntilItCanPerfomNextRequest(): Promise<void> {
        await timeHelper.delay((this.lastRequestTimestamp + this.requestRateLimitInMs) - Date.now());
    }

    public informAWebRequest(): void {
        this.requestCounter++;
        this.lastRequestTimestamp = Date.now();
    }
}
