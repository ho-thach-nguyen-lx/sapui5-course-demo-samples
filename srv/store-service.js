const cds = require('@sap/cds');

class StoreService extends cds.ApplicationService {
    init() {
        const { Stores, Products, ProductComments } = this.entities;

        this.after("READ", Stores, this.sortTheResult);
        this.after("READ", Products, this.sortTheResult);
        this.after("READ", ProductComments, this.sortTheResult);

        return super.init();
    }

    sortTheResult(Result) {
        Result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
}

module.exports = StoreService;