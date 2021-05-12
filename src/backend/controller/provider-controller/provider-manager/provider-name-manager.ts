import ExternalProvider from '../../../api/provider/external-provider'
import ProviderList from './provider-list'

export default class ProviderNameManager {
    public static getProviderName<A extends ExternalProvider>(c: ExternalProvider | (new () => A) | string): string {
        if (typeof c === 'string') {
            return c
        } else if (c instanceof ExternalProvider) {
            return c.providerName
        } else {
            return ProviderList.getProviderNameByClass(c)
        }
    }

    public static getProviderVersion<A extends ExternalProvider>(c: new () => A): number {
        return ProviderList.getProviderInstanceByClass(c).version
    }

    public static getProviderNameByString(lp?: ExternalProvider | (new () => ExternalProvider) | string): string {
        if (lp) {
            if (typeof lp === 'string') {
                return lp
            } else if (lp instanceof ExternalProvider) {
                return lp.providerName
            } else {
                return ProviderNameManager.getProviderName(lp)
            }
        } else {
            return ''
        }
    }
}
