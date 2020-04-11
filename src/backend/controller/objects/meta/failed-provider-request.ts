import ExternalProvider from '../../../api/provider/external-provider';
import { FailedRequestError } from './failed-request';

export default class FailedProviderRequest {
    public providerName: string;
    public providerVersion: number;
    public error: FailedRequestError;
    public timestamp: number;

    constructor(provider: ExternalProvider, error: FailedRequestError) {
        this.providerName = provider.providerName;
        this.providerVersion = provider.version;
        this.error = error;
        this.timestamp = new Date().getTime();
    }
}
