import { IsOptional, IsString, Matches } from 'class-validator';

export class LoginPlayerDto {
  @IsString()
  alias: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'El PIN debe ser exactamente 4 dígitos.' })
  pin?: string;
}
