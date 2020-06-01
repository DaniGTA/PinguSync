<template>
    <div once transition="scale">
        <i class="fas fa-sync fa-5x sync-symbol"></i>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
@Component({
	components: {
	}
})
export default class BlockListEntrySyncStatus extends Vue {

}
</script>

<style scoped>
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
</style>
