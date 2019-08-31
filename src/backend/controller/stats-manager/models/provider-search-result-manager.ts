import providerSearchResult from "./provider-search-result";
import Name from '../../objects/meta/name';
import { MediaType } from '../../objects/meta/media-type';

export default class ProviderSearchResultManager {
    static addNewSearchResult(provider: string, searchedName: Name, result: boolean, seriesMediaType: MediaType, providerId?: string) {
        const psr = new providerSearchResult();
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
