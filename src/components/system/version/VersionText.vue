<template>
    <div>
        {{ version }}
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'

@Options({
    components: {},
})
export default class VersionText extends Vue {
    version = 'v0.1.0'
}
</script>
