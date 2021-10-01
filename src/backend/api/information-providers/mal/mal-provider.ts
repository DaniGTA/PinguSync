import { Mal, Jikan } from 'node-myanimelist'
import { MediaType } from '../../../controller/objects/meta/media-type'
import WatchProgress from '../../../controller/objects/meta/watch-progress'
import Series from '../../../controller/objects/series'
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data'
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import logger from '../../../logger/logger'
import ExternalInformationProvider from '../../provider/external-information-provider'
import ListProvider from '../../provider/list-provider'
import MultiProviderResult from '../../provider/multi-provider-result'
import { MalUserData } from './mal-user-data'
import Episode from '../../../controller/objects/meta/episode/episode'
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import MalConverter from './mal-converter'
import pkceChallenge from 'pkce-challenge'
import EpisodeHelper from '../../../helpFunctions/episode-helper/episode-helper'
import ProviderUserList from '@/backend/controller/objects/provider-user-list'

export default class MalProvider extends ListProvider {
    private static instance: MalProvider
    public static currentAcount: Mal.MalAcount | null = null

    public version = 3
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.MOVIE, MediaType.SPECIAL]
    public supportedOtherProvider: Array<new () => ExternalInformationProvider> = []
    public potentialSubProviders: Array<new () => ExternalInformationProvider> = []
    public hasOAuthLogin = true
    public hasUniqueIdForSeasons = true
    public hasEpisodeTitleOnFullInfo = true

    public userData: MalUserData
    public requestRateLimitInMs = 6000
    public pkce = pkceChallenge()
    public malAuth = Mal.auth()

    constructor() {
        super()
        this.userData = new MalUserData()
        if (this.userData.loginData) {
            const token = Mal.MalToken.fromJsonString(this.userData.loginData)
            MalProvider.currentAcount = this.malAuth.loadToken(token)
        }
    }

    public async getAllLists(): Promise<ProviderUserList[]> {
        throw new Error('Method not implemented.')
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    public async getUsername(): Promise<string> {
        if (MalProvider.currentAcount && this.userData?.userName) {
            return this.userData.userName
        }
        throw new Error('no username')
    }
    public logoutUser(): void {
        this.userData.logout()
        MalProvider.currentAcount = null
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    public async getUrlToSingleEpisode(provider: ProviderLocalData, episode: Episode): Promise<string> {
        return `https://myanimelist.net/anime/${provider.id}/${
            provider.getAllNames()[0].name
        }/episode/${episode.getEpNrAsNr()}`
    }
    public static getInstance(): MalProvider {
        if (!MalProvider.instance) {
            MalProvider.instance = new MalProvider()
            // ... any one time initialization goes here ...
        }
        return MalProvider.instance
    }

    public async markEpisodeAsUnwatched(episode: Episode[]): Promise<void> {
        if (MalProvider.currentAcount) {
            const groupedEpisodes = EpisodeHelper.groupBySeriesIds(episode)
            for (const groupedEpisode of groupedEpisodes) {
                const minEpNumber = EpisodeHelper.getMinEpisodeNumberFromEpisodeArray(groupedEpisode)
                await MalProvider.currentAcount.anime
                    .updateMyAnime(groupedEpisode[0].providerId as number, {
                        num_watched_episodes: minEpNumber,
                        status: 'watching',
                    })
                    .call()
            }
        }
    }

    public async markEpisodeAsWatched(episode: Episode[]): Promise<void> {
        if (MalProvider.currentAcount) {
            const groupedEpisodes = EpisodeHelper.groupBySeriesIds(episode)
            for (const groupedEpisode of groupedEpisodes) {
                const maxEpNumber = EpisodeHelper.getMaxEpisodeNumberFromEpisodeArray(groupedEpisode)
                await MalProvider.currentAcount.anime
                    .updateMyAnime(groupedEpisode[0].providerId as number, {
                        num_watched_episodes: maxEpNumber,
                        status: 'watching',
                    })
                    .call()
            }
        }
    }

    public async addOAuthCode(code: string): Promise<boolean> {
        try {
            const acount = await this.malAuth.authorizeWithCode(code, this.pkce.code_challenge)
            if (acount) {
                this.userData.setToken(acount.stringifyToken())
                return true
            }
        } catch (err) {
            logger.warn(err as string)
            return false
        }
        return false
    }

    public removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error('Method not implemented.')
    }
    public updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error('Method not implemented.')
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async isProviderAvailable(): Promise<boolean> {
        return true
    }

    public async getMoreSeriesInfoByName(seriesName: string): Promise<MultiProviderResult[]> {
        await this.waitUntilItCanPerfomNextRequest()
        this.informAWebRequest()
        const endResults: MultiProviderResult[] = []
        try {
            // Only query at 3 or more letters.
            if (seriesName.length >= 3) {
                const result = await Jikan.search().anime({ q: seriesName })
                console.log(result)
                for (const searchResult of result.results) {
                    const searchProviderData = MalConverter.convertSearchResultData(searchResult)
                    endResults.push(new MultiProviderResult(searchProviderData))
                }
            }
        } catch (err) {
            logger.error(err as string)
        }

        return endResults
    }

    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        await this.waitUntilItCanPerfomNextRequest()
        this.informAWebRequest()
        const anime = Jikan.anime(Number(provider.id))
        return MalConverter.convertAnimeToProviderData(anime)
    }

    public async getAllSeries(disableCache?: boolean | undefined): Promise<MultiProviderResult[]> {
        if (MalProvider.currentAcount) {
            await this.waitUntilItCanPerfomNextRequest()
            this.informAWebRequest()
            const lists = await MalProvider.currentAcount.user.animelist().call()
            return MalConverter.convertMalListToMultiProviderResult(lists)
        }
        throw new Error('No User logged in')
    }
    public async logInUser(pass: string, username?: string | undefined): Promise<boolean> {
        try {
            if (username && pass) {
                const acount = await this.malAuth.Unstable.login(username, pass)
                MalProvider.currentAcount = acount
                this.userData.setToken(acount.stringifyToken())
                const baseUserData = await acount.user.info().call()
                this.userData.userName = baseUserData.name
                this.userData.userImageUrl = baseUserData.picture
                this.userData.userJoined = new Date(baseUserData.joined_at)
                return this.isUserLoggedIn()
            }
        } catch (err) {
            logger.error(err as string)
        }
        return false
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    public async isUserLoggedIn(): Promise<boolean> {
        if (this.userData.loginData) {
            return true
        }
        return false
    }

    /**
     * The MAL Api dont work with OAuth.
     */
    public getTokenAuthUrl(): string {
        return this.malAuth.getOAuthUrl(this.pkce.code_challenge)
    }
}
