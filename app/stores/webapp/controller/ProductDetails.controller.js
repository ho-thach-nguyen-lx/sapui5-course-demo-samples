sap.ui.define(
  [
    "sap/ui/core/BusyIndicator",
    "./BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
  ],
  function (
    BusyIndicator,
    BaseController,
    MessageToast,
    MessageBox,
    JSONModel
  ) {
    "use strict";

    return BaseController.extend("demo.example.controller.ProductDetails", {
      onInit() {
        const uiModel = new JSONModel({
          commentForm: {
            author: "",
            rating: 0,
            message: "",
          },
        });

        this.getView().setModel(uiModel, "ui");

        this.getRouter()
          .getRoute("ProductDetails")
          .attachPatternMatched(this.onAttachPatternMatched.bind(this));
      },

      onAttachPatternMatched(event) {
        const { storeId, productId } = event.getParameter("arguments");
        const path = `/Stores('${storeId}')/Products('${productId}')`;

        this.getView().bindObject({
          path,
          parameters: {
            $select: "Store_ID",
            $expand: "Comment",
          },
          events: {
            dataReceived: this.onProductDetailsDataReceived.bind(this),
          },
        });
      },

      onProductDetailsDataReceived(event) {
        const error = event.getParameter("error");
        BusyIndicator.hide();

        if (error) {
          this.getRouter()
            .getTargets()
            .display("NotFound", { fromTarget: "ProductDetails" });
        }
      },

      onStoreDetailsPress() {
        const storeId = this.getView().getBindingContext().getObject().Store_ID;
        this.getRouter().navTo("StoreDetails", {
          ID: storeId,
        });
      },

      onPostComment(event) {
        const uiModel = this.getModel("ui");
        const commentForm = uiModel.getProperty("/commentForm");

        // Validate inputs
        if (!commentForm.author || commentForm.rating === 0) {
          MessageBox.error("Please fill in all fields");
          return;
        }

        BusyIndicator.show();

        const productContext = this.getView().getBindingContext();
        const product = productContext.getObject();
        const commentsBinding = this.byId("commentsList").getBinding("items");

        const newComment = {
          Author: commentForm.author,
          Message: commentForm.message,
          Rating: commentForm.rating,
          Posted: new Date().toISOString().split("T")[0],
          Product_ID: product.ID,
        };

        commentsBinding
          .create(newComment)
          .created()
          .then(() => {
            MessageToast.show("Comment added successfully");
            // Reset form
            uiModel.setProperty("/commentForm", {
              author: "",
              rating: 0,
              message: "",
            });
          })
          .catch((error) => {
            MessageToast.show("Error adding comment: " + error.message);
          })
          .finally(() => {
            BusyIndicator.hide();
          });
      },
    });
  }
);
