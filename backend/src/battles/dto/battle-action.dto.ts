import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { BattleActionType } from './battle-action-type';

export { BattleActionType } from './battle-action-type';

export class BattleActionDto {
  @IsEnum(BattleActionType)
  type: BattleActionType;

  @IsOptional()
  @IsInt()
  @Min(0)
  attackIndex?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  guestId?: string;
}
