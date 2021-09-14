<template>
    <div class="provider-user-list-list">
        <h2>{{ $t('ProviderListSettings.list_settings') }}</h2>
        <ProviderSingleListSetting
            v-for="listSetting in listSettings"
            :key="listSetting.listInfo.name"
            :listSetting="listSetting"
            v-on:change:list:type="onListTypeChange"
        />
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import ProviderSyncSettings from './ProviderSyncSettings.vue'
import ListSettings from '../../../../backend/controller/settings/models/provider/list-settings'
import ProviderSingleListSetting from './ProviderSingleListSetting.vue'
import UpdateUserListType from '../../../../backend/controller/frontend/providers/model/update-user-list-type'

class Props {
    listSettings!: ListSettings[]
}

@Options({
    components: {
        ProviderSyncSettings,
        ProviderSingleListSetting,
    },
})
export default class ProviderListSettings extends Vue.with(Props) {
    /**
     * value without providerName.
     */
    public onListTypeChange(value: UpdateUserListType): void {
        this.$emit('change:list:type', value)
    }
}
</script>

<style>
.provider-user-list-list {
    background-color: rgba(0, 0, 0, 0.25);
    margin: 10px;
    padding: 10px;
    width: fit-content;
    min-width: 400px;
}
</style>
