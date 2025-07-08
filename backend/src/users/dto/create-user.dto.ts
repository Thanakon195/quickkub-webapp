import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  lastName: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    default: UserRole.MERCHANT,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole;

  @ApiProperty({
    description: 'Additional user metadata',
    required: false,
    example: {
      company: 'Acme Corp',
      position: 'Manager',
      department: 'Sales',
    },
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'User preferences',
    required: false,
    example: {
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
    },
  })
  @IsOptional()
  preferences?: Record<string, any>;
}
