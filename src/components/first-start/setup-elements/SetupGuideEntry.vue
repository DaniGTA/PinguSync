<template>
    <div class="entry">
        <div class="icon">
            <template v-if="required">
                <template v-if="completed">
                <span class="fa-stack">
                    <i class="fas fa-circle fa-stack-2x check-circle-completed"></i>
                    <i class="fas fa-check fa-stack-2x fa-inverse" data-fa-transform="shrink-6"></i>
                </span>
                </template>
                <template v-else>
                <span class="fa-stack">
                    <i class="fas fa-circle fa-stack-2x check-circle"></i>
                    <i class="fas fa-check fa-stack-2x fa-inverse" data-fa-transform="shrink-6"></i>
                </span>
                </template>
            </template>

            <template v-else>
                <span class="fa-stack">
                    <i class="fas fa-circle fa-stack-2x info-circle"></i>
                    <i class="fas fa-info fa-stack-2x fa-inverse" data-fa-transform="shrink-6"></i>
                </span>
            </template>
        </div>
        <div class="entry-content">
            <div class="description">
                {{description}}
            </div>

            <div v-if="required" class="type">
                ({{requiredText}})
            </div>

            <div v-else class="type">
                ({{optionalText}})
            </div>
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
.entry{
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: .25fr 1fr;
    gap: 1px 1px;
    grid-template-areas: "Icon Content" "Icon Content";
}

.entry-content {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto;
  grid-template-areas: "Title" "Type";
  grid-area: Content;
  align-self: center;
}


.icon {
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    grid-area: Icon;
    font-size: 10px;
    width: 55px;
    align-self: center;
}

.type {
    color: gray;
    grid-area: Type;
    font-weight: 300;
    font-size: 12px;
}

.description {
    grid-area: Title; 
    font-weight: 200;

}

.check-circle {
    color: gray;
}

.check-circle-completed {
    color: green;
}

.info-circle{
    color: #2196F3;
}
</style>