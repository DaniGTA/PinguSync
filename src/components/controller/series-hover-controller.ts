import { Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '../../store';

@Module({
    dynamic: true,
    name: 'seriesHoverController',
    store
})
export default class SeriesHoverController extends VuexModule {
    public currentlyHoveringSeriesId = '';

    @Mutation
    SET_currentlyHoveringSeriesId(value: string): void {
        this.currentlyHoveringSeriesId = value;
    }
}