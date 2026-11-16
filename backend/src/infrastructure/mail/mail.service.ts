import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { ConfigurationService } from '../config/configuration.service.js';

const purposes: Record<string, string> = {
  'sign-in': '登录',
  'email-verification': '验证邮箱',
  'forget-password': '重置密码',
  'change-email': '更换邮箱',
};

export class MailUnavailableError extends Error {}

@Injectable()
export class MailService implements OnApplicationShutdown {
  private transporter?: Transporter;

  constructor(private readonly configuration: ConfigurationService) {}

  async sendVerificationOtp(
    email: string,
    otp: string,
    purpose: string,
  ): Promise<void> {
    const smtp = this.configuration.smtp;
    if (!smtp.host) {
      throw new MailUnavailableError('邮件服务尚未配置');
    }
    this.transporter ??= createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      ...(smtp.user ? { auth: { user: smtp.user, pass: smtp.password } } : {}),
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    await this.transporter.sendMail({
      from: smtp.from,
      to: email,
      subject: `${purposes[purpose] ?? '身份验证'}验证码`,
      text: `你的验证码是 ${otp}，5 分钟内有效。如非本人操作，请忽略此邮件。`,
    });
  }

  onApplicationShutdown(): void {
    this.transporter?.close();
  }
}
