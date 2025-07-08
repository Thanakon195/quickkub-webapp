import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { AuditService } from '../admin/services/audit.service';
import { EmailService } from '../notifications/services/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole, UserStatus } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Create user
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || UserRole.MERCHANT,
      status: UserStatus.PENDING,
      emailVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
    });

    const savedUser = await this.usersRepository.save(user);

    // Send verification email
    await this.sendVerificationEmail(savedUser);

    // Audit log
    await this.auditService.log({
      action: 'user.created',
      entityType: 'User',
      entityId: savedUser.id,
      newValues: { email: savedUser.email, role: savedUser.role },
    });

    return savedUser;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, status } = options;
    const skip = (page - 1) * limit;

    const whereConditions: FindOptionsWhere<User> = {};

    if (search) {
      whereConditions.email = Like(`%${search}%`);
    }

    if (status) {
      whereConditions.status = status as UserStatus;
    }

    const [users, total] = await this.usersRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      users,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email is already taken');
      }
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    // Audit log
    await this.auditService.log({
      action: 'user.updated',
      entityType: 'User',
      entityId: user.id,
      oldValues: { email: user.email, role: user.role },
      newValues: { email: updatedUser.email, role: updatedUser.role },
    });

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);

    // Audit log
    await this.auditService.log({
      action: 'user.deleted',
      entityType: 'User',
      entityId: user.id,
      oldValues: { email: user.email, role: user.role },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async verifyEmail(id: string, token: string): Promise<User> {
    const user = await this.findOne(id);

    // In a real implementation, you would verify the token
    // For now, we'll just mark the email as verified
    if (token === 'valid-token') {
      user.emailVerified = true;
      user.status = UserStatus.ACTIVE;
      return this.usersRepository.save(user);
    }

    throw new BadRequestException('Invalid verification token');
  }

  async resendVerification(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.sendVerificationEmail(user);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findOne(id);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.usersRepository.update(id, { password: hashedPassword });

    // Audit log
    await this.auditService.log({
      action: 'user.password_changed',
      entityType: 'User',
      entityId: user.id,
    });
  }

  async enable2FA(id: string): Promise<{ secret: string; qrCode: string }> {
    const user = await this.findOne(id);

    // Generate 2FA secret (in a real implementation, use a proper 2FA library)
    const secret = 'JBSWY3DPEHPK3PXP'; // This should be generated dynamically
    const qrCode = `otpauth://totp/QuickKub:${user.email}?secret=${secret}&issuer=QuickKub`;

    // Update user
    user.twoFactorEnabled = true;
    await this.usersRepository.save(user);

    return { secret, qrCode };
  }

  async disable2FA(id: string, code: string): Promise<void> {
    const user = await this.findOne(id);

    // Verify 2FA code (in a real implementation, use a proper 2FA library)
    if (code === '123456') { // This should be verified dynamically
      user.twoFactorEnabled = false;
      await this.usersRepository.save(user);
    } else {
      throw new BadRequestException('Invalid 2FA code');
    }
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.findOne(id);
    user.status = status;
    return this.usersRepository.save(user);
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
  }> {
    const [total, active, pending, suspended] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.usersRepository.count({ where: { status: UserStatus.PENDING } }),
      this.usersRepository.count({ where: { status: UserStatus.SUSPENDED } }),
    ]);

    return { total, active, pending, suspended };
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    // In a real implementation, generate a proper verification token
    const token = 'valid-token'; // This should be generated and stored securely

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Verify your email address',
      template: 'email-verification',
      context: {
        name: user.firstName,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${token}&userId=${user.id}`,
      },
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({ where: { role } });
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.usersRepository.find({
      where: [
        { email: Like(`%${query}%`) },
        { firstName: Like(`%${query}%`) },
        { lastName: Like(`%${query}%`) },
      ],
      take: 10,
    });
  }
}
