import { Model, Types, Connection } from 'mongoose';
import { Transaction, TransactionType, TransactionStatus, TransactionCategory } from './schemas/transaction.schema';
import { Account } from '../accounts/schemas/account.schema';
import { Card } from '../cards/schemas/card.schema';
import { Employee } from '../employees/employee.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class TransactionsService {
    private transactionModel;
    private accountModel;
    private cardModel;
    private employeeModel;
    private connection;
    private eventEmitter;
    constructor(transactionModel: Model<Transaction>, accountModel: Model<Account>, cardModel: Model<Card>, employeeModel: Model<Employee>, connection: Connection, eventEmitter: EventEmitter2);
    getMyTransactions(employeeId: string, page?: number, limit?: number): Promise<{
        data: {
            sens: string;
            employeeId: Types.ObjectId;
            montant: number;
            type: TransactionType;
            description: string;
            status: TransactionStatus;
            date: Date;
            from: Types.ObjectId | null;
            to: Types.ObjectId | null;
            accountId: Types.ObjectId;
            toAccountId: Types.ObjectId | null;
            cardId: Types.ObjectId | null;
            reference: string;
            fee: number;
            exchangeRate: number;
            originalAmount: number;
            originalCurrency: string;
            category: TransactionCategory;
            subcategory: string;
            location: string;
            merchantName: string;
            merchantCategoryCode: string;
            isRecurring: boolean;
            recurringId: string;
            tags: string[];
            fraudScore: number;
            riskLevel: "LOW" | "MEDIUM" | "HIGH";
            metadata: Record<string, any>;
            _id: Types.ObjectId;
            __v: number;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    getEmployeeTransactions(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createTransfer(fromEmployeeId: string, toMatricule: string, montant: number, description: string, metadata?: any): Promise<import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    createTransferById(fromEmployeeId: string, toEmployeeId: string, amount: number, description: string, metadata?: any): Promise<import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    createTransaction(data: Partial<Transaction>): Promise<import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    findByReference(reference: string): Promise<(import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    getTransactionStats(employeeId: string, startDate?: Date, endDate?: Date): Promise<any[]>;
    getMonthlySummary(employeeId: string, year: number, month: number): Promise<{
        totalIncome: number;
        totalExpenses: number;
        totalTransfers: number;
        transactionCount: number;
        byCategory: Record<string, number>;
    }>;
    detectFraud(transactionId: string): Promise<{
        riskScore: number;
        factors: string[];
        level: string;
    }>;
    getMonthlyAnalytics(employeeId: string): Promise<Record<string, {
        income: number;
        expenses: number;
        byCategory: Record<string, number>;
    }>>;
    getSummary(employeeId: string): Promise<{
        totalIncome: number;
        totalExpenses: number;
        netBalance: number;
        transactionCount: number;
        topCategories: Record<string, number>;
    }>;
}
