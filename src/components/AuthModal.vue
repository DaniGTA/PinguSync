<template>
  <div class="modal">
    <!-- Modal content -->
    <div class="modal-content">
      <span v-on:click="closeModal()" class="close">&times;</span>
      <h2>Enter the {{currentSelectedProvider}} Code</h2>
      <form>
        <input v-model="code" placeholder="code" />
        <button v-on:click="sendCode(code)" type="reset">Confirm</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, PropSync } from "vue-property-decorator";
import { ipcRenderer } from "electron";
import MainList from "./MainList.vue";
import App from "../App.vue";

@Component
export default class Providers extends Vue {
  @PropSync("currentSelectedProvider", { type: String })
  cSelectedProvider!: string;
  code: string = "";
  $refs!: {
    authModal: HTMLElement;
  };
  constructor() {
    super();
    const that = this;
  }

  closeModal() {
    this.cSelectedProvider = "";
    this.code = "";
  }

  sendCode(code: string) {
    if (code) {
      const providerAuthName =
        this.cSelectedProvider.toLocaleLowerCase() + "-auth-code";
      console.log("Auth Provider:" + providerAuthName + " with code: " + code);
      App.workerController.send(providerAuthName, code);
      this.closeModal();
    }
  }
}
</script>

<style>
input {
  color: black;
}
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
  background-color: black;
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
