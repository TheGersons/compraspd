"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuppliersCrudModule = void 0;
const common_1 = require("@nestjs/common");
const suppliers__crud_service_1 = require("./suppliers--crud.service");
const suppliers__crud_controller_1 = require("./suppliers--crud.controller");
let SuppliersCrudModule = class SuppliersCrudModule {
};
exports.SuppliersCrudModule = SuppliersCrudModule;
exports.SuppliersCrudModule = SuppliersCrudModule = __decorate([
    (0, common_1.Module)({
        controllers: [suppliers__crud_controller_1.SuppliersCrudController],
        providers: [suppliers__crud_service_1.SuppliersCrudService],
    })
], SuppliersCrudModule);
//# sourceMappingURL=suppliers--crud.module.js.map