/**
 * SmsProvider interface — abstraction for sending SMS/OTP messages.
 * Implement this interface for different SMS providers.
 */
export interface SmsProvider {
  sendOTP(phone: string, code: string): Promise<boolean>;
}

/**
 * Console-logging dev implementation — logs OTP to console instead of sending SMS.
 */
export class ConsoleSmsProvider implements SmsProvider {
  async sendOTP(phone: string, code: string): Promise<boolean> {
    console.log(`\n📱 [DEV SMS] OTP for ${phone}: ${code}\n`);
    return true;
  }
}

// Singleton instance — swap this for a real provider in production
export const smsProvider: SmsProvider = new ConsoleSmsProvider();
