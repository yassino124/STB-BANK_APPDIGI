import { Model, Types } from 'mongoose';
import { Card, CardType, CardBlockReason } from './schemas/card.schema';
import { Account } from '../accounts/schemas/account.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class CardsService {
    private cardModel;
    private accountModel;
    private eventEmitter;
    constructor(cardModel: Model<Card>, accountModel: Model<Account>, eventEmitter: EventEmitter2);
    createForEmployee(employeeId: string, accountId: string, type?: CardType): Promise<Card>;
    createForEmployeeWithoutAccountId(employeeId: string, type?: CardType): Promise<Card>;
    getMyCards(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, Card, {}, import("mongoose").DefaultSchemaOptions> & Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAllCards(): Promise<(import("mongoose").Document<unknown, {}, Card, {}, import("mongoose").DefaultSchemaOptions> & Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Card, {}, import("mongoose").DefaultSchemaOptions> & Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    freeze(id: string, reason?: string, blockReason?: CardBlockReason): Promise<(import("mongoose").Document<unknown, {}, Card, {}, import("mongoose").DefaultSchemaOptions> & Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    unfreeze(id: string): Promise<(import("mongoose").Document<unknown, {}, Card, {}, import("mongoose").DefaultSchemaOptions> & Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    block(id: string, reason: CardBlockReason): Promise<(import("mongoose").Document<unknown, {}, Card, {}, import("mongoose").DefaultSchemaOptions> & Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    updateLimits(id: string, limits: {
        daily?: number;
        weekly?: number;
        monthly?: number;
        atmDaily?: number;
    }): Promise<(import("mongoose").Document<unknown, {}, Card, {}, import("mongoose").DefaultSchemaOptions> & Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    toggleContactless(id: string, enabled: boolean): Promise<(import("mongoose").Document<unknown, {}, Card, {}, import("mongoose").DefaultSchemaOptions> & Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    toggleOnlinePayments(id: string, enabled: boolean): Promise<(import("mongoose").Document<unknown, {}, Card, {}, import("mongoose").DefaultSchemaOptions> & Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    toggleInternational(id: string, enabled: boolean): Promise<(import("mongoose").Document<unknown, {}, Card, {}, import("mongoose").DefaultSchemaOptions> & Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    cancel(id: string): Promise<(import("mongoose").Document<unknown, {}, Card, {}, import("mongoose").DefaultSchemaOptions> & Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    getCardStats(employeeId: string): Promise<{
        total: number;
        active: number;
        frozen: number;
        blocked: number;
    }>;
    private generateCardNumber;
    private maskCardNumber;
}
