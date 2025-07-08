import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../entities/user.entity';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @ApiProperty({
    description: 'User password (optional for updates)',
    example: 'NewSecurePass123!',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'User account status',
    enum: UserStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Invalid user status' })
  status?: UserStatus;

  @ApiProperty({
    description: 'Whether email is verified',
    required: false,
  })
  @IsOptional()
  emailVerified?: boolean;

  @ApiProperty({
    description: 'Whether phone is verified',
    required: false,
  })
  @IsOptional()
  phoneVerified?: boolean;

  @ApiProperty({
    description: 'Whether two-factor authentication is enabled',
    required: false,
  })
  @IsOptional()
  twoFactorEnabled?: boolean;

  @ApiProperty({
    description: 'Last login timestamp',
    required: false,
  })
  @IsOptional()
  lastLoginAt?: Date;
}
