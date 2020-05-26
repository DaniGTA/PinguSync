import Vue from 'vue';
import {
    FontAwesomeIcon,
    FontAwesomeLayers,
    FontAwesomeLayersText
} from '@fortawesome/vue-fontawesome';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

export default class FontLoader {
    public static loadFont(): void {
        library.add(fas);
        Vue.component('font-awesome-icon', FontAwesomeIcon);
        Vue.component('font-awesome-layers', FontAwesomeLayers);
        Vue.component('font-awesome-layers-text', FontAwesomeLayersText);
        dom.watch();
    }
}