<i18n>
{
  "en": {
    "SyncTo": "Sync to"
  },
  "de": {
    "SyncTo": "Synchronisiere zu"
  }
}
</i18n>


<template>
    <div class="provider-user-list-setting-entry">
        <div class="provider-user-list-name">{{listSetting.listInfo.name}}</div>
        <div class="provider-user-list-sync-icon"><i class="fas fa-sync"></i></div>
        <SelectedListType :selected="listSetting.listInfo.type" v-on:change:selection="onSelection"  />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import ListSettings from '../../../../backend/controller/settings/models/provider/list-settings';
import WorkerController from '../../../../backend/communication/ipc-renderer-controller';
import { ListType } from '../../../../backend/controller/settings/models/provider/list-types';
import SelectedListType from './provider-user-list/SelectedListType.vue';
import UpdateUserListType from '../../../../backend/controller/frontend/providers/model/update-user-list-type';
@Component({
    components: {
        SelectedListType
    }
})
export default class ProviderSingleListSetting extends Vue {
    public workerController: WorkerController = new WorkerController();

    @Prop()
    listSetting!: ListSettings;

    public onSelection(value: ListType = ListType.UNKOWN): void {
        const data: UpdateUserListType = {listSetting: this.listSetting, newListType: value, providerName:''}; 
        this.$emit('change:list:type', data);
    }
}
</script>
<style>
.provider-user-list-sync-icon{
    align-self: center;
    margin: 0px 15px;
}

.provider-user-list-setting-entry{
    margin: 10px;
    display: flex;
}

.provider-user-list-name{
    background: rgba(0, 0, 0, 0.25);
    padding: 5px;
    border-radius: 3px;
    font-size: large;
    min-width: 150px;
}
</style>