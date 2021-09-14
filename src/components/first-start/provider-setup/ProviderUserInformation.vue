<template>
    <div class="provider-user-name" v-if="username !== ''"><i class="fas fa-user"></i> {{ username }}</div>
</template>

<script lang="ts">
import ListProvider from '@backend/api/provider/list-provider'
import { Vue, Options } from 'vue-class-component'

class Props {
    provider!: ListProvider
}

@Options({
    components: {},
})
export default class ProviderUserInformation extends Vue.with(Props) {
    public username = ''

    async mounted(): Promise<void> {
        if (this.provider) {
            this.username = await window.electron.controller.providerController.getUsername(this.provider.providerName)
        }
    }
}
</script>

<style lang="scss" scoped>
.provider-user-name {
    color: $primary-text;
    font-size: small;
}
</style>
