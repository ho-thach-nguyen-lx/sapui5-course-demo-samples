sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("demo.example.controller.StoresList", {
    onInit: function () {
      // Initialize the view
    },

    onNavigateToStoreDetails: function () {
      this.getOwnerComponent().getRouter().navTo("StoreDetails", {
        ID: "1", // Example ID, you can change this as needed
      });
    },
  });
});
