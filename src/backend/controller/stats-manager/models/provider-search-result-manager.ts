import { MediaType } from '../../objects/meta/media-type';
import Name from '../../objects/meta/name';
import providerSearchResult from './provider-search-result';

export default class ProviderSearchResultManager {
    static addNewSearchResult(results: number, searchId: string, trys: number, provider: string, searchedName: Name, result: boolean, seriesMediaType: MediaType, providerId?: string) {
        const psr = new providerSearchResult();
        psr.searchId = searchId;
        psr.trys = trys;
        psr.results = results;
        psr.provider = provider;
        psr.searchString = searchedName.name;
        psr.searchStringLang = searchedName.lang;
        psr.searchStringType = searchedName.nameType.toString();
        psr.result = result;
        psr.searchStringLength = searchedName.name.length;
        psr.searchMediaType = seriesMediaType;
        psr.searchStringSearchAbleScore = Name.getSearchAbleScore(searchedName);
        psr.providerId = providerId;

        psr.save();
    }
}
