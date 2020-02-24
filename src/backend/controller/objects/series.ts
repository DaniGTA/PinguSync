import ProviderComperator from '../../helpFunctions/comperators/provider-comperator';
import SeasonComperator from '../../helpFunctions/comperators/season-comperator';
import EpisodeMappingHelper from '../../helpFunctions/episode-mapping-helper/episode-mapping-helper';
import listHelper from '../../helpFunctions/list-helper';
import titleCheckHelper from '../../helpFunctions/name-helper/title-check-helper';
import PrequelGeneratorHelper from '../../helpFunctions/prequel-generator-helper';
import seasonHelper from '../../helpFunctions/season-helper/season-helper';
import { SeasonSearchMode } from '../../helpFunctions/season-helper/season-search-mode';
import stringHelper from '../../helpFunctions/string-helper';
import logger from '../../logger/logger';
import MainListAdder from '../main-list-manager/main-list-adder';
import MainListManager from '../main-list-manager/main-list-manager';
import MainListSearcher from '../main-list-manager/main-list-searcher';
import { ProviderInfoStatus } from '../provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../provider-manager/local-data/list-provider-local-data';
import ProviderList from '../provider-manager/provider-list';
import SeriesProviderExtension from './extension/provider-extension/series-provider-extension';
import { MergeTypes } from './merge-types';
import Cover from './meta/cover';
import Episode from './meta/episode/episode';
import EpisodeBindingPool from './meta/episode/episode-binding-pool';
import EpisodeMapping from './meta/episode/episode-mapping';
import { ImageSize } from './meta/image-size';
import { MediaType } from './meta/media-type';
import Name from './meta/name';
import { NameType } from './meta/name-type';
import Overview from './meta/overview';
import Season from './meta/season';
import WatchProgress from './meta/watch-progress';
import RelationSearchResults from './transfer/relation-search-results';
import { SeasonError } from './transfer/season-error';
export default class Series extends SeriesProviderExtension {
    public static version = 1;

    public packageId: string = '';
    public id: string = '';
    public lastUpdate: number = Date.now();
    public lastInfoUpdate: number = 0;

    public episodeBindingPools: EpisodeBindingPool[] = [];

    private cachedSeason?: Season;
    private cachedMediaType?: MediaType;
    private seasonDetectionType: string = '';
    private canSync: boolean | null = null;

    private firstSeasonSeriesId?: string;

    constructor() {
        super();
        // Generates randome string.
        this.id = stringHelper.randomString(35);
        this.cachedSeason = new Season();
    }

    public async resetCache() {
        this.cachedMediaType = undefined;
        this.cachedSeason = undefined;
        this.seasonDetectionType = '';
        this.firstSeasonSeriesId = undefined;
    }

    public async getSlugNames(): Promise<Name[]> {
        const slugs = [];
        const names = this.getAllNames();
        for (const name of names) {
            if (name.nameType === NameType.SLUG) {
                slugs.push(name);
            }
        }
        return listHelper.getUniqueNameList(slugs);
    }

    /**
     * It prevent double entrys from all names.
     */
    public async getAllNamesUnique(): Promise<Name[]> {
        const names = this.getAllNames();
        return listHelper.getUniqueNameList(names);
    }
    /**
     * Get all names from all Providers.
     * ! It can contain double entrys.
     */
    public getAllNames(): Name[] {
        const names = [];
        for (const provider of this.getAllProviderLocalDatas()) {
            try {
                names.push(...provider.getAllNames());
            } catch (err) {
                logger.error('[NAME] [GET]: Failed to add Name on name request. SeriesID: ' + this.id);
            }
        }
        return names;
    }

