// src/payments/razorpay.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;
  private razorpayKeySecret: string;

  // Inject ConfigService in the constructor
  constructor(private readonly configService: ConfigService) {
    // Get the keys securely using ConfigService
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    // Store the secret for the verifySignature method
     
    
    // Check if keys exist before initializing (for better error handling)
    if (!keyId || !keySecret) {
      throw new Error('Razorpay keys (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) must be set in the environment.');
    }
    this.razorpayKeySecret = keySecret;

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  createOrder(amount: number) {
    const options = {
      amount: amount * 100, // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };
    return this.razorpay.orders.create(options);
  }

  verifySignature(
    order_id: string,
    payment_id: string,
    signature: string,
  ): boolean {
    const generatedSignature = crypto
      .createHmac('sha256', this.razorpayKeySecret)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    return generatedSignature === signature;
  }

  fetchOrder(orderId: string) {
    return this.razorpay.orders.fetch(orderId);
  }
}
