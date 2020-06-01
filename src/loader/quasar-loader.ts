import {
    Quasar,
    QBtn,
    QVirtualScroll,
    QResizeObserver,
    QSkeleton,
    QIntersection,
    QImg,
    QSelect,
    QInput,
    QBadge,
    QSeparator
} from 'quasar';
import Vue from 'vue';
import './../styles/quasar.sass';
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css';
import '@quasar/extras/material-icons-round/material-icons-round.css';
import '@quasar/extras/material-icons-sharp/material-icons-sharp.css';
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css';
import '@quasar/extras/ionicons-v4/ionicons-v4.css';
import '@quasar/extras/mdi-v4/mdi-v4.css';
import '@quasar/extras/eva-icons/eva-icons.css';

export default class QuasarLoader {
    public static loadQuasar(): void {
        Vue.use(Quasar, {
            components: {
                QBtn,
                QVirtualScroll,
                QResizeObserver,
                QSkeleton,
                QIntersection,
                QImg,
                QSelect,
                QInput,
                QBadge,
                QSeparator
            }
        });
    }
}