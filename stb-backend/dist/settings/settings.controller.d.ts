import { SettingsService } from './settings.service';
import { Setting } from './schemas/setting.schema';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    create(data: Partial<Setting>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/setting.schema").SettingDocument, {}, import("mongoose").DefaultSchemaOptions> & Setting & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/setting.schema").SettingDocument, {}, import("mongoose").DefaultSchemaOptions> & Setting & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByCategory(category: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/setting.schema").SettingDocument, {}, import("mongoose").DefaultSchemaOptions> & Setting & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByKey(key: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/setting.schema").SettingDocument, {}, import("mongoose").DefaultSchemaOptions> & Setting & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(key: string, value: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/setting.schema").SettingDocument, {}, import("mongoose").DefaultSchemaOptions> & Setting & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
