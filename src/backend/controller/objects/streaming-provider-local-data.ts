import ProviderLocalData from '../interfaces/provider-local-data';

export class StreamingProviderLocalData extends ProviderLocalData {
    public readonly provider: string;
    constructor(lp: string) {
        super();
        this.provider = lp;
    }
}
