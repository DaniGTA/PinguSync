import ExternalProvider from './external-provider';

/**
 * A mapping provider only give ids no information about a series.
 */
export default abstract class InfoProvider extends ExternalProvider {
    public abstract isOffline: boolean;
}
