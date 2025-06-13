sap.ui.define(
  [
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Messaging",
    "sap/ui/core/message/ControlMessageProcessor",
    "sap/ui/core/message/Message",
    "sap/ui/core/message/MessageType",
  ],
  (
    BaseController,
    MessageBox,
    BusyIndicator,
    Messaging,
    ControlMessageProcessor,
    Message,
    MessageType
  ) => {
    "use strict";

    const controlMessageProcessor = new ControlMessageProcessor();

    return BaseController.extend("demo.example.controller.StoresList", {
      onInit() {
        this.getRouter()
          .getRoute("StoresList")
          .attachPatternMatched(this.onAttachPatternMatched.bind(this));
      },

      onAttachPatternMatched() {
        // this.byId("storesList").getBinding("items").refresh();
      },

      async onOpenDialogButtonPress() {
        this._dialog ??= await this.loadFragment({
          addToDependents: true,
          controller: this,
          name: "demo.example.view.fragments.CreateStoreDialog",
        });

        this._dialog.open();
      },

      async onCreateStoreButtonPress(event) {
        const bindingContext = event.getSource().getBindingContext();

        if (this.hasErrors(bindingContext)) {
          return;
        }

        BusyIndicator.show();

        this.getModel().submitBatch("storesList");
        this.byId("storesList").getBinding("items").refresh("storesList");

        bindingContext
          .created()
          .then(() => {
            this._dialog.close();
          })
          .catch((err) => {
            MessageBox.error("Failed to create a new store", { details: err });
          })
          .finally(() => {
            BusyIndicator.hide();
          });
      },

      onCreateStoreDialogBeforeOpen(event) {
        const bindingContext = this.byId("storesList")
          .getBinding("items")
          .create();

        event.getSource().setBindingContext(bindingContext);
      },

      onCloseCreateStoreDialogButtonPress(event) {
        this._dialog.close();
      },

      onDialogAfterClose() {
        const bindingContext = this._dialog.getBindingContext();
        if (bindingContext) {
          bindingContext.delete();
        }
      },

      onObjectListItemPress(event) {
        const ID = event.getSource().getBindingContext().getProperty("ID");

        this.getRouter().navTo("StoresList", {
          "?query": {
            storeId: ID,
          },
        });
      },

      onSearchFieldSearch(event) {
        const value = event.getParameter("query");
        const storesListBinding = this.byId("storesList").getBinding("items");

        storesListBinding.changeParameters({
          $search: value,
        });
        storesListBinding.refresh();
      },

      hasErrors(oBindingContext) {
        let hasErrors = false;
        const oData = oBindingContext.getObject();

        // Validate Name
        if (!oData.Name || oData.Name.trim() === "") {
          Messaging.addMessages(
            new Message({
              message: "Store name is required",
              type: MessageType.Error,
              target: `${this.byId("nameInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!oData.Email || !emailRegex.test(oData.Email)) {
          Messaging.addMessages(
            new Message({
              message: "Please enter a valid email address",
              type: MessageType.Error,
              target: `${this.byId("emailInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        if (!oData.PhoneNumber) {
          Messaging.addMessages(
            new Message({
              message: "Please enter a valid phone number",
              type: MessageType.Error,
              target: `${this.byId("phoneNumberInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        // Validate Address
        if (!oData.Address || oData.Address.trim() === "") {
          Messaging.addMessages(
            new Message({
              message: "Store address is required",
              type: MessageType.Error,
              target: `${this.byId("addressInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        // Validate Established Date
        if (!oData.Established || !this.isValidDate(oData.Established)) {
          Messaging.addMessages(
            new Message({
              message: "Please enter a valid established date",
              type: MessageType.Error,
              target: `${this.byId("establishedInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        // Validate Floor Area
        if (!oData.FloorArea || oData.FloorArea <= 0 || oData.FloorArea > 999) {
          Messaging.addMessages(
            new Message({
              message: "Floor area must be between 1 and 999",
              type: MessageType.Error,
              target: `${this.byId("floorAreaInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        return hasErrors || !!Messaging.getMessageModel().getData().length;
      },

      isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
      },
    });
  }
);
