import Series from '../../controller/objects/series';
import SameIdAndUniqueId from './same-id-and-unique-id';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import Name from '../../controller/objects/meta/name';
import InfoProvider from '../../api/info-provider';
import ListProvider from '../../api/list-provider';
import ProviderList from '../../controller/provider-manager/provider-list';
import ListController from '../../controller/list-controller';
import timeHelper from '../time-helper';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import listHelper from '../list-helper';
import ProviderSearchResultManager from '../../controller/stats-manager/models/provider-search-result-manager';
import { MediaType } from '../../controller/objects/meta/media-type';
import stringHelper from '../string-helper';
import MultiProviderResult from '../../api/multi-provider-result';
import seriesHelper from '../series-helper';
import titleCheckHelper from '../title-check-helper';

export default new class ProviderHelper {
    public async checkListProviderId(a: Series, b: Series): Promise<SameIdAndUniqueId> {
        try {
            for (let aProvider of a.getListProvidersInfos()) {
                for (const bProvider of b.getListProvidersInfos()) {
                    if (aProvider.provider === bProvider.provider && aProvider.id === bProvider.id) {
                        if (aProvider.targetSeason === bProvider.targetSeason) {
                            aProvider = Object.assign(new ListProviderLocalData(), aProvider);
                            return new SameIdAndUniqueId(true, aProvider.getProviderInstance().hasUniqueIdForSeasons);
                        }
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
        return new SameIdAndUniqueId();
    }

    public async hasSameListProvider(a: Series, b: Series): Promise<boolean> {
        try {
            for (let aProvider of a.getListProvidersInfos()) {
                for (const bProvider of b.getListProvidersInfos()) {
                    if (aProvider.provider === bProvider.provider) {
                        return true;
                    }
                }
            }

        } catch (err) {
            console.log(err);
        }
        return false;
    }

    public async hasSameInfoProvider(a: InfoProviderLocalData[], b: InfoProviderLocalData[]): Promise<boolean> {
        try {
            for (let aProvider of a) {
                for (const bProvider of b) {
                    if (aProvider.provider === bProvider.provider) {
                        return true;
                    }
                }
            }

        } catch (err) {
            console.log(err);
        }
        return false;
    }

    public async getProviderSeriesInfo(series: Series, provider: ListProvider | InfoProvider): Promise<Series> {
        const seriesMediaType = await series.getMediaType();
        if (seriesMediaType === MediaType.UNKOWN || provider.supportedMediaTypes.includes(seriesMediaType)) {
            let names = await series.getAllNames();
            names = names.sort((a, b) => Name.getSearchAbleScore(b) - Name.getSearchAbleScore(a));
            names = await listHelper.getLazyUniqueStringList(names);
            const alreadySearchedNames: string[] = [];
            //Test
            names.unshift(new Name(await stringHelper.cleanString(names[0].name), names[0].lang + 'clean', names[0].nameType))

            for (const name of names) {
                const alreadySearchedName = alreadySearchedNames.findIndex(x => name.name === x) !== -1;
                if (!alreadySearchedName && name.name) {
                    console.log("[" + provider.providerName + "] Request (Search series info by name) with value: " + name.name);
                    try {
                        let results = [];
                        const allLocalProviders = series.getAllProviderLocalDatas();
                        const indexOfCurrentProvider = allLocalProviders.findIndex(x => x.provider === provider.providerName);
                        if (indexOfCurrentProvider === -1) {
                            results = await provider.getMoreSeriesInfoByName(name.name, await series.getSeason());
                        } else {
                            const result = await provider.getFullInfoById(allLocalProviders[indexOfCurrentProvider] as InfoProviderLocalData);
                            console.log("[" + provider.providerName + "] ID Request success 🎉");
                            ProviderSearchResultManager.addNewSearchResult(provider.providerName, name, true, seriesMediaType, result.mainProvider.id.toString());
                            await series.addProviderDatas(result.mainProvider, ...result.subProviders);
                            return series;
                        }
                        if (results) {
                            for (const result of results) {
                                if (await this.checkIfProviderIsValid(series, result)) {
                                    console.log("[" + provider.providerName + "] Request success 🎉");
                                    ProviderSearchResultManager.addNewSearchResult(provider.providerName, name, true, seriesMediaType, result.mainProvider.id.toString());
                                    await series.addProviderDatas(result.mainProvider, ...result.subProviders);
                                    return series;
                                }
                            }
                        }
                    } catch (err) { }
                    ProviderSearchResultManager.addNewSearchResult(provider.providerName, name, false, seriesMediaType);
                    alreadySearchedNames.push(name.name);
                }
            }
        }

        console.log("[" + provider.providerName + "] Request failed ☹");
        throw 'no series info found by name';
    }

    public async checkIfProviderIsValid(series: Series, result: MultiProviderResult): Promise<boolean> {
        const tempSeries = new Series();
        await tempSeries.addProviderDatas(result.mainProvider, ...result.subProviders);
        const seasonA = await series.getSeason();
        const seasonB = await tempSeries.getSeason();
        if (await titleCheckHelper.checkSeriesNames(series, tempSeries)) {
            if (result.mainProvider.getExternalProviderInstance().hasUniqueIdForSeasons) {
                if (seasonA) {
                    if (seasonA === seasonB) {
                        return true;
                    } else if (!seasonB && seasonA === 1) {
                        return true;
                    }
                } else {
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;
    }

    /**
     * Fill missing providers in a Series.
     * It wold not update a provider
     */
    public async fillListProvider(entry: Series, forceUpdate = false): Promise<Series> {
        entry = Object.assign(new Series(), entry);
        if (entry.getListProvidersInfos().length != ProviderList.getListProviderList().length || forceUpdate) {
            for (const provider of ProviderList.getListProviderList()) {
                var result = undefined;
                // Check if anime exist in main list and have already all providers in.
                const mainListEntry = await new ListController().checkIfProviderExistInMainList(entry, provider);
                if (mainListEntry) {
                    const mainListResult = mainListEntry.getListProvidersInfos().find(x => x.provider === provider.providerName);
                    if (mainListResult && mainListResult.version === provider.version) {
                        continue;
                    } else {
                        entry = mainListEntry;
                    }
                }

                try {
                    result = entry.getListProvidersInfos().find(x => x.provider === provider.providerName);
                } catch (err) { }
                if (result || forceUpdate) {
                    if (!forceUpdate) {

                    }
                    try {
                        entry = await this.getProviderSeriesInfo(entry, provider);
                    } catch (err) {
                        console.log(err);
                    }
                    await timeHelper.delay(700);
                } else {
                    entry = await this.getProviderSeriesInfo(entry, provider);
                }
            }
        }
        return entry;
    }
}
