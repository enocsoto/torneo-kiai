import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PatchBonusBodyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  guestId: string;

  @IsArray()
  @IsString({ each: true })
  claves: string[];
}
