<template>
    <div class="provider-setup-placeholder">
        Bitte wähle oben in der Liste einen Provider aus den Sie benutzen möchten.
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'

@Options({
    components: {},
})
export default class ProviderSetupPlaceholder extends Vue {}
</script>

<style lang="scss" scoped>
.provider-setup-placeholder {
    color: $primary-text;
}
</style>
