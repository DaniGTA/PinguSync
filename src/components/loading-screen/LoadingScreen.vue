<template>
    <div class="loading-screen"> 
        <LoadingTitle :stitle.sync="loadingTitle" />
        <div class="loading-space">
            <LoadingAnimation class="loading-space-animation" />
            <div class="loading-text">
                {{loadingText}}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import LoadingAnimation from './LoadingAnimation.vue';
import LoadingTitle from './LoadingTitle.vue';

@Component({
	components: {
		LoadingAnimation,
		LoadingTitle,
	}
})
export default class LoadingScreen extends Vue {
    loadingText = 'Loading...';
    loadingTitle= 'Willkommen auf AtsuListManager'
}
</script>


<style>
.loading-screen {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    width: fit-content;
}

.loading-space {
    width: 100%;
    margin: auto;
    background: rgba(0, 0, 0, 0.8);

}

.loading-text {
    margin: auto;
    color: #838383;
    font-family: "Segoe UI";
    font-size: 18px;
    width: fit-content;
    height: 40px;
}

.loading-space-animation {
    height: 70px;
    margin: auto;
}

</style>