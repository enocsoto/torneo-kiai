import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

export type ContactLinksDto = {
  whatsapp: string | null;
  telegram: string | null;
};

/**
 * Expone enlaces de contacto desde variables del servidor (sin NEXT_PUBLIC).
 * El frontend puede consumir esto para un único origen de verdad en Railway, etc.
 */
@ApiTags('public')
@Controller('public')
export class ContactPublicController {
  constructor(private readonly config: ConfigService) {}

  @Get('contact-links')
  @ApiOperation({
    summary:
      'Enlaces WhatsApp / Telegram (desde CONTACT_WHATSAPP, CONTACT_TELEGRAM en el servidor)',
  })
  contactLinks(): ContactLinksDto {
    const waRaw =
      this.config.get<string>('CONTACT_WHATSAPP') ??
      this.config.get<string>('NEXT_PUBLIC_CONTACT_WHATSAPP') ??
      '';
    const tgRaw =
      this.config.get<string>('CONTACT_TELEGRAM') ??
      this.config.get<string>('NEXT_PUBLIC_CONTACT_TELEGRAM') ??
      '';

    const waDigits = waRaw.replace(/\D/g, '');
    let whatsapp: string | null = null;
    if (waDigits.length > 0) {
      const text =
        this.config.get<string>('CONTACT_WHATSAPP_TEXT') ??
        this.config.get<string>('NEXT_PUBLIC_CONTACT_WHATSAPP_TEXT') ??
        '';
      const base = `https://wa.me/${waDigits}`;
      const preset = text.trim();
      whatsapp = preset ? `${base}?text=${encodeURIComponent(preset)}` : base;
    }

    const tgClean = tgRaw.trim().replace(/^@/, '');
    let telegram: string | null = null;
    if (tgClean) {
      const tgDigits = tgClean.replace(/\D/g, '');
      const looksLikePhone =
        tgDigits.length >= 8 && /^[-\d\s+()]+$/.test(tgClean);
      telegram = looksLikePhone
        ? `https://t.me/+${tgDigits}`
        : `https://t.me/${encodeURIComponent(tgClean)}`;
    }

    return { whatsapp, telegram };
  }
}
