import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import ExternalInformationProvider from '../src/backend/api/provider/external-information-provider';
import ExternalProvider from '../src/backend/api/provider/external-provider';
import MultiProviderResult from '../src/backend/api/provider/multi-provider-result';
import Season from '../src/backend/controller/objects/meta/season';
import ProviderDataListLoader from '../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-loader';
import ProviderLocalData from '../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../src/backend/controller/provider-controller/provider-manager/provider-list';
import ProviderLoader from '../src/backend/controller/provider-controller/provider-manager/provider-loader';
import ProviderNameManager from '../src/backend/controller/provider-controller/provider-manager/provider-name-manager';
import logger from '../src/backend/logger/logger';

export default class ResponseHelper {

    public static mockRequest(): void {
        const loader = new ProviderLoader();
        // tslint:disable: no-string-literal
        for (const provider of loader['listOfListProviders']) {
            if (provider) {
                this.mockGetByNameRequest(provider);
                this.mockGetByIdRequest(provider);
            }
        }
        for (const provider of loader['listOfInfoProviders']) {
            if (provider) {
                this.mockGetByNameRequest(provider);
                this.mockGetByIdRequest(provider);
            }
        }
        ProviderList['loadedListProvider'] = undefined;
        ProviderList['loadedInfoProvider'] = undefined;
    }

    private static cacheFolderName = './test-web-response-cache/';
    private static mockGetByNameRequest(provider: (new () => ExternalInformationProvider)) {
        const spyGetInfoByName = jest.spyOn(provider.prototype, 'getMoreSeriesInfoByName');
        const spyGetInfoByNameMock = async (searchTitle: string, season: number): Promise<MultiProviderResult[]> => {
            const requestId = this.generateRequestId(provider, (searchTitle + season));
            logger.info('[RequestMocker] Request cached id:' + requestId);

            if (ResponseHelper.isRequestCached(requestId)) {
                const resultList = this.loadCache(requestId) as MultiProviderResult[];
                for (let index = 0; index < resultList.length; index++) {
                    let response = resultList[index];
                    response = Object.assign(new MultiProviderResult(response.mainProvider), response);
                    response.mainProvider.providerLocalData = ProviderDataListLoader['createProviderLocalDataInstance'](response.mainProvider.providerLocalData);
                    response.mainProvider.seasonTarget = Object.assign(new Season(), response.mainProvider.seasonTarget);
                    for (let index = 0; index < response.subProviders.length; index++) {
                        let subProvider = response.subProviders[index];
                        subProvider.providerLocalData = ProviderDataListLoader['createProviderLocalDataInstance'](subProvider.providerLocalData);
                        subProvider.seasonTarget = Object.assign(new Season(), subProvider.seasonTarget);
                        response.subProviders[index] = subProvider;
                    }
                    resultList[index] = response;
                }
                return resultList;
            } else {
                spyGetInfoByName.mockRestore();
                const result = await new provider().getMoreSeriesInfoByName(searchTitle, season);
                this.cacheNewRequest((searchTitle + ' ,s:' + season), result, requestId);
                this.mockGetByNameRequest(provider);
                return result;
            }
        };
        spyGetInfoByName.mockImplementation(spyGetInfoByNameMock as unknown as any);
    }

    private static mockGetByIdRequest(provider: (new () => ExternalInformationProvider)) {
        const spyGetInfoById = jest.spyOn(provider.prototype, 'getFullInfoById').mockImplementation(jest.fn());
        const spyGetInfoByIdMock = jest.fn().mockImplementation(async (providerLocalData: ProviderLocalData): Promise<MultiProviderResult> => {
            const requestId = this.generateRequestId(provider, (providerLocalData.provider + providerLocalData.id));
            logger.info('[RequestMocker] Request cached id:' + requestId);

            if (ResponseHelper.isRequestCached(requestId)) {
                const response = this.loadCache(requestId) as MultiProviderResult;
                response.mainProvider.providerLocalData = ProviderDataListLoader['createProviderLocalDataInstance'](response.mainProvider.providerLocalData);
                response.mainProvider.seasonTarget = Object.assign(new Season(), response.mainProvider.seasonTarget);
                for (let index = 0; index < response.subProviders.length; index++) {
                    const subProvider = response.subProviders[index];
                    subProvider.providerLocalData = ProviderDataListLoader['createProviderLocalDataInstance'](subProvider.providerLocalData);
                    subProvider.seasonTarget = Object.assign(new Season(), subProvider.seasonTarget);
                    response.subProviders[index] = subProvider;
                }
                const result = Object.assign(new MultiProviderResult(response.mainProvider), response);
                return result;
            } else {
                spyGetInfoById.mockRestore();
                const result = await new provider().getFullInfoById(providerLocalData);
                this.cacheNewRequest((providerLocalData.provider + ', id: ' + providerLocalData.id), result, requestId);
                this.mockGetByIdRequest(provider);
                return result;
            }
        });
        spyGetInfoById.mockImplementation(spyGetInfoByIdMock);
    }

    private static generateRequestId(provider: (new () => ExternalProvider), string: string): string {
        const providerName = ProviderNameManager.getProviderName(provider);
        const providerVersion = ProviderNameManager.getProviderVersion(provider);

        logger.info(`[RequestMocker] Generate mock id for: ${providerName} (v:${providerVersion})`);

        const text = JSON.stringify(providerName + providerVersion + string);
        return providerName + '_v' + providerVersion + '_hash' + createHash('sha256').update(text).digest('hex');
    }

    private static isRequestCached(id: string): boolean {
        return existsSync(this.cacheFolderName + id + '.json');
    }

    private static cacheNewRequest(request: string, response: any, id: string): void {
        logger.info('[RequestMocker] create cache for id:' + id);

        if (response !== undefined) {
            try {
                const fileContent = JSON.stringify({ request, response });
                try {
                    statSync(this.cacheFolderName);
                } catch (e) {
                    mkdirSync(this.cacheFolderName);
                }
                writeFileSync(this.cacheFolderName + id + '.json', fileContent);
            } catch (err) {
                logger.error(`Caching failed for id: ${id} failed`);
                logger.error(err);
            }
        }
    }

    private static loadCache(id: string): any {
        logger.info('[RequestMocker] load cache for id:' + id);
        return (JSON.parse(readFileSync(this.cacheFolderName + id + '.json', 'UTF-8'))).response;
    }
}
