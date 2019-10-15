import ExternalProvider from '../../api/provider/external-provider';

export default class ProviderNameManager {
    public getProviderName<A extends ExternalProvider>(c: new () => A): string{
        return this.createInstance(c).providerName;
    }
    private createInstance<A extends ExternalProvider>(c: new () => A): A {
        return new c();
    }
}
