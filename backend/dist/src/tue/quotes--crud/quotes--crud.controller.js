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
exports.QuotesCrudController = void 0;
const common_1 = require("@nestjs/common");
const quotes__crud_service_1 = require("./quotes--crud.service");
const create_quotes__crud_dto_1 = require("./dto/create-quotes--crud.dto");
const update_quotes__crud_dto_1 = require("./dto/update-quotes--crud.dto");
let QuotesCrudController = class QuotesCrudController {
    quotesCrudService;
    constructor(quotesCrudService) {
        this.quotesCrudService = quotesCrudService;
    }
    create(createQuotesCrudDto) {
        return this.quotesCrudService.create(createQuotesCrudDto);
    }
    findAll() {
        return this.quotesCrudService.findAll();
    }
    findOne(id) {
        return this.quotesCrudService.findOne(+id);
    }
    update(id, updateQuotesCrudDto) {
        return this.quotesCrudService.update(+id, updateQuotesCrudDto);
    }
    remove(id) {
        return this.quotesCrudService.remove(+id);
    }
};
exports.QuotesCrudController = QuotesCrudController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_quotes__crud_dto_1.CreateQuotesCrudDto]),
    __metadata("design:returntype", void 0)
], QuotesCrudController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QuotesCrudController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotesCrudController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_quotes__crud_dto_1.UpdateQuotesCrudDto]),
    __metadata("design:returntype", void 0)
], QuotesCrudController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotesCrudController.prototype, "remove", null);
exports.QuotesCrudController = QuotesCrudController = __decorate([
    (0, common_1.Controller)('quotes--crud'),
    __metadata("design:paramtypes", [quotes__crud_service_1.QuotesCrudService])
], QuotesCrudController);
//# sourceMappingURL=quotes--crud.controller.js.map