    public getAllNamesSeasonAware() {
        const names = [];
        for (const provider of this.getAllProviderLocalDatasWithSeasonInfo()) {
            try {
                const instance = ProviderList.getExternalProviderInstance(provider);
                if (!instance.hasUniqueIdForSeasons) {
                    if (!SeasonComperator.isSameSeason(provider.seasonTarget, new Season([1]))) {
                        continue;
                    }
                }
                try {
                    names.push(...provider.providerLocalData.getAllNames());
                } catch (err) {
                    logger.error('[NAME] [GET]: Failed to add Name on name request. SeriesID: ' + this.id);
                }
            } catch (err) {
                logger.debug('[Series] [getAllNamesSeasonAware] -> provider instance not found: ' + provider);
            }
        }
        return names;
    }

    /**
     * Get all overviews
     * + It prevents double entrys.
     */
    public async getAllOverviews(): Promise<Overview[]> {
        const overviews = this.getAllProviderLocalDatas().flatMap((provider) => provider.getAllOverviews());
        return listHelper.getUniqueOverviewList(overviews);
    }

    public addEpisodeMapping(...episodeMappings: EpisodeMapping[]): void {
        const existingBindingPool = this.findExistingBindingPoolByEpisodeMapping(...episodeMappings);
        if (existingBindingPool) {
            existingBindingPool.addEpisodeMappingToBindings(...episodeMappings);
        } else {
            const newBindingPool = new EpisodeBindingPool(...episodeMappings);
            this.episodeBindingPools.push(newBindingPool);
        }
    }

    public addEpisodeBindingPools(...bindingPools: EpisodeBindingPool[]) {
        for (const bindingPool of bindingPools) {
            this.addEpisodeMapping(...bindingPool.bindedEpisodeMappings);
        }
    }

    public findExistingBindingPoolByEpisodeMapping(...episodeMappings: EpisodeMapping[]): EpisodeBindingPool | null {
        for (const bindingPool of this.episodeBindingPools) {
            for (const episodeMapping of episodeMappings) {
                if (bindingPool.bindingPoolHasEpisodeMapping(episodeMapping)) {
                    return bindingPool;
                }
            }
        }
        return null;
    }

    /**
     * Get a Cover image of a prefered size.
     *
     * If the prefered size can not be found it will search of a lower size.
     *
     * If the series have no covers then it will return [null].
     *
     * @param preferedSize default: LARGE
     */
    public getCoverImage(preferedSize: ImageSize = ImageSize.LARGE): Cover | null {
        logger.debug('[Cover] [Serve]: Serve Cover Image');
        const ressources: ProviderLocalData[] = [...this.getListProvidersInfos(), ...this.getInfoProvidersInfos()];
        let result: Cover | null = null;
        for (const listProvider of ressources) {
            if (listProvider.covers && listProvider.covers.length !== 0) {
                for (const cover of listProvider.covers) {
                    if (result == null) {
                        result = cover;
                    } else if (result.size < preferedSize) {
                        result = cover;
                    }
                }
            }
        }
        return result;
    }

    /**
     * It get the max number of that anime.
     */
    public getMaxEpisode(): number {
        logger.debug('[Episode] [Serve]: Serve Max Episodes');
        const providers = this.getAllProviderLocalDatas();
        const array = (providers.flatMap((x) => x.episodes) as number[]);
        const onlyNumbers = array.filter((v) => Number.isInteger(v as number));
        if (onlyNumbers.length === 0) {
            throw new Error('[Series] no episode found SeriesID: ' + this.id);
        }
        return Math.max(...onlyNumbers);
    }

    /**
     *
     */
    public getAllDetailedEpisodes(): Episode[] {
        const providers = this.getAllProviderLocalDatas();
        const array = providers.flatMap((x) => x.detailEpisodeInfo);
        return array;
    }


    /**
     * Give an array of all episodes in numbers.
     */
    public async getAllEpisodes(): Promise<number[]> {
        logger.debug('[Episode] [Serve]: Serve all Episodes');
        let result;
        try {
            result = await listHelper.cleanArray(this.getAllProviderLocalDatas().flatMap((x) => x.episodes));
        } catch (e) {
            logger.error(e);
        }
        if (result) {
            return listHelper.getUniqueList(result as number[]);
        }
        throw new Error('no episode found SeriesID: ' + this.id);
    }

