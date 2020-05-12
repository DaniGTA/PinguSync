import Name from '../../controller/objects/meta/name';
import SeasonNumberResponse from '../../controller/objects/meta/response-object/season-number-response';
import { AbsoluteResult } from '../comperators/comperator-results.ts/comperator-result';

export default class TitleHelper {
    public static getAllNamesSortedBySearchAbleScore(names: Name[]): Name[] {
        return names.sort((a, b) => Name.getSearchAbleScore(b, names) - Name.getSearchAbleScore(a, names));
    }

    public static getSeasonNumberBySeasonMarkerInTitle(title: string): SeasonNumberResponse {
        const response = new SeasonNumberResponse();
        const regex = /Season\s{1,}(\d{1,})|(\d{1,})nd|\s(s(\d{1,})($|\s))/gmi;
        const isNumber = /^\d+$/;
        const match = regex.exec(title);
        if (match != null) {
            if (isNumber.test(match[1])) {
                response.seasonNumber = parseInt(match[1], 10);
                response.absoluteResult = AbsoluteResult.ABSOLUTE_TRUE;
                return response;
            } else if (isNumber.test(match[2])) {
                response.seasonNumber = parseInt(match[2], 10);
                response.absoluteResult = AbsoluteResult.ABSOLUTE_TRUE;
                return response;
            } else if (isNumber.test(match[4])) {
                response.seasonNumber = parseInt(match[4], 10);
                response.absoluteResult = AbsoluteResult.ABSOLUTE_TRUE;
                return response;
            }
        }

        response.absoluteResult = AbsoluteResult.ABSOLUTE_NONE;
        return response;
    }
}
