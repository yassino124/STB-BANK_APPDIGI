import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { TRANSACTION_EVENTS } from '../common/constants/events.constants';
import { NotificationType } from './schemas/notification.schema';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @OnEvent(TRANSACTION_EVENTS.TRANSFER_COMPLETED)
  async handleTransferCompleted(payload: any) {
    console.log('📦 Transfer event payload:', JSON.stringify(payload));
    const { fromEmployeeId, toEmployeeId, montant, transactionId, reference } = payload;

    // Notification for sender (debit)
    const senderNotif = await this.notificationsService.sendToEmployee(
      fromEmployeeId.toString(),
      'Transfert effectué',
      `Vous avez envoyé ${montant} TND`,
      NotificationType.TRANSACTION,
      {
        transactionId: transactionId.toString(),
        amount: montant,
        direction: 'out',
      },
    );
    this.realtimeGateway.server?.to(`user:${fromEmployeeId}`).emit('notification', senderNotif);

    // Notification for receiver (credit)
    const receiverNotif = await this.notificationsService.sendToEmployee(
      toEmployeeId.toString(),
      'Transfert reçu',
      `Vous avez reçu ${montant} TND`,
      NotificationType.TRANSACTION,
      {
        transactionId: transactionId.toString(),
        amount: montant,
        direction: 'in',
      },
    );
    this.realtimeGateway.server?.to(`user:${toEmployeeId}`).emit('notification', receiverNotif);

    console.log(`✅ Created 2 notifications and sent realtime events for transfer ${transactionId}`);
  }

  @OnEvent(TRANSACTION_EVENTS.FRAUD_DETECTED)
  async handleFraudDetected(payload: any) {
    const { transactionId, employeeId, riskScore } = payload;

    const notif = await this.notificationsService.sendToEmployee(
      employeeId.toString(),
      '⚠️ Transaction suspecte',
      `Une activité inhabituelle a été détectée sur votre compte (Score: ${riskScore})`,
      NotificationType.SYSTEM,
      {
        transactionId: transactionId.toString(),
        riskScore,
      },
    );
    this.realtimeGateway.server?.to(`user:${employeeId}`).emit('notification', notif);

    console.log(`🚨 Created fraud alert notification for employee ${employeeId}`);
  }
}
