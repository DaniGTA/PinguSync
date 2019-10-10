import ProviderLocalData from '../interfaces/provider-local-data';

export class StreamingProviderLocalData extends ProviderLocalData {
    public readonly provider: string;
    constructor(lp: string, id?: string | number) {
        super();
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
        if (id) {
            this.id = id;
        }
    }
}
