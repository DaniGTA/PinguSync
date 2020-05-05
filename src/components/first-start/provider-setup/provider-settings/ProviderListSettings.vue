
<i18n>
{
  "en":{
    "list_settings": "List Settings"
  }
}
</i18n>

<template>
    <div class="provider-user-list-list">
        <h2>{{$t('list_settings')}}</h2>
        <ProviderSingleListSetting 
        v-for="listSetting in listSettings" 
        :key="listSetting.listInfo.name" 
        :listSetting="listSetting" 
        v-on:change:list:type="onListTypeChange" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import ProviderSyncSettings from './ProviderSyncSettings.vue';
import ListSettings from '../../../../backend/controller/settings/models/provider/list-settings';
import ProviderSingleListSetting from './ProviderSingleListSetting.vue';
import UpdateUserListType from '../../../../backend/controller/frontend/providers/model/update-user-list-type';
import { chSend } from '../../../../backend/communication/send-only-channels';
import WorkerController from '../../../../backend/communication/ipc-renderer-controller';

@Component({
    components: {
        ProviderSyncSettings,
        ProviderSingleListSetting
    }
})
export default class ProviderListSettings extends Vue {
    public workerController: WorkerController = new WorkerController();


    @Prop()
    listSettings!: ListSettings[];
    
    /** 
     * value without providerName.
     */
    public onListTypeChange(value: UpdateUserListType): void {
        this.$emit('change:list:type', value);
    }
}
</script>

<style>
.provider-user-list-list{
  background-color: rgba(0, 0, 0, .25);
  margin: 10px;
  padding: 10px;
  width: fit-content;
  min-width: 400px;
}
</style>