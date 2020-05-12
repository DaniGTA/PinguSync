import ProviderLocalData from './interfaces/provider-local-data';

export class StreamingProviderLocalData extends ProviderLocalData {
    public version = 1;
    public readonly provider: string;
    constructor(id: string | number, lp?: string) {
        super(id);
        this.lastUpdate = new Date(Date.now());
        if (typeof lp === 'string') {
            this.provider = lp;
        } else if (typeof lp !== 'undefined') {
            // this.provider = lp.pr;
            // this.version = lp.version;
            this.provider = '';
        } else {
            this.provider = '';
        }
    }
}
