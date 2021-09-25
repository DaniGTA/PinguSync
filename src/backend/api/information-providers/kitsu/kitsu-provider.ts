import Kitsu from 'kitsu'
import { MediaType } from '../../../controller/objects/meta/media-type'
import WatchProgress from '../../../controller/objects/meta/watch-progress'
import Series from '../../../controller/objects/series'

import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data'
import { ProviderInfoStatus } from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status'
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import logger from '../../../logger/logger'
import ExternalInformationProvider from '../../provider/external-information-provider'
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
import WebRequestManager from '@/backend/controller/web-request-manager/web-request-manager'
import RequestBundle from '@/backend/controller/web-request-manager/request-bundle'
import OAuthListProvider from '../../provider/o-auth-list-provider'
import OAuth from '../../provider/auth/o-auth'
import { KitsuOAuthResponse } from './objects/o-auth-result'
import { OAuthTokenType } from '../../provider/auth/o-auth-token-type'
export default class KitsuProvider extends OAuthListProvider {
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

    private CLIENT_ID = 'dd031b32d2f56c990b1425efe6c42ad847e7fe3ab46bf1299f05ecd856bdb7dd'
    private CLIENT_SECRET = '54d7307928f63414defd96399fc31ba847961ceaecef3a5fd93144e960c0e151'

    constructor() {
        super()
        this.api = this.getKitsuInstance()
        this.getAccessToken()
            .then(token => {
                this.api.headers['Authorization'] = 'Bearer ' + token
            })
            .catch(x => logger.debug(x))
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
    public async getUsername(): Promise<string> {
        if (this.userData.userName) {
            return this.userData.userName
        }
        throw new Error('[Kitsu] cant get username: user not logged in')
    }
    public logoutUser(): void {
        this.userData.oAuth = undefined
        this.userData.saveData()
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    public async getUrlToSingleEpisode(provider: ProviderLocalData, episode: Episode): Promise<string> {
        const slug = provider.getAllNames().find(x => x.nameType == NameType.SLUG)?.name
        const episodeNr = episode.episodeNumber
        return `https://kitsu.io/anime/${slug}/episodes/${episodeNr}`
    }

    public async markEpisodeAsUnwatched(episode: Episode[]): Promise<void> {
        throw new Error('Method not implemented.')
    }

    public async markEpisodeAsWatched(episode: Episode[]): Promise<void> {
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
                await this.waitUntilItCanPerfomNextRequest()
                searchResults = await this.search(seriesName)
            }
            for (const result of searchResults.data) {
                try {
                    endResults.push(await kitsuConverter.convertMediaToAnime(result, ProviderInfoStatus.BASIC_INFO))
                } catch (err) {
                    logger.error(err as string)
                }
            }
        } catch (err) {
            logger.error(err as string)
        }

        return endResults
    }

    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        if (provider.provider === this.providerName) {
            this.informAWebRequest()
            const getResult = ((await this.api.get(
                `anime/${provider.id}?include=genres,episodes`
            )) as unknown) as GetMediaResult
            return kitsuConverter.convertMediaToAnime(getResult.data)
        }
        throw new Error('[Kitsu] Cant handle this provider id')
    }

    public getAllSeries(disableCache?: boolean | undefined): Promise<MultiProviderResult[]> {
        throw new Error('Method not implemented.')
    }

    public async logInUser(pass: string, username?: string | undefined): Promise<boolean> {
        const response = await WebRequestManager.request<string>(
            new RequestBundle('https://api.trakt.tv/oauth/token', {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: pass,
                    grant_type: 'password',
                }),
                method: 'POST',
            })
        )
        if (response.body) {
            const typedResponse = JSON.parse(response.body ?? '') as KitsuOAuthResponse
            const expiredDate = new Date(typedResponse.created_at)
            expiredDate.setSeconds(expiredDate.getSeconds() + typedResponse.expires_in)
            this.userData.userName = username
            this.setOAuthData(
                new OAuth(
                    typedResponse.access_token,
                    OAuthTokenType.BEARER,
                    new Date(typedResponse.created_at),
                    typedResponse.refresh_token,
                    expiredDate
                )
            )
            return true
        }
        return false
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    public async isUserLoggedIn(): Promise<boolean> {
        return this.userData.oAuth !== undefined
    }

    private async search(s: string): Promise<ISearchResult> {
        this.informAWebRequest()
        return (await this.api.get('anime', {
            params: {
                filter: {
                    text: s,
                },
                include: 'mappings',
            },
        })) as ISearchResult
    }

    protected addOAuthCode(code: string): Promise<OAuth> {
        throw new Error('Method not implemented.')
    }

    public setOAuthData(oAuth: OAuth): void {
        this.userData.oAuth = oAuth
        this.getKitsuInstance().headers['Authorization'] = 'Bearer ' + this.userData.oAuth.accessToken
        this.userData.saveData()
    }

    public getOAuthData(): OAuth {
        if (this.userData?.oAuth) {
            return this.userData.oAuth
        }
        throw new Error('[Kitsu] no o auth data')
    }

    protected async refreshAccessToken(): Promise<OAuth> {
        const response = await WebRequestManager.request<string>(
            new RequestBundle('https://api.trakt.tv/oauth/token', {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh_token: this.userData.oAuth?.refreshToken,
                    grant_type: 'refresh_token',
                }),
                method: 'POST',
            })
        )
        if (response.body) {
            const typedResponse = JSON.parse(response.body ?? '') as KitsuOAuthResponse
            const expiredDate = new Date(typedResponse.created_at)
            expiredDate.setSeconds(expiredDate.getSeconds() + typedResponse.expires_in)
            return new OAuth(
                typedResponse.access_token,
                OAuthTokenType.BEARER,
                new Date(typedResponse.created_at),
                typedResponse.refresh_token,
                expiredDate
            )
        }
        throw new Error('[Kitsu] failed to get access_token with refresh_token statusCode: ' + response.statusCode)
    }

    public getTokenAuthUrl(): string {
        throw new Error('Method not implemented.')
    }

    private getKitsuInstance() {
        if (this.api) {
            return this.api
        } else {
            return new Kitsu({
                headers: {
                    'User-Agent': 'PinguSync/1.0.0 (https://github.com/DaniGTA/PinguSync)',
                },
            })
        }
    }
}
