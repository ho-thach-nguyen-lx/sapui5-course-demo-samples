sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("demo.example.controller.NotFound", {
    onInit: function () {
      // Initialize the view
    },

    onNavBack: function () {
      window.history.go(-1);
    },
  });
});
