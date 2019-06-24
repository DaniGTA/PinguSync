import { ipcRenderer } from "electron";
import { Anime } from "../controller/objects/anime";

ipcRenderer.on('series-list', (event: any, list: Anime[]) => {
    console.log(list);
});
