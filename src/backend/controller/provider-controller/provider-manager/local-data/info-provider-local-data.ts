import InfoProvider from '../../../../api/provider/info-provider';
import ProviderList from '../provider-list';
import ProviderNameManager from '../provider-name-manager';
import ProviderLocalData from './interfaces/provider-local-data';
/**
 * Only contains infos about the series.
 */
export class InfoProviderLocalData extends ProviderLocalData {
    public static async mergeProviderInfos(...providers: InfoProviderLocalData[]): Promise<InfoProviderLocalData> {
        const finalProvider = await this.mergeProviderLocalData(...providers) as InfoProviderLocalData;
        return Object.assign(new InfoProviderLocalData(finalProvider.id), finalProvider);
    }
    public readonly provider: string;
    public version = 1;
    constructor(id: string | number, lp?: InfoProvider | string | (new () => InfoProvider)) {
        super(id);
        this.lastUpdate = new Date(Date.now());
        if (lp) {
            if (typeof lp === 'string') {
                this.provider = lp;
            } else if (lp instanceof InfoProvider) {
                this.provider = lp.providerName;
                this.version = lp.version;
            } else {
                this.provider = ProviderNameManager.getProviderName(lp);
            }
        } else {
            this.provider = '';
        }
    }

    public getProviderInstance(): InfoProvider {
        for (const provider of ProviderList.getInfoProviderList()) {
            if (provider.providerName === this.provider) {
                return provider;
            }
        }
        throw new Error('[InfoProviderLocalData] NoProviderFound: ' + this.provider);
    }
}
