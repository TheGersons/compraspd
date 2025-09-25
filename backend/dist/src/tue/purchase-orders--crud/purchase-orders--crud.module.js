"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrdersCrudModule = void 0;
const common_1 = require("@nestjs/common");
const purchase_orders__crud_service_1 = require("./purchase-orders--crud.service");
const purchase_orders__crud_controller_1 = require("./purchase-orders--crud.controller");
let PurchaseOrdersCrudModule = class PurchaseOrdersCrudModule {
};
exports.PurchaseOrdersCrudModule = PurchaseOrdersCrudModule;
exports.PurchaseOrdersCrudModule = PurchaseOrdersCrudModule = __decorate([
    (0, common_1.Module)({
        controllers: [purchase_orders__crud_controller_1.PurchaseOrdersCrudController],
        providers: [purchase_orders__crud_service_1.PurchaseOrdersCrudService],
    })
], PurchaseOrdersCrudModule);
//# sourceMappingURL=purchase-orders--crud.module.js.map