
import { MediaType } from '../../controller/objects/meta/media-type';
import timeHelper from '../../helpFunctions/time-helper';
import ExternalInformationProvider from './external-information-provider';
import ApiKeyController from '../../controller/key/api-key-controller';

export default abstract class ExternalProvider {
    public abstract providerName: string;

    public abstract supportedMediaTypes: MediaType[];
    public abstract supportedOtherProvider: Array<(new () => ExternalInformationProvider)>;
    public abstract potentialSubProviders: Array<(new () => ExternalInformationProvider)>;
    public abstract version: number;

    protected requestRateLimitInMs = 400;

    private lastRequestTimestamp = 0;
    private requestCounter = 0;

    public abstract isProviderAvailable(): Promise<boolean>;

    public async waitUntilItCanPerfomNextRequest(): Promise<void> {
        await timeHelper.delay((this.lastRequestTimestamp + this.requestRateLimitInMs) - Date.now());
    }

    public informAWebRequest(): void {
        this.requestCounter++;
        this.lastRequestTimestamp = Date.now();
    }

    protected getApiSecret(): string | undefined {
        return ApiKeyController.getApiSecret(this.providerName);
    }

    protected getApiId(): string | undefined {
        return ApiKeyController.getApiId(this.providerName);
    }
}
