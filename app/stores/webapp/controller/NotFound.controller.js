sap.ui.define(["./BaseController"], (BaseController) => {
  "use strict";

  return BaseController.extend("demo.example.controller.NotFound", {
    onGoHomeButtonPress() {
      this.getRouter().navTo("StoresList");
    },
  });
});
