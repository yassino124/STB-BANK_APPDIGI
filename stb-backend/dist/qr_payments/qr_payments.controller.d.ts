import { QrPaymentsService } from './qr-payments.service';
import { QrPayment } from './schemas/qr-payment.schema';
export declare class QrPaymentsController {
    private readonly qrPaymentsService;
    constructor(qrPaymentsService: QrPaymentsService);
    create(data: Partial<QrPayment>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/qr-payment.schema").QrPaymentDocument, {}, import("mongoose").DefaultSchemaOptions> & QrPayment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/qr-payment.schema").QrPaymentDocument, {}, import("mongoose").DefaultSchemaOptions> & QrPayment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/qr-payment.schema").QrPaymentDocument, {}, import("mongoose").DefaultSchemaOptions> & QrPayment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateStatus(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/qr-payment.schema").QrPaymentDocument, {}, import("mongoose").DefaultSchemaOptions> & QrPayment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
