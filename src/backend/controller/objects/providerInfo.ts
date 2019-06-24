import { ListProvider } from '../../api/ListProvider';
import { WatchStatus } from './anime';
import ProviderController from '../providerController';

export class ProviderInfo {
    public id: number;
    public readonly provider: string;
    public score?: number;
    public watchStatus: WatchStatus;
    public watchProgress: number;
    public rawEntry: any;
    constructor(lp: ListProvider) {
        this.provider = lp.providerName;
    }

    public getProviderInstance(): ListProvider {
        for (const provider of ProviderController.getInstance().list) {
            if (provider.providerName === this.provider) {
                return provider;
            }
        }
    }
}
