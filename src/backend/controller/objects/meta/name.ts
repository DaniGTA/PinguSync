import { NameType } from './nameType';
import stringHelper from '../../../helpFunctions/stringHelper';

export default class Name {
    name: string = '';
    lang: string = '';
    nameType: NameType = NameType.UNKNOWN;
    constructor(name: string, lang: string, nameType: NameType = NameType.UNKNOWN) {
        this.name = name;
        this.lang = lang;
        this.nameType = nameType;
    }

    public static async getRomajiName(names: Name[]): Promise<string> {
        let kanjiTitle = null;
        for (const name of names) {
            if (name.lang == 'x-jap' && name.nameType === NameType.MAIN) {
                return name.name;
            }
            if (!await stringHelper.hasKanji(name.name)) {
                kanjiTitle = name.name;
            }
        }

        if (kanjiTitle) {
            return kanjiTitle;
        }

        throw names + 'HasNoRomajiName';
    }
    public static async getSeasonNumber(names: Name[]): Promise<number | undefined> {
        var highestSeasonDetected: number | undefined;
        for (const name of names) {
            if (name && name.name) {
                if (name.lang !== "slug") {
                    if (name.nameType != NameType.SLUG) {
                        try {
                            var nr = await stringHelper.getSeasonNumberFromTitle(name.name);
                            if (nr > (highestSeasonDetected ? highestSeasonDetected : 0)) {
                                highestSeasonDetected = nr;
                            }
                        } catch (err) { }
                    }
                }
            }
        }
        return highestSeasonDetected;
    }
}
