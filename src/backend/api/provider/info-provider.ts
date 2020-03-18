import ExternalInformationProvider from './external-information-provider';

/**
 * A name provider gives only a list of names.
 * That can be used to find other variants of the name.
 */
export default abstract class InfoProvider extends ExternalInformationProvider {
    public abstract isOffline: boolean;
}
