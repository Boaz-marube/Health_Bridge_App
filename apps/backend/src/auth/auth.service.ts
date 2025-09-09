import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DoctorSignupDto } from './dtos/doctor-signup.dto';
import { PatientSignupDto } from './dtos/patient-signup.dto';
import { StaffSignupDto } from './dtos/staff-signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { ResetToken } from './schemas/reset-token.schema';
import { MailService } from '../services/mail.service';
import { RolesService } from '../roles/roles.service';
import { UserType } from './enums/user-type.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    private jwtService: JwtService,
    private mailService: MailService,
    private rolesService: RolesService,
  ) {}

  async doctorSignup(signupData: DoctorSignupDto) {
    const {
      email,
      password,
      name,
      specialization,
      licenseNumber,
      phoneNumber,
    } = signupData;

    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.UserModel.create({
      name,
      email,
      password: hashedPassword,
      userType: UserType.DOCTOR,
      specialization,
      licenseNumber,
      phoneNumber,
    });
  }

  async patientSignup(signupData: PatientSignupDto) {
    const { email, password, name, phoneNumber, dateOfBirth, address } =
      signupData;

    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.UserModel.create({
      name,
      email,
      password: hashedPassword,
      userType: UserType.PATIENT,
      phoneNumber,
      dateOfBirth: new Date(dateOfBirth),
      address,
    });
  }

  async staffSignup(signupData: StaffSignupDto) {
    const { email, password, name, phoneNumber, dateOfBirth, address, role, department } =
      signupData;

    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.UserModel.create({
      name,
      email,
      password: hashedPassword,
      userType: UserType.STAFF,
      phoneNumber,
      dateOfBirth: new Date(dateOfBirth),
      address,
      role,
      department,
    });
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;
    //Find if user exists by email
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Compare entered password with existing password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Generate JWT tokens
    const tokens = await this.generateUserTokens(user._id);
    return {
      ...tokens,
      userId: user._id,
      role: user.userType,
    };
  }

  async changePassword(userId, oldPassword: string, newPassword: string) {
    //Find the user
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    //Compare the old password with the password in DB
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Change user's password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
  }

  async forgotPassword(email: string) {
    //Check that user exists
    const user = await this.UserModel.findOne({ email });

    if (user) {
      //If user exists, generate 6-digit code
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 15); // 15 minutes expiry

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
      
      // Delete any existing reset tokens for this user
      await this.ResetTokenModel.deleteMany({ userId: user._id });
      
      await this.ResetTokenModel.create({
        token: resetCode,
        userId: user._id,
        expiryDate,
      });
      
      //Send the code to the user by email
      try {
        await this.mailService.sendPasswordResetCode(email, resetCode);
      } catch (error) {
        console.error('Email sending failed, but continuing with flow:', error);
        // Continue with the flow even if email fails
      }
    }

    return { message: 'If this user exists, they will receive a verification code' };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid code');
    }

    //Find a valid reset token document
    const token = await this.ResetTokenModel.findOne({
      token: code,
      userId: user._id,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    // Generate a temporary token for password reset
    const resetToken = nanoid(64);
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10); // 10 minutes to reset password

    // Update the token with new reset token
    token.token = resetToken;
    token.expiryDate = expiryDate;
    await token.save();

    return { token: resetToken, message: 'Code verified successfully' };
  }

  async resetPasswordWithToken(newPassword: string, resetToken: string) {
    //Find a valid reset token document
    const token = await this.ResetTokenModel.findOneAndDelete({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    //Change user password (MAKE SURE TO HASH!!)
    const user = await this.UserModel.findById(token.userId);
    if (!user) {
      throw new InternalServerErrorException();
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password reset successfully' };
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }
    return this.generateUserTokens(token.userId);
  }

  async generateUserTokens(userId) {
    const user = await this.UserModel.findById(userId);
    const payload = {
      userId,
      userType: user.userType,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '10h' });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: string) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }

  async getUserPermissions(userId: string) {
    const user = await this.UserModel.findById(userId);

    if (!user) throw new BadRequestException();

    const role = await this.rolesService.getRoleById(user.roleId.toString());
    return role.permissions;
  }

  async getUserProfile(userId: string) {
    const user = await this.UserModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async googleLogin(googleUser: any) {
    const { email, firstName, lastName, picture } = googleUser;
    
    // Check if user exists
    let user = await this.UserModel.findOne({ email });
    
    if (!user) {
      // Create new user if doesn't exist
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await this.UserModel.create({
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        userType: UserType.PATIENT, // Default to patient
        phoneNumber: '', // Will be updated later
        picture,
        isGoogleUser: true,
      });
    }
    
    // Generate tokens
    const tokens = await this.generateUserTokens(user._id);
    return {
      ...tokens,
      userId: user._id,
      role: user.userType,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    };
  }
}
