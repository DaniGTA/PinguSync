import MultiProviderResult from '../../api/provider/multi-provider-result';
import Series from '../objects/series';
import MainListAdder from './main-list-adder';
export default class MainListEntryUpdater {
    /**
     * Use ListController to add Series too the MainList.
     *
     * This just managed the Waitlist.
     * @param series
     */
    public async updateSeries(...providers: MultiProviderResult[]): Promise<void> {
        const notFounded: Series[] = [];
        for (const provider of providers) {
            const newSeries = new Series();
            await newSeries.addProviderDatasWithSeasonInfos(...provider.getAllProvidersWithSeason());
            notFounded.push(newSeries);
        }
        await new MainListAdder().addSeries(...notFounded);
    }
}
