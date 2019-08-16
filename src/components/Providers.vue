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
    <div ref="authModal" class="modal">
      <!-- Modal content -->
      <div class="modal-content">
        <span v-on:click="closeModal()" class="close">&times;</span>
        <h2>Enter the {{currentSelectedProvider}} Code</h2>
        <form>
          <input v-model="code" placeholder="code" />
          <button v-on:click="sendCode(currentSelectedProvider,code)" type="reset">Confirm</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ipcRenderer } from "electron";
import MainList from "./MainList.vue";
import App from "../App.vue";


@Component
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

  closeModal() {
    this.$refs.authModal.style.display = "none";
    this.code = "";
  }

  sendCode(provider: string, code: string) {
    App.workerController.send(
      provider.toLocaleLowerCase() + "-auth-code",
      code
    );
    this.$refs.authModal.style.display = "none";
  }

  openAuth(provider: string) {
    App.workerController.on("open-url", (url: string) => {
      ipcRenderer.send("open-url", url);
    });
    App.workerController.send(provider.toLocaleLowerCase() + "-open-code-url");
    this.currentSelectedProvider = provider;
    this.$refs.authModal.style.display = "block";
  }

  checkLogin(providerName: string) {
    App.workerController.on(
      providerName.toLocaleLowerCase() + "-auth-status",
      (status:boolean) => {
        const button = (this.$refs as any)[
          providerName + "-button"
        ][0] as HTMLElement;
        const img = (this.$refs as any)[
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

/* The Modal (background) */
.modal {
  display: none;
  /* Hidden by default */
  position: fixed;
  /* Stay in place */
  z-index: 1;
  /* Sit on top */
  left: 0;
  top: 0;
  width: 100%;
  /* Full width */
  height: 100%;
  /* Full height */
  overflow: auto;
  /* Enable scroll if needed */
  background-color: rgb(0, 0, 0);
  /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4);
  /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  /* Could be more or less, depending on screen size */
}

/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
