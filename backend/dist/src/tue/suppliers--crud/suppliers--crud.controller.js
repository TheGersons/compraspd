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
exports.SuppliersCrudController = void 0;
const common_1 = require("@nestjs/common");
const suppliers__crud_service_1 = require("./suppliers--crud.service");
const create_suppliers__crud_dto_1 = require("./dto/create-suppliers--crud.dto");
const update_suppliers__crud_dto_1 = require("./dto/update-suppliers--crud.dto");
let SuppliersCrudController = class SuppliersCrudController {
    suppliersCrudService;
    constructor(suppliersCrudService) {
        this.suppliersCrudService = suppliersCrudService;
    }
    create(createSuppliersCrudDto) {
        return this.suppliersCrudService.create(createSuppliersCrudDto);
    }
    findAll() {
        return this.suppliersCrudService.findAll();
    }
    findOne(id) {
        return this.suppliersCrudService.findOne(+id);
    }
    update(id, updateSuppliersCrudDto) {
        return this.suppliersCrudService.update(+id, updateSuppliersCrudDto);
    }
    remove(id) {
        return this.suppliersCrudService.remove(+id);
    }
};
exports.SuppliersCrudController = SuppliersCrudController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_suppliers__crud_dto_1.CreateSuppliersCrudDto]),
    __metadata("design:returntype", void 0)
], SuppliersCrudController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuppliersCrudController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuppliersCrudController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_suppliers__crud_dto_1.UpdateSuppliersCrudDto]),
    __metadata("design:returntype", void 0)
], SuppliersCrudController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuppliersCrudController.prototype, "remove", null);
exports.SuppliersCrudController = SuppliersCrudController = __decorate([
    (0, common_1.Controller)('suppliers--crud'),
    __metadata("design:paramtypes", [suppliers__crud_service_1.SuppliersCrudService])
], SuppliersCrudController);
//# sourceMappingURL=suppliers--crud.controller.js.map