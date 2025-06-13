sap.ui.define(["./BaseController"], function (BaseController) {
  "use strict";

  return BaseController.extend("demo.example.controller.StoresList", {
    onInit: function () {
      this.getRouter()
        .getRoute("StoresList")
        .attachPatternMatched(this.onAttachPatternMatched.bind(this));
    },

    onAttachPatternMatched: function () {
      // Initialize the view
    },

    onNavigateToStoreDetails: function () {
      this.getRouter().navTo("StoreDetails", {
        ID: "1", // Example ID, you can change this as needed
      });
    },
  });
});
