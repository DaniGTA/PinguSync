import providerSearchResult from "./provider-search-result";
import Name from '../../objects/meta/name';

export default class ProviderSearchResultManager{
    static addNewSearchResult(provider:string,searchedName:Name, result:boolean) {
        const psr = new providerSearchResult();
        psr.provider = provider;
        psr.searchString = searchedName.name;
        psr.searchStringLang = searchedName.lang;
        psr.searchStringType = searchedName.nameType.toString();
        psr.result = result;
        psr.searchStringLength = searchedName.name.length;
        psr.searchStringSearchAbleScore = Name.getSearchAbleScore(searchedName);
        psr.save();
    }
}