import * as assert from 'assert';
import { MediaType } from '../../src/backend/controller/objects/meta/media-type';
import TitleCheckHelper from '../../src/backend/helpFunctions/name-helper/title-check-helper';

describe('Title Checker | Some title examples', () => {
    test('should match all titles with checkNames', () => {
        assert.equal(TitleCheckHelper.checkNames(['Title: Check, It`s a Test` but` its still a test!'], ['Title ~Check, It’s a test but’ its still a test!~']), true);
        assert.equal(TitleCheckHelper.checkNames(['Kiniro Mosaic'], ['Kin`iro Mosaic', 'Kiniro Mosaic', 'Kinmosa', 'Kinmoza!', 'きんいろモザイク']), true);
        assert.equal(TitleCheckHelper.checkNames(['この素晴らしい世界に祝福を！紅伝説'], ['この素晴らしい世界に祝福を! 紅伝説']), true);
        assert.equal(TitleCheckHelper.checkNames(['Title'], ['Title XX']), true);
        assert.equal(TitleCheckHelper.checkNames(['Title 2nd Season'], ['Title 2']), true);
        expect(TitleCheckHelper.checkNames(['Title Movie: test test'], ['Title: test test'])).toBeTruthy();

    });

    test('should not match', () => {
        expect(TitleCheckHelper.checkNames(['Title'], ['Title Super Duper'])).toBeFalsy();
        assert.equal(TitleCheckHelper.checkNames(['ATitle'], ['BTitle']), false, '\'ATitle\' should fast match \'BTitle\'');
    });

    test('should match (fastMatch)', () => {
        expect(TitleCheckHelper.fastMatch(['Abc'], ['abcdefg', 'ABCD'])).toBeTruthy();
        expect(TitleCheckHelper.fastMatch(['Title Season 2'], ['title s2'])).toBeTruthy();
        expect(TitleCheckHelper.fastMatch(['Title Title Season 2'], ['title title II'])).toBeTruthy();
        expect(TitleCheckHelper.fastMatch(['ATitle'], ['BTitle'])).toBeFalsy();
        expect(TitleCheckHelper.fastMatch(['Title ABC'], ['Title CBA'])).toBeTruthy();
        expect(TitleCheckHelper.fastMatch(['Test'], ['Test III'])).toBeTruthy();
        expect(TitleCheckHelper.fastMatch(['TITLE!'], ['Title!'])).toBeTruthy();
        expect(TitleCheckHelper.fastMatch(['この素晴らしい世界に祝福を！紅伝説'], ['この素晴らしい世界に祝福を! 紅伝説'])).toBeTruthy();
        return;
    });

    test('should match (skipFastMatch)', () => {
        expect(TitleCheckHelper.checkAnimeNamesInArray(['Title'], ['ATitle', 'title'])).toBeTruthy();
        expect(TitleCheckHelper.checkAnimeNamesInArray(['Title'], ['ATitle', 'Title'])).toBeTruthy();
        expect(TitleCheckHelper.checkAnimeNamesInArray(['Title!'], ['ATitle', 'title'])).toBeTruthy();
        expect(TitleCheckHelper.checkAnimeNamesInArray(['Title!?'], ['ATitle', 'title'])).toBeTruthy();
        expect(TitleCheckHelper.checkAnimeNamesInArray(['Title Season 3'], ['ATitle', 'Title'])).toBeTruthy();
        expect(TitleCheckHelper.checkAnimeNamesInArray(['Title! Season 3'], ['ATitle', 'Title'])).toBeTruthy();
        expect(TitleCheckHelper.checkAnimeNamesInArray(['Title Season 3'], ['ATitle', 'title'])).toBeTruthy();
        expect(TitleCheckHelper.checkAnimeNamesInArray(['Title Season 3'], ['ATitle', 'Ctitle'])).toBeFalsy();
        expect(TitleCheckHelper.checkAnimeNamesInArray(['Title!'], ['ATitle', 'titleG'])).toBeFalsy();
        return;
    });
    test('should remove season from title', () => {
        assert.equal(TitleCheckHelper.removeSeasonMarkesFromTitle('Title Season 2'), 'Title');
        assert.equal(TitleCheckHelper.removeSeasonMarkesFromTitle('Title III'), 'Title');
        assert.equal(TitleCheckHelper.removeSeasonMarkesFromTitle('Title Episode 2'), 'Title Episode 2');
        assert.equal(TitleCheckHelper.removeSeasonMarkesFromTitle('Title 2'), 'Title');
        assert.equal(TitleCheckHelper.removeSeasonMarkesFromTitle('Title 2nd -Test-'), 'Title -Test-');
        assert.equal(TitleCheckHelper.removeSeasonMarkesFromTitle('Title XX'), 'Title');
        assert.equal(TitleCheckHelper.removeSeasonMarkesFromTitle('Title'), 'Title');
        assert.equal(TitleCheckHelper.removeSeasonMarkesFromTitle('Title 2nd Season'), 'Title');
        assert.equal(TitleCheckHelper.removeSeasonMarkesFromTitle('Title 3nd Season'), 'Title');
        expect(TitleCheckHelper.removeSeasonMarkesFromTitle('この素晴らしい世界に祝福を！紅伝説')).toEqual('この素晴らしい世界に祝福を！紅伝説');
        return;
    });

    test('should remove MediaType from title', () => {
        assert.equal(TitleCheckHelper.removeMediaTypeFromTitle('Title: Movie'), 'Title');
        assert.equal(TitleCheckHelper.removeMediaTypeFromTitle('Title Movie'), 'Title');
        assert.equal(TitleCheckHelper.removeMediaTypeFromTitle('Title: Special'), 'Title');
        assert.equal(TitleCheckHelper.removeMediaTypeFromTitle('Title Special'), 'Title');
        assert.equal(TitleCheckHelper.removeMediaTypeFromTitle('Title: Specials'), 'Title');
        assert.equal(TitleCheckHelper.removeMediaTypeFromTitle('Title Specials'), 'Title');
        assert.equal(TitleCheckHelper.removeMediaTypeFromTitle('Title Movie: Test Test'), 'Title: Test Test');
        assert.equal(TitleCheckHelper.removeMediaTypeFromTitle('Title (tv)'), 'Title');
        expect(TitleCheckHelper.removeMediaTypeFromTitle('Title (TV)')).toEqual('Title');
    });

    test('should detect MediaType from title', () => {
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title: Movie'), MediaType.MOVIE);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title Movie'), MediaType.MOVIE);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title Movie: Test Test'), MediaType.MOVIE);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title: Special'), MediaType.SPECIAL);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title Special'), MediaType.SPECIAL);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title: Specials'), MediaType.SPECIAL);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title Specials'), MediaType.SPECIAL);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title Test te test Specials'), MediaType.SPECIAL);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title'), MediaType.UNKOWN);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title (tv)'), MediaType.UNKOWN_SERIES);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('Title (TV)'), MediaType.UNKOWN_SERIES);
        assert.equal(TitleCheckHelper.getMediaTypeFromTitle('title-tv'), MediaType.UNKOWN_SERIES);
        expect(TitleCheckHelper.getMediaTypeFromTitle('titletv')).toEqual(MediaType.UNKOWN);
    });
});
