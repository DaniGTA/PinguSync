/* eslint-disable @typescript-eslint/no-explicit-any */
import { ListType } from './../../../../src/backend/controller/settings/models/provider/list-types';
import MalConverter from '../../../../src/backend/api/information-providers/mal/mal-converter';
import { ImageSize } from '../../../../src/backend/controller/objects/meta/image-size';

describe('Mal Converter | Test runs', () => {

    describe('convertWatchStatus()', () => {
        test('convert watch status rewatching to ListType REPEATING', () => {
            const result = MalConverter['convertWatchStatus']('completed', true);
            expect(result).toBe(ListType.REPEATING);
        });
        test('convert watch status watching to ListType CURRENT', () => {
            const result = MalConverter['convertWatchStatus']('watching', false);
            expect(result).toBe(ListType.CURRENT);
        });
        test('convert watch status plan_to_watch to ListType PLANNING', () => {
            const result = MalConverter['convertWatchStatus']('plan_to_watch', false);
            expect(result).toBe(ListType.PLANNING);
        });
        test('convert watch status completed to ListType COMPLETED', () => {
            const result = MalConverter['convertWatchStatus']('completed', false);
            expect(result).toBe(ListType.COMPLETED);
        });
        test('convert watch status dropped to ListType REPEATING', () => {
            const result = MalConverter['convertWatchStatus']('dropped', false);
            expect(result).toBe(ListType.DROPPED);
        });
        test('convert watch status on_hold to ListType REPEATING', () => {
            const result = MalConverter['convertWatchStatus']('on_hold', false);
            expect(result).toBe(ListType.PAUSED);
        });
        test('convert watch status null to ListType REPEATING', () => {
            const result = MalConverter['convertWatchStatus'](null, false);
            expect(result).toBe(ListType.UNKOWN);
        });
    });

    describe('convertMainPicturToCovers()', () => {
        test('should convert with large picture size missing', () => {
            const mainPicture = {
                medium: 'link'
            } as any;
            const result = MalConverter['convertMainPicturToCovers'](mainPicture);
            expect(result.length).toBe(1);
            expect(result[0].url).toBe('link');
            expect(result[0].size).toBe(ImageSize.MEDIUM);
        });

        test('should convert with medium picture size missing', () => {
            const mainPicture = {
                large: 'link'
            } as any;
            const result = MalConverter['convertMainPicturToCovers'](mainPicture);
            expect(result.length).toBe(1);
            expect(result[0].url).toBe('link');
            expect(result[0].size).toBe(ImageSize.LARGE);
        });
    });
});
