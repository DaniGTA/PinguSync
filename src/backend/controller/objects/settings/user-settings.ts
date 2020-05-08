import { PreferedSeriesName } from './prefered-series-name';


export default class UserSettings {
    public preferedSeriesName: PreferedSeriesName = PreferedSeriesName.ROMANJI;
    public finishedFirstSetup = false;
}
