import ExternalProvider from './external-provider';

/**
 * A name provider gives only a list of names.
 * That can be used to find other variants of the name.
 */
export default interface IInfoProvider extends ExternalProvider {
    isOffline: boolean;
}
