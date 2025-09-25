"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrdersCrudController = void 0;
const common_1 = require("@nestjs/common");
const purchase_orders__crud_service_1 = require("./purchase-orders--crud.service");
const create_purchase_orders__crud_dto_1 = require("./dto/create-purchase-orders--crud.dto");
const update_purchase_orders__crud_dto_1 = require("./dto/update-purchase-orders--crud.dto");
let PurchaseOrdersCrudController = class PurchaseOrdersCrudController {
    purchaseOrdersCrudService;
    constructor(purchaseOrdersCrudService) {
        this.purchaseOrdersCrudService = purchaseOrdersCrudService;
    }
    create(createPurchaseOrdersCrudDto) {
        return this.purchaseOrdersCrudService.create(createPurchaseOrdersCrudDto);
    }
    findAll() {
        return this.purchaseOrdersCrudService.findAll();
    }
    findOne(id) {
        return this.purchaseOrdersCrudService.findOne(+id);
    }
    update(id, updatePurchaseOrdersCrudDto) {
        return this.purchaseOrdersCrudService.update(+id, updatePurchaseOrdersCrudDto);
    }
    remove(id) {
        return this.purchaseOrdersCrudService.remove(+id);
    }
};
exports.PurchaseOrdersCrudController = PurchaseOrdersCrudController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_purchase_orders__crud_dto_1.CreatePurchaseOrdersCrudDto]),
    __metadata("design:returntype", void 0)
], PurchaseOrdersCrudController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PurchaseOrdersCrudController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchaseOrdersCrudController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_purchase_orders__crud_dto_1.UpdatePurchaseOrdersCrudDto]),
    __metadata("design:returntype", void 0)
], PurchaseOrdersCrudController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchaseOrdersCrudController.prototype, "remove", null);
exports.PurchaseOrdersCrudController = PurchaseOrdersCrudController = __decorate([
    (0, common_1.Controller)('purchase-orders--crud'),
    __metadata("design:paramtypes", [purchase_orders__crud_service_1.PurchaseOrdersCrudService])
], PurchaseOrdersCrudController);
//# sourceMappingURL=purchase-orders--crud.controller.js.map