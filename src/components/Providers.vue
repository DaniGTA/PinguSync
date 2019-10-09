<template>
  <div>
    <ul class="provider-list">
      <li v-for="item in providerList" v-bind:key="item.length">
        <div>{{item}}</div>
        <img
          :src="require('@/assets/'+item.toLowerCase() + '-logo.png')"
          v-bind:ref="item+'-img'"
          class="logged-out"
        />
        <button
          v-on:click="openAuth(item)"
          v-bind:key="item+'-button'"
          v-bind:ref="item+'-button'"
        >{{checkLogin(item)}}Login</button>
      </li>
    </ul>
    <div v-if="currentSelectedProvider != ''">
      <!-- Modal content -->
      <AuthModal v-bind:currentSelectedProvider="currentSelectedProvider"></AuthModal>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ipcRenderer } from "electron";
import MainList from "./MainList.vue";
import App from "../App.vue";
import AuthModal from "./AuthModal.vue";

@Component({
  components: {
    AuthModal
  }
})
export default class Providers extends Vue {
  @Prop() providerList: string[] = [];
  currentSelectedProvider: string = "";
  code: string = "";
  $refs!: {
    authModal: HTMLElement;
  };
  constructor() {
    super();
    const that = this;
    App.workerController.on("all-providers", (data: string[]) => {
      that.providerList = [];
      that.providerList.push(...data);
      console.log("ProviderList loaded.");
      App.workerController.send("get-series-list");
    });
    App.workerController.send("get-all-providers");
    console.log("Request Providers");
  }

  sendCode(provider: string, code: string) {
    App.workerController.send(
      provider.toLocaleLowerCase() + "-auth-code",
      code
    );
    this.$refs.authModal.style.display = "none";
  }

  openAuth(provider: string) {
    this.currentSelectedProvider = provider;
  }

  checkLogin(providerName: string) {
    const that = this;
    App.workerController.on(
      providerName.toLocaleLowerCase() + "-auth-status",
      (status:boolean) => {
      
        const button = (that.$refs as any)[
          providerName + "-button"
        ][0] as HTMLElement;
        const img = (that.$refs as any)[
          providerName + "-img"
        ][0] as HTMLElement;
        console.log(button);
        if (status) {
          button.setAttribute("disable", "true");
          img.classList.remove("logged-out");
          img.classList.add("logged-in");
        } else {
          button.removeAttribute("disable");
          img.classList.add("logged-out");
          img.classList.remove("logged-in");
        }
      }
    );

    App.workerController.send(
      providerName.toLocaleLowerCase() + "-is-logged-in"
    );
  }
}
</script>

<style>
.logged-in {
  filter: grayscale(0);
}

.logged-out {
  filter: grayscale(100);
}

.provider-list {
  list-style-type: none;
  display: flex;
  flex-direction: row-reverse;
}

.provider-list * img {
  width: 5vh;
  cursor: pointer;
  margin: 5px;
}
</style>
