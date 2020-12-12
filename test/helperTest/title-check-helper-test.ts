import { MediaType } from '../../src/backend/controller/objects/meta/media-type';
import TitleCheckHelper from '../../src/backend/helpFunctions/name-helper/title-check-helper';

describe('Title Checker | Some title examples', () => {
    test('should match all titles with checkNames', () => {
        expect(TitleCheckHelper.checkNames(['Title: Check, It`s a Test` but` its still a test!'], ['Title ~Check, It’s a test but’ its still a test!~'])).toBeTruthy();
        expect(TitleCheckHelper.checkNames(['Kiniro Mosaic'], ['Kin`iro Mosaic', 'Kiniro Mosaic', 'Kinmosa', 'Kinmoza!', 'きんいろモザイク'])).toBeTruthy();
        expect(TitleCheckHelper.checkNames(['この素晴らしい世界に祝福を！紅伝説'], ['この素晴らしい世界に祝福を! 紅伝説'])).toBeTruthy();
        expect(TitleCheckHelper.checkNames(['Title'], ['Title XX'])).toBeTruthy();
        expect(TitleCheckHelper.checkNames(['Title 2nd Season'], ['Title 2'])).toBeTruthy();
        expect(TitleCheckHelper.checkNames(['Title Movie: test test'], ['Title: test test'])).toBeTruthy();

    });

    test('should not match', () => {
        expect(TitleCheckHelper.checkNames(['Title'], ['Title Super Duper'])).toBeFalsy();
        expect(TitleCheckHelper.checkNames(['ATitle'], ['BTitle'])).toBeFalsy();
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
        expect(TitleCheckHelper.removeSeasonMarkesFromTitle('Title Season 2')).toBe( 'Title');
        expect(TitleCheckHelper.removeSeasonMarkesFromTitle('Title III')).toBe( 'Title');
        expect(TitleCheckHelper.removeSeasonMarkesFromTitle('Title Episode 2')).toBe( 'Title Episode 2');
        expect(TitleCheckHelper.removeSeasonMarkesFromTitle('Title 2')).toBe( 'Title');
        expect(TitleCheckHelper.removeSeasonMarkesFromTitle('Title 2nd -Test-')).toBe( 'Title -Test-');
        expect(TitleCheckHelper.removeSeasonMarkesFromTitle('Title XX')).toBe( 'Title');
        expect(TitleCheckHelper.removeSeasonMarkesFromTitle('Title')).toBe( 'Title');
        expect(TitleCheckHelper.removeSeasonMarkesFromTitle('Title 2nd Season')).toBe( 'Title');
        expect(TitleCheckHelper.removeSeasonMarkesFromTitle('Title 3nd Season')).toBe( 'Title');
        expect(TitleCheckHelper.removeSeasonMarkesFromTitle('この素晴らしい世界に祝福を！紅伝説')).toEqual('この素晴らしい世界に祝福を！紅伝説');
        return;
    });

    test('should remove MediaType from title', () => {
        expect(TitleCheckHelper.removeMediaTypeFromTitle('Title: Movie')).toBe('Title');
        expect(TitleCheckHelper.removeMediaTypeFromTitle('Title Movie')).toBe('Title');
        expect(TitleCheckHelper.removeMediaTypeFromTitle('Title: Special')).toBe('Title');
        expect(TitleCheckHelper.removeMediaTypeFromTitle('Title Special')).toBe('Title');
        expect(TitleCheckHelper.removeMediaTypeFromTitle('Title: Specials')).toBe('Title');
        expect(TitleCheckHelper.removeMediaTypeFromTitle('Title Specials')).toBe('Title');
        expect(TitleCheckHelper.removeMediaTypeFromTitle('Title Movie: Test Test')).toBe( 'Title: Test Test');
        expect(TitleCheckHelper.removeMediaTypeFromTitle('Title (tv)')).toBe( 'Title');
        expect(TitleCheckHelper.removeMediaTypeFromTitle('Title (TV)')).toEqual('Title');
    });

    test('should detect MediaType from title', () => {
        expect(TitleCheckHelper.getMediaTypeFromTitle('Title: Movie')).toBe( MediaType.MOVIE);
        expect(TitleCheckHelper.getMediaTypeFromTitle('Title Movie')).toBe( MediaType.MOVIE);
        expect(TitleCheckHelper.getMediaTypeFromTitle('Title Movie: Test Test')).toBe( MediaType.MOVIE);
        expect(TitleCheckHelper.getMediaTypeFromTitle('Title: Special')).toBe( MediaType.SPECIAL);
        expect(TitleCheckHelper.getMediaTypeFromTitle('Title Special')).toBe( MediaType.SPECIAL);
        expect(TitleCheckHelper.getMediaTypeFromTitle('Title: Specials')).toBe( MediaType.SPECIAL);
        expect(TitleCheckHelper.getMediaTypeFromTitle('Title Specials')).toBe( MediaType.SPECIAL);
        expect(TitleCheckHelper.getMediaTypeFromTitle('Title Test te test Specials')).toBe( MediaType.SPECIAL);
        expect(TitleCheckHelper.getMediaTypeFromTitle('Title')).toBe( MediaType.UNKOWN);
        expect(TitleCheckHelper.getMediaTypeFromTitle('Title (tv)')).toBe( MediaType.UNKOWN_SERIES);
        expect(TitleCheckHelper.getMediaTypeFromTitle('Title (TV)')).toBe( MediaType.UNKOWN_SERIES);
        expect(TitleCheckHelper.getMediaTypeFromTitle('title-tv')).toBe( MediaType.UNKOWN_SERIES);
        expect(TitleCheckHelper.getMediaTypeFromTitle('titletv')).toEqual(MediaType.UNKOWN);
    });
});
