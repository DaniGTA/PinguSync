import NameProvider from '../api/nameProvider';
import AniDBNameList from '../api/anidb/anidbNameList';

export default class NameProviderController {
    private listOfNameProviders: NameProvider[] = [new AniDBNameList()];

    public getAllNameProviders(): NameProvider[] {
        return this.listOfNameProviders;
    }
}