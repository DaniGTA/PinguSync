
import { MediaType } from '../../controller/objects/meta/media-type';
import timeHelper from '../../helpFunctions/time-helper';

export default abstract class ExternalProvider {
    public abstract providerName: string;

    public abstract supportedMediaTypes: MediaType[];
    public abstract supportedOtherProvider: Array<(new () => ExternalProvider)>;
    public abstract potentialSubProviders: Array<(new () => ExternalProvider)>;
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
}
