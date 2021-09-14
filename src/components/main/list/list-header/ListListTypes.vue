<template>
    <div class="list-list-types">
        <div><i class="fas fa-th-large"></i></div>
        <div><i class="fas fa-list"></i></div>
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'

@Options({
    components: {},
})
export default class ListListTypes extends Vue {}
</script>

<style lang="scss" scoped>
.list-list-types {
    display: flex;
    background-color: $primary-background;
    color: $second-text;
    width: 100px;
    height: 38px;
    justify-content: space-evenly;
    font-size: 30px;
    margin: 10px;
}
</style>
