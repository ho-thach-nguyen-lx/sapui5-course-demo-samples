sap.ui.define(
  ["sap/m/MessageBox", "sap/ui/core/mvc/Controller"],
  (MessageBox, Controller) => {
    "use strict";

    return Controller.extend("demo.example.controller.App", {
      getRouter() {
        return this.getOwnerComponent().getRouter();
      },

      getModel(...args) {
        return this.getView().getModel(...args);
      },

      byId(id) {
        return this.getView().byId(id);
      },

      warn(title) {
        return new Promise((res, rej) => {
          MessageBox.warning(title, {
            actions: ["YES", "NO"],
            emphasizedAction: "YES",
            onClose: (action) => {
              if (action === "YES") res();

              rej();
            },
          });
        });
      },
    });
  }
);
