sap.ui.define(
  [
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Messaging",
    "sap/ui/core/message/ControlMessageProcessor",
    "sap/ui/core/message/Message",
    "sap/ui/core/message/MessageType",
    "./BaseController",
  ],
  (
    BusyIndicator,
    MessageToast,
    MessageBox,
    Filter,
    FilterOperator,
    JSONModel,
    Messaging,
    ControlMessageProcessor,
    Message,
    MessageType,
    BaseController
  ) => {
    "use strict";

    const SORT_STATES = {
      NONE: "sap-icon://sort",
      ASC: "sap-icon://sort-ascending",
      DESC: "sap-icon://sort-descending",
    };

    const controlMessageProcessor = new ControlMessageProcessor();

    return BaseController.extend("demo.example.controller.StoreDetails", {
      onInit() {
        BusyIndicator.show();

        const uiModel = new JSONModel({
          enhanced: false,
          selectedStore: "",
          notFound: false,
          search: "",
          selectedStatus: "ALL",
          sortStates: {
            Name: SORT_STATES.NONE,
            Price_amount: SORT_STATES.NONE,
            Specs: SORT_STATES.NONE,
            SupplierInfo: SORT_STATES.NONE,
            MadeIn: SORT_STATES.NONE,
            ProductionCompanyName: SORT_STATES.NONE,
            Rating: SORT_STATES.NONE,
          },
          statusOptions: [
            { key: "OK", text: "Ok" },
            { key: "STORAGE", text: "Storage" },
            { key: "OUT_OF_STOCK", text: "Out of Stock" },
          ],
        });

        this.getView().setModel(uiModel, "ui");
        this.getRouter()
          .getRoute("StoresList")
          .attachPatternMatched(this.onAttachPatternMatched.bind(this));
      },

      setupIconTabFiltersCount() {
        const oBindingContext = this.getView().getBindingContext();

        // Get all icon tab filters
        this.aIconTabFilters = [
          this.getView().byId("allProductsIconTabFilter"),
          this.getView().byId("okIconTabFilter"),
          this.getView().byId("storageIconTabFilter"),
          this.getView().byId("outOfStockIconTabFilter"),
        ];

        // Set up count bindings for each filter
        this.aIconTabFilters.forEach((oFilter) => {
          const sKey = oFilter.getKey();

          oFilter.bindProperty("count", {
            path: `${oBindingContext}/Products/$count`,
            ...this.getCountBindingParameters(sKey),
          });
        });
      },

      getCountBindingParameters(sKey) {
        const value = this.getModel("ui").getProperty("/search");

        return sKey === "ALL"
          ? {
              parameters: {
                $search: value || undefined,
              },
            }
          : {
              parameters: {
                $filter: `Status eq '${sKey}'`,
                $search: value || undefined,
              },
            };
      },

      onAttachPatternMatched(event) {
        const query = event.getParameters().arguments["?query"] ?? {};

        this.getView()
          .getModel("ui")
          .setProperty("/selectedStore", query.storeId);

        // Set enhanced property based on query parameter
        this.getView()
          .getModel("ui")
          .setProperty("/enhanced", query.enhanced === "true");

        if (!query.storeId) {
          BusyIndicator.hide();
          return;
        }

        const path = `/Stores(${query.storeId})`;

        this.getView().bindObject({
          path,
          events: { dataReceived: this.onStoreDetailsDataReceived.bind(this) },
        });

        // this.byId("productsTable").getBinding("items").refresh();

        this.setupIconTabFiltersCount();
      },

      onStoreDetailsDataReceived(event) {
        const error = event.getParameter("error");

        BusyIndicator.hide();

        if (error) {
          this.getView().getModel("ui").setProperty("/selectedStore", false);
          this.getView().getModel("ui").setProperty("/notFound", true);
          this.getRouter()
            .getTargets()
            .display("NotFound", { fromTarget: "StoreDetails" });
        }
      },

      onProductSearchFieldSearch(event) {
        const value = event.getParameter("query");
        const oBindingContext = this.getView().getBindingContext();

        // Update table binding
        this.byId("productsTable")
          .getBinding("items")
          .changeParameters({ $search: value });

        this.byId("productsTable").getBinding("items").refresh();

        // Update count bindings with search filter
        this.aIconTabFilters.forEach((oFilter) => {
          const sKey = oFilter.getKey();

          oFilter.bindProperty("count", {
            path: `${oBindingContext}/Products/$count`,
            ...this.getCountBindingParameters(sKey),
          });
        });
      },

      onIconTabBarSelect(event) {
        const selectedStatus = event.getParameter("selectedKey");

        this.byId("productsTable")
          .getBinding("items")
          .filter(
            selectedStatus === "ALL"
              ? null
              : new Filter("Status", FilterOperator.Contains, selectedStatus)
          );
      },

      async onConfirmStoreDeleteButtonPress() {
        await this.warn("Do you want delete this store?");

        this.deleteStore();
      },

      deleteStore() {
        BusyIndicator.show();

        this.getView()
          .getBindingContext()
          .delete()
          .then(() => {
            MessageToast.show("Store successfully deleted");

            this.getRouter().navTo("StoresList", {
              closeOnBrowserNavigation: false,
            });
          })
          .catch((err) => {
            MessageBox.error("Failed to delete the store", { details: err });
          })
          .finally(() => BusyIndicator.hide());
      },

      async onProductDeleteButtonPress(event) {
        await this.warn("Do you want delete this product?");

        this.deleteProduct(event.getSource().getBindingContext());
      },

      deleteProduct(product) {
        BusyIndicator.show();

        product
          .delete("productsTable", true)
          .then(() => {
            MessageToast.show("Product successfully deleted");
            this.refreshCountBindings();
          })
          .finally(() => BusyIndicator.hide());

        this.getModel().submitBatch("productsTable");
      },

      onProductItemPress(event) {
        const product = event.getSource().getBindingContext().getObject();
        const storeId = this.getView().getBindingContext().getObject().ID;

        this.getRouter().navTo("ProductDetails", {
          storeId,
          productId: product.ID,
        });
      },

      async onProductEditPress(event) {
        const bindingContext = event.getSource().getBindingContext();

        this._productDialog ??= await this.loadFragment({
          name: "demo.example.view.fragments.ProductDialog",
          addToDependents: false,
        });

        bindingContext.getBinding().attachPatchCompleted(() => {
          BusyIndicator.hide();
          this._productDialog.close();
          MessageToast.show("Product updated");
          this.refreshCountBindings();
          this.byId("productsTable").getBinding("items").refresh();
        });
        this._productDialog.setBindingContext(bindingContext);

        this.getView().addDependent(this._productDialog);
        this._productDialog.open();
      },

      async onCreateProductDialogPress() {
        const bindingContext = this.byId("productsTable")
          .getBinding("items")
          .create({ Status: "OK" });

        this._productDialog ??= await this.loadFragment({
          name: "demo.example.view.fragments.ProductDialog",
          addToDependents: false,
        });

        this._productDialog.setBindingContext(bindingContext);
        this.getView().addDependent(this._productDialog);
        this._productDialog.open();
      },

      async onCreateProductButtonPress(event) {
        const bindingContext = event.getSource().getBindingContext();
        const isEdit = bindingContext.getProperty("ID") !== null;

        if (this.hasProductErrors(bindingContext)) {
          return;
        }

        BusyIndicator.show();

        this.getModel().submitBatch("productsTable");

        if (isEdit) return;

        bindingContext
          .created()
          .then(() => {
            MessageToast.show("Product created");
            this._productDialog.close();
            this.refreshCountBindings();
            this.byId("productsTable").getBinding("items").refresh();
          })
          .catch((err) => {
            MessageBox.error("Failed to create a product", { details: err });
          })
          .finally(() => {
            BusyIndicator.hide();
          });
      },

      onCloseCreateProductDialogButtonPress() {
        this._productDialog.close();
      },

      onProductDialogAfterClose() {
        const bindingContext = this._productDialog.getBindingContext();
        const id = bindingContext.getProperty("ID");

        if (id) {
          bindingContext.resetChanges();
        } else {
          bindingContext.delete();
        }
      },

      hasProductErrors(oBindingContext) {
        let hasErrors = false;
        const oData = oBindingContext.getObject();

        // Validate Name
        if (!oData.Name || oData.Name.trim() === "") {
          Messaging.addMessages(
            new Message({
              message: "Product name is required",
              type: MessageType.Error,
              target: `${this.byId("productNameInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        // Validate Price
        if (!oData.Price_amount || oData.Price_amount <= 0) {
          Messaging.addMessages(
            new Message({
              message: "Please enter a valid price",
              type: MessageType.Error,
              target: `${this.byId("productPriceInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        // Validate Specs
        if (!oData.Specs || oData.Specs.trim() === "") {
          Messaging.addMessages(
            new Message({
              message: "Product specifications are required",
              type: MessageType.Error,
              target: `${this.byId("productSpecsInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        // Validate Rating
        if (!oData.Rating || oData.Rating < 1 || oData.Rating > 5) {
          Messaging.addMessages(
            new Message({
              message: "Rating must be between 1 and 5",
              type: MessageType.Error,
              target: `${this.byId("productRatingInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        // Validate Supplier Info
        if (!oData.SupplierInfo || oData.SupplierInfo.trim() === "") {
          Messaging.addMessages(
            new Message({
              message: "Supplier information is required",
              type: MessageType.Error,
              target: `${this.byId("productSupplierInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        // Validate Country
        if (!oData.MadeIn || oData.MadeIn.trim() === "") {
          Messaging.addMessages(
            new Message({
              message: "Country of origin is required",
              type: MessageType.Error,
              target: `${this.byId("productCountryInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        // Validate Company
        if (
          !oData.ProductionCompanyName ||
          oData.ProductionCompanyName.trim() === ""
        ) {
          Messaging.addMessages(
            new Message({
              message: "Production company name is required",
              type: MessageType.Error,
              target: `${this.byId("productCompanyInput").getId()}/value`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        // Validate Status
        if (!oData.Status) {
          Messaging.addMessages(
            new Message({
              message: "Product status is required",
              type: MessageType.Error,
              target: `${this.byId("productStatusSelect").getId()}/selectedKey`,
              processor: controlMessageProcessor,
            })
          );
          hasErrors = true;
        }

        return hasErrors || !!Messaging.getMessageModel().getData().length;
      },

      onSortButtonPress(columnName) {
        const uiModel = this.getModel("ui");
        const currentState = uiModel.getProperty(`/sortStates/${columnName}`);
        const table = this.byId("productsTable");
        const binding = table.getBinding("items");

        // Reset all other columns to NONE
        Object.keys(uiModel.getProperty("/sortStates")).forEach((key) => {
          if (key !== columnName) {
            uiModel.setProperty(`/sortStates/${key}`, SORT_STATES.NONE);
          }
        });

        // Update current column state
        let newState;
        let sortOrder;
        switch (currentState) {
          case SORT_STATES.NONE:
            newState = SORT_STATES.ASC;
            sortOrder = "asc";
            break;
          case SORT_STATES.ASC:
            newState = SORT_STATES.DESC;
            sortOrder = "desc";
            break;
          default:
            newState = SORT_STATES.NONE;
            sortOrder = null;
        }

        uiModel.setProperty(`/sortStates/${columnName}`, newState);

        // Apply sorting
        if (sortOrder) {
          binding.sort(
            new sap.ui.model.Sorter(columnName, sortOrder === "desc")
          );
        } else {
          binding.sort([]);
        }
      },

      refreshCountBindings() {
        const oBindingContext = this.getView().getBindingContext();

        this.aIconTabFilters.forEach((oFilter) => {
          const sKey = oFilter.getKey();

          oFilter.bindProperty("count", {
            path: `${oBindingContext}/Products/$count`,
            ...this.getCountBindingParameters(sKey),
          });
        });
      },
    });
  }
);
