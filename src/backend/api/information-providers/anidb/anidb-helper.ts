import Name from '../../../controller/objects/meta/name';
import TitleCheckHelper from '../../../helpFunctions/name-helper/title-check-helper';
import MultiProviderResult from '../../provider/multi-provider-result';
import AniDBConverter from './anidb-converter';
import AniDBNameManager from './anidb-name-manager';
import { Anime, Title } from './objects/anidbNameListXML';

export default class AniDBHelper {
    public static anidbNameManager: AniDBNameManager = new AniDBNameManager();


    public static async fillSeries(seriesDB: Anime, result: Name[]): Promise<MultiProviderResult> {
        const converter = new AniDBConverter();
        const localdata = converter.convertAnimeToLocalData(seriesDB);
        localdata.mainProvider.providerLocalData.addSeriesName(...result);
        return localdata;
    }
    public static async checkTitles(name: string, titles: Title[] | Title): Promise<Name[]> {
        const converter = new AniDBConverter();
        const resultNames = [];
        let stringTitles = [];
        if (Array.isArray(titles)) {
            stringTitles = titles.flatMap((x) => x._text);
        } else {
            stringTitles.push(titles._text);
        }

        if ( TitleCheckHelper.checkNames([name], stringTitles)) {
            if (Array.isArray(titles)) {
                for (const title of titles) {
                    if (title._text) {
                        const nameType = converter.convertToNameType(title._attributes.type);
                        resultNames.push(new Name(title._text, title._attributes['xml:lang'], nameType));
                    }
                }
            } else {
                const nameType = converter.convertToNameType(titles._attributes.type);
                resultNames.push(new Name(titles._text, titles._attributes['xml:lang'], nameType));
            }
            return resultNames;
        }
        return [];
    }
}
