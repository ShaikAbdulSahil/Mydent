import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly razorpayService: RazorpayService,
    private readonly userService: UserService,
  ) { }

  async createOrder(amount: number) {
    this.logger.log(`Creating payment order for amount: ${amount}`);
    try {
      const order = await this.razorpayService.createOrder(amount);
      this.logger.log(`Payment order created successfully: ${order.id}`);
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to create payment order: ${err.message}`, err.stack);
      throw error;
    }
  }

  async verifyPayment(
    userId: string,
    order_id: string,
    payment_id: string,
    signature: string,
  ) {
    this.logger.log(`Verifying payment - orderId: ${order_id}, paymentId: ${payment_id}, userId: ${userId}`);
    const isValid = this.razorpayService.verifySignature(
      order_id,
      payment_id,
      signature,
    );
    if (!isValid) {
      this.logger.warn(`Payment verification failed - invalid signature for order: ${order_id}`);
      throw new Error('Invalid signature');
    }

    const order = await this.razorpayService.fetchOrder(order_id);
    if (!order || order.status !== 'paid') {
      this.logger.warn(`Payment verification failed - order not found or not paid: ${order_id}`);
      throw new Error('Order not found or not paid');
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      this.logger.warn(`Payment verification failed - user not found: ${userId}`);
      throw new NotFoundException('User not found');
    }

    const amountInINR = Number(order.amount) / 100;
    user.balance = (user.balance || 0) + amountInINR;
    await user.save();

    this.logger.log(`Payment verified successfully - userId: ${userId}, amount: ${amountInINR}, newBalance: ${user.balance}`);
    return {
      success: true,
      message: '✅ Payment successful!',
      balance: user.balance,
    };
  }
}