    /**
     * Returns the Season of the Anime based on Season entry or name.
     * @hasTest
     */
    public async getSeason(searchMode: SeasonSearchMode = SeasonSearchMode.ALL, searchInList?: readonly Series[] | Series[], allowAddNewEntry = true): Promise<Season> {
        logger.debug('[Season] [Serve]: Serve Season');
        if (!this.cachedSeason?.isSeasonNumberPresent) {
            this.cachedSeason = new Season(this.cachedSeason?.seasonNumbers, this.cachedSeason?.seasonPart, this.cachedSeason?.seasonError);
        }
        if ((this.cachedSeason.seasonNumbers.length === 0 || this.cachedSeason?.getSingleSeasonNumber() === -2) && searchMode !== SeasonSearchMode.NO_SEARCH) {
            this.cachedSeason = await this.prepareSeasonSearch(searchMode, allowAddNewEntry, searchInList);
        }
        if (SeasonComperator.isSameSeason(this.cachedSeason, new Season([-1]))) {
            return new Season(undefined, undefined, SeasonError.CANT_GET_SEASON);
        }
        if (this.cachedSeason) {
            return Object.assign(new Season(), this.cachedSeason);
        } else {
            logger.warn('Created undefined temp season');
            return new Season();
        }
    }

    public async getPrequel(searchInList: readonly Series[] | Series[]): Promise<RelationSearchResults> {
        logger.debug('[Season] [Serve]: Last Prequel');
        const searchedProviders: ProviderLocalData[] = [];
        try {
            for (const listProvider of this.getAllProviderLocalDatas()) {
                if (listProvider.prequelIds && listProvider.prequelIds.length !== 0) {
                    searchedProviders.push(listProvider);
                    for (const entry of searchInList) {
                        for (const entryListProvider of entry.getAllProviderBindings()) {
                            // tslint:disable-next-line: triple-equals
                            if (entryListProvider.providerName === listProvider.provider) {
                                if (listProvider.prequelIds.findIndex((x) => ProviderComperator.simpleProviderIdCheck(entryListProvider.id, x)) !== -1) {
                                    return new RelationSearchResults(entry);
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {
            logger.error(err);
        }
        return new RelationSearchResults(null, ...searchedProviders);
    }

    public async getSequel(searchInList?: readonly Series[] | Series[]): Promise<RelationSearchResults> {
        if (!searchInList) {
            searchInList = await MainListManager.getMainList();
        }
        if (!searchInList) {
            throw new Error('no searchList for sequel search ');
        }
        logger.debug('[Season] [Serve]: Last Sequel');
        const searchedProviders: ProviderLocalData[] = [];
        try {
            for (const listProvider of this.getAllProviderLocalDatas()) {
                searchedProviders.push(listProvider);
                if (listProvider.sequelIds && listProvider.sequelIds.length !== 0) {
                    for (const entry of searchInList) {
                        for (const entryListProvider of entry.getAllProviderBindings()) {
                            if (entryListProvider.providerName === listProvider.provider) {
                                if (listProvider.sequelIds.findIndex((x) => ProviderComperator.simpleProviderIdCheck(entryListProvider.id, x)) !== -1) {
                                    return new RelationSearchResults(entry);
                                }
                            }
                        }

                    }
                }
            }
        } catch (err) {
            logger.error('Error at Series.getSequel');
            logger.error(err);
        }
        return new RelationSearchResults(null, ...searchedProviders);
    }

    public async getCanSync(): Promise<boolean> {
        if (this.canSync) {
            return this.canSync;
        }
        try {
            this.canSync = await this.getCanSyncStatus();
            logger.debug('Calculated Sync status');
        } catch (err) {
            logger.error('Error at Series.getCanSync');
            logger.error(err);
            this.canSync = false;
        }
        return this.canSync;
    }

    public getProviderSeasonTarget(providerName: string): Season | undefined {
        const bindings = this.getAllProviderBindings();
        const result = bindings.find((x) => x.providerName === providerName);
        if (result) {
            return Object.assign(new Season(), result.targetSeason);
        }
        return;
    }

    /**
     * Merge two animes to one object.
     * Will be often used too update watchprogress.
     * @param anime
     */
    public async merge(anime: Series, allowAddNewEntry = true, mergeType = MergeTypes.UPGRADE): Promise<Series> {
        logger.debug('[Series ] Merging Series   | SeriesID: ' + this.id);
        const newAnime: Series = new Series();

        newAnime.addAllBindings(...[...this.getAllProviderBindings(), ...anime.getAllProviderBindings()]);
        logger.debug('[Series] Merged Providers  | SeriesID: ' + this.id);
        if (mergeType === MergeTypes.UPGRADE) {
            const getSeason = newAnime.getSeason(SeasonSearchMode.ALL, undefined, allowAddNewEntry);
            const getMediaType = await newAnime.getMediaType();
            await getSeason;
            await getMediaType;
            await new EpisodeMappingHelper(newAnime).generateEpisodeMapping();
        } else if (mergeType === MergeTypes.UPDATE) {
            newAnime.addEpisodeBindingPools(...anime.episodeBindingPools, ...this.episodeBindingPools);
        }
        logger.debug('[Series] Calculated Season | SeriesID: ' + this.id);
        await newAnime.getCanSync();
        if (this.lastInfoUpdate < anime.lastInfoUpdate) {
            newAnime.lastInfoUpdate = anime.lastInfoUpdate;
        } else {
            newAnime.lastInfoUpdate = this.lastInfoUpdate;
        }

        if (this.lastUpdate < anime.lastUpdate) {
            newAnime.lastUpdate = anime.lastUpdate;
        } else {
            newAnime.lastUpdate = this.lastUpdate;
        }

        return newAnime;
    }

    public async getLastWatchProgress(): Promise<WatchProgress> {
        logger.debug('[Episode] [Serve]: Last watch progress. SeriesID: ' + this.id);
        const provider = await this.getLastUpdatedProvider();
        if (provider) {
            const latestUpdatedProvider = Object.assign(new ListProviderLocalData(provider.id), provider);
            if (latestUpdatedProvider === null) {
                throw new Error('[Series] no provider with valid sync status SeriesID: ' + this.id);
            }

            const watchProgress = latestUpdatedProvider.getHighestWatchedEpisode();
            if (watchProgress) {
                return watchProgress;
            } else {
                throw new Error('[Series] no watch progress SeriesID: ' + this.id);
            }
        } else {
            throw new Error('[Series] no provider with valid sync status SeriesID: ' + this.id);
        }
    }
    /**
     * Get the first season of this series.
     * @param list
     */
    public async getFirstSeason(list?: readonly Series[] | Series[], targetSeason?: Season): Promise<Series> {
        logger.debug('[Season] [Serve]: First Season. SeriesID: ' + this.id);
        const season = (await this.getSeason());
        if (seasonHelper.isSeasonFirstSeason(season)) {
            return this;
        }

        if (!list) {
            list = await MainListManager.getMainList();
        }
        if (this.firstSeasonSeriesId) {
            const result = await new MainListSearcher().findSeriesBySeriesId(this.firstSeasonSeriesId);
            if (result) {
                return result;
            } else {
                this.firstSeasonSeriesId = undefined;
            }
        }

        if (list) {
            const allRelations = await this.getAllRelations(list);
            for (const relation of allRelations) {
                if (seasonHelper.isSeasonFirstSeason((await relation.getSeason()))) {
                    this.firstSeasonSeriesId = relation.id;
                    return relation;
                }
            }
        }
        if (targetSeason === undefined || SeasonComperator.isSameSeason(season, targetSeason)) {
            const pghInstance = new PrequelGeneratorHelper(this);
            const generatedPrequel = await pghInstance.generatePrequel(this, season);
            if (generatedPrequel !== null) {
                return generatedPrequel;
            }
        }
        throw new Error('[Series] no first season found SeriesID: ' + this.id);
    }

    /**
     * Get all relations from a series based on prequel id or sequel id or same provider id.
     * And this item is in the return to!
     * @param list
     * @param returnWithThis default value is: FALSE
     */
    public async getAllRelations(list?: readonly Series[] | Series[], returnWithThis = false): Promise<Series[]> {
        let relations = [this as Series];

        if (!list) {
            list = await MainListManager.getMainList();
        }

        for (const entry2 of relations) {
            for (const entry of list) {
                if (!await listHelper.isSeriesInList(relations, entry)) {
                    try {
                        relations.push(await this.searchInProviderForRelations(entry, entry2));
                    } catch (err) {
                        logger.debug(err);
                    }
                }
            }
        }
        if (!returnWithThis) {
            relations = await listHelper.removeEntrys(relations, this);
        }

        return relations;
    }

    public isAnySequelPresent(): boolean {
        return this.getAllProviderLocalDatas().findIndex((provider) => provider.sequelIds.length !== 0) !== -1;
    }

    public isAnyPrequelPresent(): boolean {
        return this.getAllProviderLocalDatas().findIndex((provider) => provider.prequelIds.length !== 0) !== -1;
    }

    public async getMediaType(): Promise<MediaType> {
        const collectedMediaTypes: MediaType[] = [];
        for (const localdata of this.getAllProviderLocalDatas()) {
            if (localdata.mediaType !== MediaType.UNKOWN) {
                collectedMediaTypes.push(localdata.mediaType);
            }
        }

        collectedMediaTypes.push(...await this.getAllMediaTypesFromTitle());

        if (collectedMediaTypes.length === 0) {
            this.cachedMediaType = MediaType.UNKOWN;
            return MediaType.UNKOWN;
        } else {
            const result = await listHelper.findMostFrequent(collectedMediaTypes);
            if (result) {
                this.cachedMediaType = result;
                return result;
            }
        }
        this.cachedMediaType = MediaType.UNKOWN;
        return MediaType.UNKOWN;
    }

    /**
     * Get from all providers the release date.
     * They can have difference.
     */
    public async getAllReleaseYears(): Promise<number[]> {
        const collectedReleaseYears: number[] = [];
        for (const localdata of this.getAllProviderLocalDatas()) {
            if (localdata.releaseYear !== undefined) {
                collectedReleaseYears.push(localdata.releaseYear);
            }
        }
        return collectedReleaseYears;
    }

    /**
     * Get the release year that fit to this series at most.
     */
    public async getReleaseYear(): Promise<number | undefined> {
        const collectedReleaseYears: number[] = await this.getAllReleaseYears();
        if (collectedReleaseYears.length === 0) {
            return;
        } else {
            const result = await listHelper.findMostFrequent(collectedReleaseYears);
            if (result) {
                return result;
            }
        }
        return;
    }

    public getAverageProviderInfoStatus(): ProviderInfoStatus {
        const providers = this.getAllProviderLocalDatas();
        const providerInfoStatusCollection = providers.flatMap((provider) => provider.infoStatus);
        const average = listHelper.getMostFrequentNumberFromList(providerInfoStatusCollection);
        if (average !== undefined) {
            return average;
        } else {
            throw new Error('Cant get average provider info status');
        }
    }

    private async prepareSeasonSearch(searchMode: SeasonSearchMode, allowAddNewEntry: boolean, searchInList?: readonly Series[] | Series[]): Promise<Season | undefined> {
        const result = await seasonHelper.prepareSearchSeasonValue(this, searchMode, searchInList);
        if (result.seasonError === SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER && searchMode !== SeasonSearchMode.NO_EXTRA_TRACE_REQUESTS) {
            // UKNOWN SEASON
            if (result.searchResultDetails && this.cachedSeason === undefined && allowAddNewEntry) {
                if (result.searchResultDetails.searchedProviders.length !== 0) {
                    logger.warn('Add TempSeries to MainList: ' + result.searchResultDetails.searchedProviders[0].provider + ': ' + result.searchResultDetails.searchedProviders[0].id);
                    const list = await seasonHelper.createTempSeriesFromPrequels(result.searchResultDetails.searchedProviders);
                    await new MainListAdder().addSeries(...list);
                    logger.info('Temp Series Successfull added.');
                }
            }
            this.cachedSeason = new Season([-2]);
            return new Season(undefined, undefined, SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER);
        } else if (result.seasonError === SeasonError.CANT_GET_SEASON) {
            this.cachedSeason = new Season([-1]);
        } else {
            this.cachedSeason = result.season;
            this.seasonDetectionType = result.foundType;
        }
        return Object.assign(new Season(), this.cachedSeason);
    }

    private async searchInProviderForRelations(a: Series, b: Series): Promise<Series> {
        const aMediaType = a.getMediaType();
        const bMediaType = b.getMediaType();
        if (await aMediaType === await bMediaType || await aMediaType === MediaType.UNKOWN || await bMediaType === MediaType.UNKOWN) {
            const allAProviders = a.getAllProviderLocalDatasWithSeasonInfo();
            const allBProviders = b.getAllProviderLocalDatasWithSeasonInfo();
            for (const providerAWithSeason of allAProviders) {
                const providerA = providerAWithSeason.providerLocalData;
                const providerATargetSeason = providerAWithSeason.seasonTarget;
                for (const providerBWithSeason of allBProviders) {
                    const providerB = providerBWithSeason.providerLocalData;
                    if (providerA.provider === providerB.provider) {
                        const providerBTargetSeason = providerBWithSeason.seasonTarget;
                        const simpleProviderCheckResult = ProviderComperator.simpleProviderIdCheck(providerA.id, providerB.id);
                        if (simpleProviderCheckResult && ProviderList.getExternalProviderInstance(providerB).hasUniqueIdForSeasons) {
                            throw new Error('[Series] Not the relation was found but the Series himself. SKIPPING SEARCH. SeriesID: ' + this.id);
                        } else if (simpleProviderCheckResult && !SeasonComperator.isSameSeason(providerATargetSeason, providerBTargetSeason)) {
                            return a;
                        }
                        for (const prequelIdB of providerB.prequelIds) {
                            if (ProviderComperator.simpleProviderIdCheck(prequelIdB, providerA.id)) {
                                return a;
                            }
                        }
                        for (const preqielIdA of providerA.prequelIds) {
                            if (ProviderComperator.simpleProviderIdCheck(preqielIdA, providerB.id)) {
                                return a;
                            }
                        }
                        for (const sequelIdB of providerB.sequelIds) {
                            if (ProviderComperator.simpleProviderIdCheck(sequelIdB, providerA.id)) {
                                return a;
                            }
                        }
                        for (const sequelIdA of providerA.sequelIds) {
                            if (ProviderComperator.simpleProviderIdCheck(sequelIdA, providerB.id)) {
                                return a;
                            }
                        }
                    }
                }
            }
        }
        throw new Error('[Series] no relations found in the providers SeriesID: ' + this.id);
    }

    /**
     * Get all MediaTypes that it can find in the title.
     */
    private async getAllMediaTypesFromTitle(): Promise<MediaType[]> {
        const collectedMediaTypes: MediaType[] = [];
        const names = await this.getAllNamesUnique();
        for (const name of names) {
            const result = titleCheckHelper.getMediaTypeFromTitle(name.name);
            if (result !== MediaType.UNKOWN) {
                collectedMediaTypes.push(result);
            }
        }
        return collectedMediaTypes;
    }

    /**
     * Checks if providers can be synced.
     * The Provider need to have episode.
     * The Provider need to have a user loggedIn.
     * The Provider need to be out of sync.
     */
    private async getCanSyncStatus(): Promise<boolean> {
        if (this.listProviderInfos.length <= 1) {
            return false;
        }
        let latestUpdatedProvider: ListProviderLocalData | null = null;
        try {
            latestUpdatedProvider = await this.getLastUpdatedProvider();
        } catch (err) {
            logger.error('[ERROR] [Series] [getCanSyncStatus]:');
            logger.error(err);
        }
        if (!latestUpdatedProvider) {
            throw new Error('[Series] no provider with valid sync status SeriesID: ' + this.id);
        }
        latestUpdatedProvider = Object.assign(new ListProviderLocalData(latestUpdatedProvider.id), latestUpdatedProvider);
        if (!await latestUpdatedProvider.getProviderInstance().isUserLoggedIn()) {
            latestUpdatedProvider.lastUpdate = new Date(0);
            for (let provider of this.getListProvidersInfos()) {
                provider = Object.assign(new ListProviderLocalData(provider.id), provider);
                if (provider !== latestUpdatedProvider && latestUpdatedProvider) {
                    if (new Date(provider.lastUpdate) > latestUpdatedProvider.lastUpdate && provider.getProviderInstance().isUserLoggedIn()) {
                        latestUpdatedProvider = provider;
                    }
                }
            }
        }

        for (let provider of this.getListProvidersInfos()) {
            provider = Object.assign(new ListProviderLocalData(provider.id), provider);
            if (latestUpdatedProvider && latestUpdatedProvider.provider !== provider.provider && await provider.getProviderInstance().isUserLoggedIn()) {
                const watchProgress = provider.getHighestWatchedEpisode();
                const latestWatchProgress = latestUpdatedProvider.getHighestWatchedEpisode();
                if (latestUpdatedProvider.watchProgress && latestWatchProgress && provider.episodes) {
                    if (!watchProgress) {
                        return true;
                    }
                    // If the watchprogress has a difference and if the provider has a max defined episode.
                    // Without the episodes we dont know if we can sync or not.
                    if (latestWatchProgress.episode !== watchProgress.episode) {
                        if (!latestUpdatedProvider.episodes || latestWatchProgress.episode < latestUpdatedProvider.episodes) {
                            try {
                                if (!watchProgress) {
                                    return true;
                                } else if (this.getMaxEpisode() < watchProgress.episode) {
                                    return false;
                                } else {
                                    provider.canUpdateWatchProgress = true;
                                    return true;
                                }
                            } catch (err) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * @return the last updated provider with watchProgress !
     */
    private async getLastUpdatedProvider(exclude: ListProviderLocalData[] = []): Promise<ListProviderLocalData | null> {
        logger.debug('[Provider] [Serve]: Last updated provider');
        let latestUpdatedProvider: ListProviderLocalData | null = null;
        const providerInfos = this.getListProvidersInfos();
        if (providerInfos) {
            for (const provider of providerInfos) {
                if (provider.watchProgress) {
                    if (exclude.findIndex((x) => x === latestUpdatedProvider) === -1) {
                        if (latestUpdatedProvider === null) {
                            latestUpdatedProvider = provider;
                        } else {
                            const latestExternalStatus = latestUpdatedProvider.lastExternalChange && new Date(latestUpdatedProvider.lastExternalChange).getTime() !== 0;
                            const providerExternalStatus = provider.lastExternalChange && new Date(provider.lastExternalChange).getTime() !== 0;
                            if (latestExternalStatus && providerExternalStatus) {
                                if (new Date(latestUpdatedProvider.lastExternalChange).getTime() < new Date(provider.lastExternalChange).getTime()) {
                                    latestUpdatedProvider = provider;
                                }
                            } else if (new Date(latestUpdatedProvider.lastUpdate).getTime() < new Date(provider.lastUpdate).getTime()) {
                                latestUpdatedProvider = provider;
                            }
                        }
                    }
                }
            }
        }
        return latestUpdatedProvider;
    }
}


export enum WatchStatus {
    // Currently watching/reading
    CURRENT,
    // Planning to watch / read
    PLANNING,
    // Finished watching / reading
    COMPLETED,
    // Stopped watching / reading before completing
    DROPPED,
    // Paused watching / reading
    PAUSED,
    // Re - watching / reading
    REPEATING,
}
