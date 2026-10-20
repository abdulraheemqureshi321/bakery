import { IOrder } from '../../models/Order';
import { AppError } from '../../utils/AppError';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
}

export interface PaymentProvider {
  name: string;
  code: string;
  processPayment(order: IOrder): Promise<PaymentResult>;
}

export class PayInStoreProvider implements PaymentProvider {
  name = 'Pay in Store';
  code = 'pay_in_store';

  async processPayment(_order: IOrder): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `PIS-${Date.now()}`,
      message: 'Payment to be collected in store upon pickup',
    };
  }
}

export class CashOnDeliveryProvider implements PaymentProvider {
  name = 'Cash on Delivery';
  code = 'cash_on_delivery';

  async processPayment(_order: IOrder): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `COD-${Date.now()}`,
      message: 'Payment to be collected upon delivery',
    };
  }
}

// Registry
const providers: Record<string, PaymentProvider> = {
  pay_in_store: new PayInStoreProvider(),
  cash_on_delivery: new CashOnDeliveryProvider(),
};

export function getPaymentProvider(code: string): PaymentProvider {
  const provider = providers[code];
  if (!provider) {
    throw new AppError(`Unsupported payment method: ${code}`, 400);
  }
  return provider;
}

export function getAllPaymentProviders(): PaymentProvider[] {
  return Object.values(providers);
}
