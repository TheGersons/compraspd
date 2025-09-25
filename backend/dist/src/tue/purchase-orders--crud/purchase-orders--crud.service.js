"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrdersCrudService = void 0;
const common_1 = require("@nestjs/common");
let PurchaseOrdersCrudService = class PurchaseOrdersCrudService {
    create(createPurchaseOrdersCrudDto) {
        return 'This action adds a new purchaseOrdersCrud';
    }
    findAll() {
        return `This action returns all purchaseOrdersCrud`;
    }
    findOne(id) {
        return `This action returns a #${id} purchaseOrdersCrud`;
    }
    update(id, updatePurchaseOrdersCrudDto) {
        return `This action updates a #${id} purchaseOrdersCrud`;
    }
    remove(id) {
        return `This action removes a #${id} purchaseOrdersCrud`;
    }
};
exports.PurchaseOrdersCrudService = PurchaseOrdersCrudService;
exports.PurchaseOrdersCrudService = PurchaseOrdersCrudService = __decorate([
    (0, common_1.Injectable)()
], PurchaseOrdersCrudService);
//# sourceMappingURL=purchase-orders--crud.service.js.map