import { shell, ipcRenderer } from "electron";
import ProviderController from "./controller/providerController";
import { ListProvider } from "./api/ListProvider";

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
ipcRenderer.send('get-all-providers');
ipcRenderer.on('all-providers', (event: any, list: string[]) => {
    console.log('Bind all provider:');
    for (const providerName of list) {
        console.log(providerName);
        var authButton = document.getElementById(providerName.toLocaleLowerCase() + '-auth-button');
        var authModal = document.getElementById(providerName.toLocaleLowerCase() + "-auth-modal");
        var authModalClose = document.getElementById(providerName.toLocaleLowerCase() + "-auth-modal-close");
        var authModalForm = document.getElementById(providerName.toLocaleLowerCase() + "-auth-modal-form");

        authButton.classList.add("logged-out");

        checkLogin(authButton, providerName);

        authButton.onclick = () => {
            console.log(providerName + ' open modal');
            authModal.style.display = "block";
            ipcRenderer.send(providerName.toLocaleLowerCase() + '-open-code')

        }

        authModalClose.onclick = () => {
            authModal.style.display = "none";
        }

        authModalForm.onsubmit = () => {
            var codeInput = document.getElementById(providerName.toLocaleLowerCase() + '-auth-modal-form-code') as HTMLInputElement;
            ipcRenderer.send(providerName.toLocaleLowerCase() + '-auth-code', codeInput.value)
            authModal.style.display = "none";
        }
    }
    ipcRenderer.send('get-series-list');
});



function checkLogin(button: HTMLElement, providerName: string) {
    ipcRenderer.on(providerName.toLocaleLowerCase() + '-auth-status', (status: boolean) => {
        if (status) {
            button.classList.remove("logged-out");
            button.classList.add("logged-in")
        } else {
            button.classList.remove("logged-in");
            button.classList.add("logged-out")
        }
    })
    ipcRenderer.send(providerName.toLocaleLowerCase() + '-is-logged-in');
}






