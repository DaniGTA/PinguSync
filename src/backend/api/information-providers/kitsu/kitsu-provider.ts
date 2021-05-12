import Kitsu from 'kitsu'
import { MediaType } from '../../../controller/objects/meta/media-type'
import WatchProgress from '../../../controller/objects/meta/watch-progress'
import Series from '../../../controller/objects/series'

import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data'
import { ProviderInfoStatus } from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status'
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import logger from '../../../logger/logger'
import ExternalInformationProvider from '../../provider/external-information-provider'
import ListProvider from '../../provider/list-provider'
import MultiProviderResult from '../../provider/multi-provider-result'
import AniDBProvider from '../anidb/anidb-provider'
import AniListProvider from '../anilist/anilist-provider'
import MalProvider from '../mal/mal-provider'
import TraktProvider from '../trakt/trakt-provider'
import kitsuConverter from './kitsu-converter'
import { KitsuUserData } from './kitsu-user-data'
import { GetMediaResult } from './objects/getResult'
import { ISearchResult } from './objects/searchResult'
import Episode from '../../../controller/objects/meta/episode/episode'
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import { NameType } from '../../../controller/objects/meta/name-type'
import ProviderUserList from '../../../controller/objects/provider-user-list'
export default class KitsuProvider extends ListProvider {
    private static instance: KitsuProvider
    public version = 3
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.MOVIE, MediaType.SPECIAL]
    public supportedOtherProvider: Array<new () => ExternalInformationProvider> = []
    public potentialSubProviders: Array<new () => ExternalInformationProvider> = [
        MalProvider,
        TraktProvider,
        AniDBProvider,
        AniListProvider,
    ]
    public hasOAuthLogin = false
    public hasDefaultLogin = false
    public hasUniqueIdForSeasons = true
    public supportOnlyBasicLatinForNameSearch = false
    public hasEpisodeTitleOnFullInfo = true
    public userData: KitsuUserData
    public api: Kitsu

    constructor() {
        super()
        this.api = new Kitsu()
        if (KitsuProvider.instance) {
            this.userData = KitsuProvider.instance.userData
        } else {
            this.userData = new KitsuUserData()
        }
    }

    public static getInstance(): KitsuProvider {
        if (!KitsuProvider.instance) {
            KitsuProvider.instance = new KitsuProvider()
            // ... any one time initialization goes here ...
        }
        return KitsuProvider.instance
    }

    public getAllLists(): Promise<ProviderUserList[]> {
        throw new Error('Method not implemented.')
    }
    public getUsername(): Promise<string> {
        throw new Error('Method not implemented.')
    }
    public logoutUser(): void {
        throw new Error('Method not implemented.')
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    public async getUrlToSingleEpisode(provider: ProviderLocalData, episode: Episode): Promise<string> {
        const slug = provider.getAllNames().find(x => x.nameType == NameType.SLUG)?.name
        const episodeNr = episode.episodeNumber
        return `https://kitsu.io/anime/${slug}/episodes/${episodeNr}`
    }

    public async markEpisodeAsUnwatched(episode: Episode[]): Promise<void> {}

    public async markEpisodeAsWatched(episode: Episode[]): Promise<void> {}

    public addOAuthCode(): Promise<boolean> {
        throw new Error('Method not implemented.')
    }

    public removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error('Method not implemented.')
    }

    public updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error('Method not implemented.')
    }

    public async getMoreSeriesInfoByName(seriesName: string): Promise<MultiProviderResult[]> {
        const endResults: MultiProviderResult[] = []
        try {
            let searchResults = await this.search(seriesName)
            if (searchResults.data.length === 0) {
                this.waitUntilItCanPerfomNextRequest()
                searchResults = await this.search(seriesName)
            }
            for (const result of searchResults.data) {
                try {
                    endResults.push(await kitsuConverter.convertMediaToAnime(result, ProviderInfoStatus.BASIC_INFO))
                } catch (err) {
                    logger.error(err)
                }
            }
        } catch (err) {
            logger.error(err)
        }

        return endResults
    }

    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        if (provider.provider === this.providerName) {
            this.informAWebRequest()
            const getResult = ((await this.api.get(
                'anime/' + provider.id + '?include=genres,episodes,streamingLinks'
            )) as unknown) as GetMediaResult
            return kitsuConverter.convertMediaToAnime(getResult.data)
        }
        throw new Error('[Kitsu] Cant handle this provider id')
    }

    public getAllSeries(disableCache?: boolean | undefined): Promise<MultiProviderResult[]> {
        throw new Error('Method not implemented.')
    }
    public logInUser(pass: string, username?: string | undefined): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    public async isUserLoggedIn(): Promise<boolean> {
        return false
    }
    public getTokenAuthUrl(): string {
        throw new Error('Method not implemented.')
    }

    private async search(s: string): Promise<ISearchResult> {
        this.informAWebRequest()
        return (await this.api.get('anime', {
            filter: {
                text: s,
            },
            include: 'mappings',
        } as any)) as ISearchResult
    }
}
