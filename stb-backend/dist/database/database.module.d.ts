import { OnModuleInit } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { SeedService } from './seed.service';
export declare class DatabaseModule implements OnModuleInit {
    private settingsService;
    private seedService;
    constructor(settingsService: SettingsService, seedService: SeedService);
    onModuleInit(): Promise<void>;
    private seedDefaultSettings;
    private seedDefaultData;
}
