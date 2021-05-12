import { ListProviderLocalData } from './../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import Series from '../../../src/backend/controller/objects/series';
import SyncExternalEpisodes from '../../../src/backend/controller/sync-controller/sync-external-episodes'
import TestListProvider from '../objects/testClass/testListProvider';
import { ProviderInfoStatus } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';

describe('CLASS: SyncExternalEpisode', () => {
    describe('isSeriesOnWaitlist()', () => {
        test('should be on waitlist', () => {
            SyncExternalEpisodes['plannedJobList'].push({ providerName: 'a', seriesId: 'a' });
            const result = SyncExternalEpisodes.isSeriesOnWaitlist('a', 'a');
            expect(result).toBe(true);
        });
        test('should not be on waitlist', () => {
            SyncExternalEpisodes['plannedJobList'] = [];
            const result = SyncExternalEpisodes.isSeriesOnWaitlist('a', 'a');
            expect(result).toBe(false);
        });
    });

    describe('canSync()', () => {
        test('should not allow sync', () => {
            SyncExternalEpisodes['plannedJobList'].push({ providerName: 'a', seriesId: 'a' });
            const result = SyncExternalEpisodes['canSync']('a', 'a');
            expect(result).toBe(false);
        });
        test('should allow sync', () => {
            SyncExternalEpisodes['plannedJobList'] = [];
            const result = SyncExternalEpisodes['canSync']('a', 'a');
            expect(result).toBe(true);
        });
    });

    describe('addSyncJob()', () => {
        test('should add sync job', () => {
            SyncExternalEpisodes['plannedJobList'] = [];
            SyncExternalEpisodes.addSyncJob('a', { id: 'a' } as Series);
            expect(SyncExternalEpisodes['plannedJobList'].length).toBe(1);
            expect(SyncExternalEpisodes['plannedJobList'][0].seriesId).toBe('a');
        });
    });

    describe('watchRunningJobs', () => {
        test('should not crash on exception', async () => {
            // eslint-disable-next-line @typescript-eslint/require-await
            const corruptJob = (async (): Promise<void> => { throw new Error(); }) as never;
            await expect(SyncExternalEpisodes['watchRunningJobs']([corruptJob])).resolves.not.toThrow();
        });
    });

    describe('needSeriesUpdate()', () => {
        describe('series should need update', () => {
            let s = new Series();
            let testListProvider = new TestListProvider();
            let providerLocalData = new ListProviderLocalData(1, testListProvider);
            beforeEach(() => {
                s = new Series();
                testListProvider = new TestListProvider();
                testListProvider.version = 2;
                providerLocalData = new ListProviderLocalData(1, testListProvider);
                providerLocalData.version = 1;
            });

            test('localdata status NOT_AVAILABLE', () => {
                providerLocalData.infoStatus = ProviderInfoStatus.NOT_AVAILABLE;
                s['getOneProviderLocalDataByExternalProvider'] = (): ListProviderLocalData => { return providerLocalData };
                expect(SyncExternalEpisodes['needSeriesUpdate'](s, testListProvider)).toBeTruthy();
            });

            test('localdata status ONLY_ID', () => {
                providerLocalData.infoStatus = ProviderInfoStatus.ONLY_ID;
                s['getOneProviderLocalDataByExternalProvider'] = (): ListProviderLocalData => { return providerLocalData };
                expect(SyncExternalEpisodes['needSeriesUpdate'](s, testListProvider)).toBeTruthy();
            });

            test('localdata status BASIC_INFO', () => {
                providerLocalData.infoStatus = ProviderInfoStatus.BASIC_INFO;
                s['getOneProviderLocalDataByExternalProvider'] = (): ListProviderLocalData => { return providerLocalData };
                expect(SyncExternalEpisodes['needSeriesUpdate'](s, testListProvider)).toBeTruthy();
            });

            test('localdata status ADVANCED_BASIC_INFO', () => {
                providerLocalData.infoStatus = ProviderInfoStatus.ADVANCED_BASIC_INFO;
                s['getOneProviderLocalDataByExternalProvider'] = (): ListProviderLocalData => { return providerLocalData };
                expect(SyncExternalEpisodes['needSeriesUpdate'](s, testListProvider)).toBeTruthy();
            });

            test('no localdata', () => {
                s['getOneProviderLocalDataByExternalProvider'] = (): undefined => { return undefined; };
                expect(SyncExternalEpisodes['needSeriesUpdate'](s, testListProvider)).toBeTruthy();
            });
        });

        describe('series doesnt should need update', () => {
            let s = new Series();
            let testListProvider = new TestListProvider();
            let providerLocalData = new ListProviderLocalData(1, testListProvider);
            beforeEach(() => {
                s = new Series();
                testListProvider = new TestListProvider();
                testListProvider.version = 2;
                providerLocalData = new ListProviderLocalData(1, testListProvider);
                providerLocalData.version = 1;
            });

            test('localdata status same version number', () => {
                providerLocalData.infoStatus = ProviderInfoStatus.NOT_AVAILABLE;
                providerLocalData.version = 2;
                s['getOneProviderLocalDataByExternalProvider'] = (): ListProviderLocalData => { return providerLocalData };
                expect(SyncExternalEpisodes['needSeriesUpdate'](s, testListProvider)).toBeFalsy();
            });

            test('localdata status FULL_INFO', () => {
                providerLocalData.infoStatus = ProviderInfoStatus.FULL_INFO;
                s['getOneProviderLocalDataByExternalProvider'] = (): ListProviderLocalData => { return providerLocalData };
                expect(SyncExternalEpisodes['needSeriesUpdate'](s, testListProvider)).toBeFalsy();
            });
        });
    });
});