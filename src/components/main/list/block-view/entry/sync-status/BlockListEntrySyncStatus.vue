<template>
    <div once transition="scale">
        <i class="fas fa-sync fa-5x sync-symbol"></i>
        <q-tooltip content-class="hover-content" >
          <BlockListEntrySyncStatusHover :seriesId="seriesId"/>
        </q-tooltip>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import BlockListEntrySyncStatusHover from './BlockListEntrySyncStatusHover.vue';
import { Prop } from 'vue-property-decorator';
@Component({
	components: {
        BlockListEntrySyncStatusHover
	}
})
export default class BlockListEntrySyncStatus extends Vue {
  @Prop({required:true})
    seriesId!: string;
}
</script>

<style>
    .sync-symbol{
        position: absolute;
        z-index: 8;
        margin: -10px -10px;
        left: auto;
        right: 0px;
        color: green;
        font-size: 20px;
        filter: drop-shadow(3px 3px 10px black);
    }
    .hover-content{
        background-color: #101317;
    }
</style>
