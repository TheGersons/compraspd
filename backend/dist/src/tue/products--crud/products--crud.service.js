"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsCrudService = void 0;
const common_1 = require("@nestjs/common");
let ProductsCrudService = class ProductsCrudService {
    create(createProductsCrudDto) {
        return 'This action adds a new productsCrud';
    }
    findAll() {
        return `This action returns all productsCrud`;
    }
    findOne(id) {
        return `This action returns a #${id} productsCrud`;
    }
    update(id, updateProductsCrudDto) {
        return `This action updates a #${id} productsCrud`;
    }
    remove(id) {
        return `This action removes a #${id} productsCrud`;
    }
};
exports.ProductsCrudService = ProductsCrudService;
exports.ProductsCrudService = ProductsCrudService = __decorate([
    (0, common_1.Injectable)()
], ProductsCrudService);
//# sourceMappingURL=products--crud.service.js.map