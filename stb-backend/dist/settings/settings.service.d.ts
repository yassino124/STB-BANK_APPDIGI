import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';
export declare class SettingsService {
    private settingModel;
    constructor(settingModel: Model<SettingDocument>);
    create(data: Partial<Setting>): Promise<import("mongoose").Document<unknown, {}, SettingDocument, {}, import("mongoose").DefaultSchemaOptions> & Setting & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByKey(key: string): Promise<import("mongoose").Document<unknown, {}, SettingDocument, {}, import("mongoose").DefaultSchemaOptions> & Setting & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByCategory(category: string): Promise<(import("mongoose").Document<unknown, {}, SettingDocument, {}, import("mongoose").DefaultSchemaOptions> & Setting & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, SettingDocument, {}, import("mongoose").DefaultSchemaOptions> & Setting & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    update(key: string, value: any): Promise<import("mongoose").Document<unknown, {}, SettingDocument, {}, import("mongoose").DefaultSchemaOptions> & Setting & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    setMany(settings: Record<string, any>): Promise<import("mongodb").BulkWriteResult>;
}
