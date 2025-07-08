import { Injectable } from '@nestjs/common';

@Injectable()
export class FraudService {
  async detectFraud(transactionData: any): Promise<boolean> {
    // Basic fraud detection logic
    const riskScore = this.calculateRiskScore(transactionData);
    return riskScore > 0.7;
  }

  private calculateRiskScore(transactionData: any): number {
    // Simple risk calculation
    let score = 0;

    if (transactionData.amount > 10000) score += 0.3;
    if (transactionData.frequency > 10) score += 0.2;
    if (transactionData.location !== transactionData.userLocation) score += 0.3;

    return Math.min(score, 1.0);
  }

  async blockTransaction(transactionId: string): Promise<void> {
    console.log(`Blocking transaction ${transactionId}`);
  }

  async allowTransaction(transactionId: string): Promise<void> {
    console.log(`Allowing transaction ${transactionId}`);
  }
}
