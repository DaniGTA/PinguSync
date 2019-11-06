import MultiProviderResult from '../../../api/provider/multi-provider-result';
import ComperatorResult from '../../comperators/comperator-results.ts/comperator-result';

export default class SearchResultRatingContainer {
    public resultRating: ComperatorResult;
    public result: MultiProviderResult;
    constructor(resultRating: ComperatorResult, result: MultiProviderResult) {
        this.resultRating = resultRating;
        this.result = result;
    }
}
