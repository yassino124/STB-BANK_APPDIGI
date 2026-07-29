import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from './session.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async getMySessions(employeeId: string): Promise<SessionDocument[]> {
    return this.sessionModel
      .find({
        employeeId: new Types.ObjectId(employeeId),
        isRevoked: false,
        refreshTokenExpiresAt: { $gt: new Date() },
      })
      .populate('deviceId', 'deviceName platform model')
      .sort({ createdAt: -1 })
      .select('-accessToken -refreshToken')
      .exec();
  }

  async revokeSession(employeeId: string, sessionId: string): Promise<{ message: string }> {
    await this.sessionModel.updateOne(
      { _id: sessionId, employeeId: new Types.ObjectId(employeeId) },
      { isRevoked: true, revokedAt: new Date() },
    );
    return { message: 'Session déconnectée avec succès.' };
  }

  async revokeAllSessions(employeeId: string, exceptToken?: string): Promise<{ message: string; count: number }> {
    const query: any = {
      employeeId: new Types.ObjectId(employeeId),
      isRevoked: false,
    };
    if (exceptToken) {
      query.accessToken = { $ne: exceptToken };
    }

    const result = await this.sessionModel.updateMany(query, {
      isRevoked: true,
      revokedAt: new Date(),
    });

    return {
      message: 'Toutes les sessions ont été déconnectées.',
      count: result.modifiedCount,
    };
  }
}
