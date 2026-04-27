import {
  IsAlphanumeric,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterPlayerDto {
  @IsString()
  @Length(4, 8, {
    message: 'El alias debe tener entre 4 y 8 caracteres.',
  })
  @IsAlphanumeric(undefined, {
    message: 'El alias solo puede contener letras y números.',
  })
  alias: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'El PIN debe ser exactamente 4 dígitos.' })
  pin?: string;
}
