import Vuex from 'vuex';

export default new Vuex.Store({
    state: {
        currentlyHoveringSeriesId: String
    },

    mutations: {
        updateCurrentlyHoveringSeriesId(state: any, newSeriesId: string): void {
            state.currentlyHoveringSeriesId = newSeriesId;
        }
    },
    actions: {
        addToDo(context: any, newSeriesId: string): void {
            context.commit('updateCurrentlyHoveringSeriesId', newSeriesId);
        }
    }
});