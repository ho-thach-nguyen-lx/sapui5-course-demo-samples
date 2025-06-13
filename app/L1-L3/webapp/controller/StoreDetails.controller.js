sap.ui.define(["./BaseController"], function (BaseController) {
  "use strict";

  return BaseController.extend("demo.example.controller.StoreDetails", {
    onInit: function () {
      this.getRouter()
        .getRoute("StoreDetails")
        .attachPatternMatched(this.onAttachPatternMatched.bind(this));
    },

    onAttachPatternMatched: function () {
      // Initialize the view
    },

    onNavigateToStoresList: function () {
      this.getRouter().navTo("StoresList");
    },

    onNavigateToProductDetails: function () {
      this.getRouter().navTo("ProductDetails", {
        ID: "1", // Example ID, you can change this as needed
      });
    },
  });
});
