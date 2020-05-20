<template>
  <div class="dropdown">
      <select v-model="selected" @change="onSelectionChange()" class="dropdown">
        <option  v-for="type in getAllListTypes()" :key="type" :value="type">
            {{$t(type+'_LISTTYPE') }}
        </option>
      </select>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { ListType } from '../../../../../backend/controller/settings/models/provider/list-types';
@Component({
    components: {

    }
})
export default class ProviderSettings extends Vue {
    @Prop()
    selected!: ListType;

    public onSelectionChange(): void {
      this.$emit('change:selection', this.selected);
    }

    public getAllListTypes(): string[] {
      return (Object.keys(ListType).map(k => ListType[k as any])).filter(v => typeof v === 'number');
    }
}
</script>

<style>
.dropdown {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}

.dropdown select {
  background-color: rgba(0, 0, 0, 0.25);
  color: #fff;
  font-size: inherit;
  padding: .5em;
  padding-right: 2.5em;	
  border: 0;
  margin: 0;
  border-radius: 3px;
  text-indent: 0.01px;
  text-overflow: '';
  -webkit-appearance: button;
}

.dropdown::before,
.dropdown::after {
  content: "";
  position: absolute;
  pointer-events: none;
}

.dropdown::after {
  content: "\25BC";
  height: 1em;
  font-size: .625em;
  line-height: 1;
  right: 1.2em;
  top: 50%;
  margin-top: -.5em;
}

.dropdown::before {
  width: 2em;
  right: 0;
  top: 0;
  bottom: 0;
  border-radius: 0 3px 3px 0;
}

.dropdown select[disabled] {
  color: rgba(0,0,0,.3);
}

.dropdown select[disabled]::after {
  color: rgba(0,0,0,.1);
}

.dropdown::before {
  background-color: rgba(0,0,0,.15);
}

.dropdown::after {
  color: rgba(0,0,0,.4);
}
</style>