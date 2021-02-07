import ExternalInformationProvider from './external-information-provider';

/**
 * A name provider gives only a list of names.
 * That can be used to find other variants of the name.
 */
export default abstract class InfoProvider extends ExternalInformationProvider {
    /**
     * If the InfoProvider can provider infos without access the internet it is a offline provider.
     * That will result in much more Request to the Provider.
     *
     * @abstract
     * @type {boolean}
     * @memberof InfoProvider
     */
    public abstract isOffline: boolean;
}
