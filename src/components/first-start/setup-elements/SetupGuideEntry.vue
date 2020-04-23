<template>
    <div>
        <div v-if="required">
            <div v-if="completed">
                <i class="fas fa-check-circle"></i>
            </div>
            <div v-else>
                <i class="fas fa-check-circle"></i>
            </div>
        </div>

        <div v-else>
            <i class="fas fa-info-circle"></i>
        </div>

        <div>
            {{description}}
        </div>

        <div v-if="required">
            {{requiredText}}
        </div>

        <div v-else>
            {{optionalText}}
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, PropSync } from 'vue-property-decorator';

@Component({
	components: {

	}
})
export default class SetupGuideEntry extends Vue {
    @Prop({required: true})
    required!: boolean;

    @Prop({required: true})
    description!: string;

    @PropSync('syncCompleted', { type: Boolean, default: false})   
    completed!: boolean;

    optionalText = 'Optional';

    requiredText = 'Benötigt'
}
</script>

<style>

</style>