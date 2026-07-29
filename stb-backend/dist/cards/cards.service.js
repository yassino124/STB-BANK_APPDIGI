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
exports.CardsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const card_schema_1 = require("./schemas/card.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const crypto_1 = require("crypto");
const banking_constants_1 = require("../common/constants/banking.constants");
const event_emitter_1 = require("@nestjs/event-emitter");
const events_constants_1 = require("../common/constants/events.constants");
let CardsService = class CardsService {
    cardModel;
    accountModel;
    eventEmitter;
    constructor(cardModel, accountModel, eventEmitter) {
        this.cardModel = cardModel;
        this.accountModel = accountModel;
        this.eventEmitter = eventEmitter;
    }
    async createForEmployee(employeeId, accountId, type = card_schema_1.CardType.VISA) {
        const account = await this.accountModel.findById(accountId).exec();
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        if (account.status === account_schema_1.AccountStatus.FROZEN) {
            throw new common_1.BadRequestException('Cannot create card on frozen account');
        }
        const cardNumber = this.generateCardNumber(type);
        const cvv = String((0, crypto_1.randomInt)(100, 999));
        const pin = String((0, crypto_1.randomInt)(1000, 9999));
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 4);
        const expiryDate = `${String(expiry.getMonth() + 1).padStart(2, '0')}/${String(expiry.getFullYear()).slice(-2)}`;
        const card = await this.cardModel.create({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            accountId: new mongoose_2.Types.ObjectId(accountId),
            cardNumber,
            maskedNumber: this.maskCardNumber(cardNumber),
            expiryDate,
            cvvHash: (0, crypto_1.createHash)('sha256').update(cvv).digest('hex'),
            pinHash: (0, crypto_1.createHash)('sha256').update(pin).digest('hex'),
            type,
            status: card_schema_1.CardStatus.ACTIVE,
            limitQuotidien: banking_constants_1.BANKING_CONSTANTS.CARD_DAILY_LIMIT,
            limitMensuel: banking_constants_1.BANKING_CONSTANTS.CARD_MONTHLY_LIMIT,
            contactlessEnabled: true,
            onlinePaymentsEnabled: true,
            internationalEnabled: type !== card_schema_1.CardType.VIRTUAL,
            activatedAt: new Date(),
            spendingLimits: {
                daily: banking_constants_1.BANKING_CONSTANTS.CARD_DAILY_LIMIT,
                weekly: banking_constants_1.BANKING_CONSTANTS.CARD_DAILY_LIMIT * 7,
                monthly: banking_constants_1.BANKING_CONSTANTS.CARD_MONTHLY_LIMIT,
                atmDaily: banking_constants_1.BANKING_CONSTANTS.CARD_DAILY_LIMIT,
            },
        });
        this.eventEmitter.emit(events_constants_1.ACCOUNT_EVENTS.CARD_CREATED, { cardId: card._id, employeeId, accountId });
        return card;
    }
    async createForEmployeeWithoutAccountId(employeeId, type = card_schema_1.CardType.VISA) {
        const account = await this.accountModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(employeeId), isPrimary: true }).exec()
            || await this.accountModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).exec();
        if (!account)
            throw new common_1.NotFoundException('Employee has no bank account. Create one first.');
        return this.createForEmployee(employeeId, account._id.toString(), type);
    }
    async getMyCards(employeeId) {
        return this.cardModel.find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }, { cvvHash: 0, pinHash: 0 }).exec();
    }
    async findOne(id) {
        const card = await this.cardModel.findById(id).exec();
        if (!card)
            throw new common_1.NotFoundException('Card not found');
        return card;
    }
    async freeze(id, reason, blockReason) {
        const card = await this.findOne(id);
        if (card.status === card_schema_1.CardStatus.BLOCKED) {
            throw new common_1.BadRequestException('Card is already blocked');
        }
        return this.cardModel.findByIdAndUpdate(id, {
            isFrozen: true,
            status: card_schema_1.CardStatus.FROZEN,
            frozenAt: new Date(),
            freezeReason: reason,
            blockReason: blockReason || card_schema_1.CardBlockReason.CUSTOMER_REQUEST,
        }, { new: true }).exec();
    }
    async unfreeze(id) {
        const card = await this.findOne(id);
        if (card.status !== card_schema_1.CardStatus.FROZEN) {
            throw new common_1.BadRequestException('Card is not frozen');
        }
        return this.cardModel.findByIdAndUpdate(id, { isFrozen: false, status: card_schema_1.CardStatus.ACTIVE, frozenAt: null, freezeReason: null }, { new: true }).exec();
    }
    async block(id, reason) {
        const card = await this.findOne(id);
        return this.cardModel.findByIdAndUpdate(id, { status: card_schema_1.CardStatus.BLOCKED, blockReason: reason, cancelledAt: new Date() }, { new: true }).exec();
    }
    async updateLimits(id, limits) {
        const card = await this.findOne(id);
        const updatedLimits = { ...card.spendingLimits, ...limits };
        return this.cardModel.findByIdAndUpdate(id, { spendingLimits: updatedLimits }, { new: true }).exec();
    }
    async toggleContactless(id, enabled) {
        return this.cardModel.findByIdAndUpdate(id, { contactlessEnabled: enabled }, { new: true }).exec();
    }
    async toggleOnlinePayments(id, enabled) {
        return this.cardModel.findByIdAndUpdate(id, { onlinePaymentsEnabled: enabled }, { new: true }).exec();
    }
    async toggleInternational(id, enabled) {
        return this.cardModel.findByIdAndUpdate(id, { internationalEnabled: enabled }, { new: true }).exec();
    }
    async cancel(id) {
        const card = await this.findOne(id);
        return this.cardModel.findByIdAndUpdate(id, { status: card_schema_1.CardStatus.CANCELLED, cancelledAt: new Date() }, { new: true }).exec();
    }
    async getCardStats(employeeId) {
        const [total, active, frozen, blocked] = await Promise.all([
            this.cardModel.countDocuments({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }),
            this.cardModel.countDocuments({ employeeId: new mongoose_2.Types.ObjectId(employeeId), status: card_schema_1.CardStatus.ACTIVE }),
            this.cardModel.countDocuments({ employeeId: new mongoose_2.Types.ObjectId(employeeId), status: card_schema_1.CardStatus.FROZEN }),
            this.cardModel.countDocuments({ employeeId: new mongoose_2.Types.ObjectId(employeeId), status: card_schema_1.CardStatus.BLOCKED }),
        ]);
        return { total, active, frozen, blocked };
    }
    generateCardNumber(type) {
        const prefix = type === card_schema_1.CardType.MASTERCARD ? '5' : '4';
        const digits = Array.from({ length: 15 }, () => (0, crypto_1.randomInt)(0, 9)).join('');
        return prefix + digits;
    }
    maskCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        return `**** **** **** ${cleaned.slice(-4)}`;
    }
};
exports.CardsService = CardsService;
exports.CardsService = CardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(card_schema_1.Card.name)),
    __param(1, (0, mongoose_1.InjectModel)(account_schema_1.Account.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        event_emitter_1.EventEmitter2])
], CardsService);
//# sourceMappingURL=cards.service.js.map