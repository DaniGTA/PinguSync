<template>
  <div>
    <ul class="provider-list">
      <li v-for="item in providerList" v-bind:key="item.length">
        <div>{{item}}</div>
        <img :src="require('@/assets/'+item.toLowerCase() + '-logo.png')" />
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
        <form action="#">
          <input v-model="code" placeholder="code" />
          <button v-on:click="sendCode(currentSelectedProvider,code)" type="submit">Confirm</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ipcRenderer } from "electron";
import MainList from "./MainList.vue";
import { WorkerTransfer } from "../backend/controller/objects/workerTransfer";
import App from "../App.vue";
@Component
export default class Providers extends Vue {
  @Prop() providerList: string[] = [];
  @Prop() currentSelectedProvider: string = "";
  @Prop() code: string = "";
  $refs!: {
    authModal: HTMLElement;
  };
  constructor() {
    super();
    const that = this;
    App.workerController.on("all-providers", (data: string[]) => {
      that.providerList = [];
      for (const entry of data) {
        //that.providerList.push(entry);
        //that.checkLogin(entry);
      }
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
      status => {
        const button = (this.$refs as any)[providerName + "-button"][0];
        console.log(button);
        if (status) {
          button.classList.remove("logged-out");
          button.classList.add("logged-in");
        } else {
          button.classList.remove("logged-in");
          button.classList.add("logged-out");
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
