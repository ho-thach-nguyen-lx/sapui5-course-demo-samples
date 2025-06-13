sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("demo.example.controller.StoreDetails", {
    onInit: function () {
      // Initialize the view
    },

    onNavigateToStoresList: function () {
      this.getOwnerComponent().getRouter().navTo("StoresList");
    },

    onNavigateToProductDetails: function () {
      this.getOwnerComponent().getRouter().navTo("ProductDetails", {
        ID: "1", // Example ID, you can change this as needed
      });
    },
  });
});
