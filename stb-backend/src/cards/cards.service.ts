import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Card, CardStatus, CardType, CardBlockReason } from './schemas/card.schema';
import { Account, AccountStatus } from '../accounts/schemas/account.schema';
import { createHash, randomInt } from 'crypto';
import { NumberUtil } from '../common/utils/number.util';
import { BANKING_CONSTANTS } from '../common/constants/banking.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ACCOUNT_EVENTS } from '../common/constants/events.constants';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<Card>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createForEmployee(employeeId: string, accountId: string, type: CardType = CardType.VISA): Promise<Card> {
    const account = await this.accountModel.findById(accountId).exec();
    if (!account) throw new NotFoundException('Account not found');
    if (account.status === AccountStatus.FROZEN) {
      throw new BadRequestException('Cannot create card on frozen account');
    }

    const cardNumber = this.generateCardNumber(type);
    const cvv = String(randomInt(100, 999));
    const pin = String(randomInt(1000, 9999));
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 4);
    const expiryDate = `${String(expiry.getMonth() + 1).padStart(2, '0')}/${String(expiry.getFullYear()).slice(-2)}`;

    const card = await this.cardModel.create({
      employeeId: new Types.ObjectId(employeeId),
      accountId: new Types.ObjectId(accountId),
      cardNumber,
      maskedNumber: this.maskCardNumber(cardNumber),
      expiryDate,
      cvvHash: createHash('sha256').update(cvv).digest('hex'),
      pinHash: createHash('sha256').update(pin).digest('hex'),
      type,
      status: CardStatus.ACTIVE,
      limitQuotidien: BANKING_CONSTANTS.CARD_DAILY_LIMIT,
      limitMensuel: BANKING_CONSTANTS.CARD_MONTHLY_LIMIT,
      contactlessEnabled: true,
      onlinePaymentsEnabled: true,
      internationalEnabled: type !== CardType.VIRTUAL,
      activatedAt: new Date(),
      spendingLimits: {
        daily: BANKING_CONSTANTS.CARD_DAILY_LIMIT,
        weekly: BANKING_CONSTANTS.CARD_DAILY_LIMIT * 7,
        monthly: BANKING_CONSTANTS.CARD_MONTHLY_LIMIT,
        atmDaily: BANKING_CONSTANTS.CARD_DAILY_LIMIT,
      },
    });

    this.eventEmitter.emit(ACCOUNT_EVENTS.CARD_CREATED, { cardId: card._id, employeeId, accountId });
    return card;
  }

  async createForEmployeeWithoutAccountId(employeeId: string, type: CardType = CardType.VISA): Promise<Card> {
    // Find primary account for this employee
    const account = await this.accountModel.findOne({ employeeId: new Types.ObjectId(employeeId), isPrimary: true }).exec()
      || await this.accountModel.findOne({ employeeId: new Types.ObjectId(employeeId) }).exec();
    if (!account) throw new NotFoundException('Employee has no bank account. Create one first.');
    return this.createForEmployee(employeeId, account._id.toString(), type);
  }

  async getMyCards(employeeId: string) {
    return this.cardModel.find({ employeeId: new Types.ObjectId(employeeId) }, { cvvHash: 0, pinHash: 0 }).exec();
  }

  async findOne(id: string) {
    const card = await this.cardModel.findById(id).exec();
    if (!card) throw new NotFoundException('Card not found');
    return card;
  }

  async freeze(id: string, reason?: string, blockReason?: CardBlockReason) {
    const card = await this.findOne(id);
    if (card.status === CardStatus.BLOCKED) {
      throw new BadRequestException('Card is already blocked');
    }

    return this.cardModel.findByIdAndUpdate(
      id,
      {
        isFrozen: true,
        status: CardStatus.FROZEN,
        frozenAt: new Date(),
        freezeReason: reason,
        blockReason: blockReason || CardBlockReason.CUSTOMER_REQUEST,
      },
      { new: true },
    ).exec();
  }

  async unfreeze(id: string) {
    const card = await this.findOne(id);
    if (card.status !== CardStatus.FROZEN) {
      throw new BadRequestException('Card is not frozen');
    }

    return this.cardModel.findByIdAndUpdate(
      id,
      { isFrozen: false, status: CardStatus.ACTIVE, frozenAt: null, freezeReason: null },
      { new: true },
    ).exec();
  }

  async block(id: string, reason: CardBlockReason) {
    const card = await this.findOne(id);
    return this.cardModel.findByIdAndUpdate(
      id,
      { status: CardStatus.BLOCKED, blockReason: reason, cancelledAt: new Date() },
      { new: true },
    ).exec();
  }

  async updateLimits(id: string, limits: { daily?: number; weekly?: number; monthly?: number; atmDaily?: number }) {
    const card = await this.findOne(id);
    const updatedLimits = { ...card.spendingLimits, ...limits };
    return this.cardModel.findByIdAndUpdate(id, { spendingLimits: updatedLimits }, { new: true }).exec();
  }

  async toggleContactless(id: string, enabled: boolean) {
    return this.cardModel.findByIdAndUpdate(id, { contactlessEnabled: enabled }, { new: true }).exec();
  }

  async toggleOnlinePayments(id: string, enabled: boolean) {
    return this.cardModel.findByIdAndUpdate(id, { onlinePaymentsEnabled: enabled }, { new: true }).exec();
  }

  async toggleInternational(id: string, enabled: boolean) {
    return this.cardModel.findByIdAndUpdate(id, { internationalEnabled: enabled }, { new: true }).exec();
  }

  async cancel(id: string) {
    const card = await this.findOne(id);
    return this.cardModel.findByIdAndUpdate(id, { status: CardStatus.CANCELLED, cancelledAt: new Date() }, { new: true }).exec();
  }

  async getCardStats(employeeId: string) {
    const [total, active, frozen, blocked] = await Promise.all([
      this.cardModel.countDocuments({ employeeId: new Types.ObjectId(employeeId) }),
      this.cardModel.countDocuments({ employeeId: new Types.ObjectId(employeeId), status: CardStatus.ACTIVE }),
      this.cardModel.countDocuments({ employeeId: new Types.ObjectId(employeeId), status: CardStatus.FROZEN }),
      this.cardModel.countDocuments({ employeeId: new Types.ObjectId(employeeId), status: CardStatus.BLOCKED }),
    ]);

    return { total, active, frozen, blocked };
  }

  private generateCardNumber(type: CardType): string {
    const prefix = type === CardType.MASTERCARD ? '5' : '4';
    const digits = Array.from({ length: 15 }, () => randomInt(0, 9)).join('');
    return prefix + digits;
  }

  private maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    return `**** **** **** ${cleaned.slice(-4)}`;
  }
}
