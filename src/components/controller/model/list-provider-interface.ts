import { UserData } from '../../../backend/api/user-data';

export interface ListProviderInterface {
    hasOAuthLogin: boolean;
    userData: UserData;
    hasDefaultLogin: boolean;
    requireInternetAccessGetMoreSeriesInfoByName: boolean;
    requireInternetAccessForGetFullById: boolean;
    hasEpisodeTitleOnFullInfo: boolean;
    supportOnlyBasicLatinForNameSearch: boolean;
    hasUniqueIdForSeasons: boolean;
    providerName: string;
    requestRateLimitInMs: number;
    lastRequestTimestamp: number;
    requestCounter: number;
    version: number;
}