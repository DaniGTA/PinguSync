import ExternalMappingProvider from '../../../../api/provider/external-mapping-provider';
import ProviderLocalData from './interfaces/provider-local-data';

export class MappingProviderLocalData extends ProviderLocalData {
    public version = 1;
    public readonly provider: string;
    constructor(id: string | number, lp?: ExternalMappingProvider | string | (new () => ExternalMappingProvider)) {
        super(id);
        this.lastUpdate = new Date(Date.now());
        this.provider = this.getProviderName(lp);
    }
}
