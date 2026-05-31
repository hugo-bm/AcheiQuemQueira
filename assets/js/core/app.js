import {Bootstrapper} from "./bootstrapper.js"

const App = {
  init() {
    console.info("AQQ initialized 🚀");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

document.addEventListener("DOMContentLoaded", async () => {

  await Bootstrapper.initialize();

});