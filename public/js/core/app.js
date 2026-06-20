import { ItemService } from "../services/item-service.js";
import { Bootstrapper } from "./bootstrapper.js";

const App = {
  async init() {
    await Bootstrapper.initialize();
    if (Date.now() - (localStorage.getItem('aqq_last_check') || 0) > 3600000) {
    (window.requestIdleCallback || window.setTimeout)(() => {
        ItemService.processExpiredItems();
        localStorage.setItem('aqq_last_check', Date.now());
    });
}

  },
};

document.addEventListener("DOMContentLoaded", async () => {
  await App.init();
});