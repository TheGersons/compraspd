"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotesCrudService = void 0;
const common_1 = require("@nestjs/common");
let QuotesCrudService = class QuotesCrudService {
    create(createQuotesCrudDto) {
        return 'This action adds a new quotesCrud';
    }
    findAll() {
        return `This action returns all quotesCrud`;
    }
    findOne(id) {
        return `This action returns a #${id} quotesCrud`;
    }
    update(id, updateQuotesCrudDto) {
        return `This action updates a #${id} quotesCrud`;
    }
    remove(id) {
        return `This action removes a #${id} quotesCrud`;
    }
};
exports.QuotesCrudService = QuotesCrudService;
exports.QuotesCrudService = QuotesCrudService = __decorate([
    (0, common_1.Injectable)()
], QuotesCrudService);
//# sourceMappingURL=quotes--crud.service.js.map