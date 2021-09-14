<template></template>

<script lang="ts">
import ListProvider from '@backend/api/provider/list-provider'
import { Vue, Options, prop } from 'vue-class-component'

class Props {
    provider!: ListProvider
    showText = prop<boolean>({ default: true })
}

@Options({})
export default class ProviderImageBlock extends Vue.with(Props) {}
</script>

<style></style>
