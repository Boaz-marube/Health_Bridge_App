import {
  Body,
  Controller,
  Post,
  Put,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { DoctorSignupDto } from './dtos/doctor-signup.dto';
import { PatientSignupDto } from './dtos/patient-signup.dto';
import { StaffSignupDto } from './dtos/staff-signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-tokens.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('doctor-signup')
  async doctorSignUp(@Body() signupData: DoctorSignupDto) {
    return this.authService.doctorSignup(signupData);
  }

  @Post('patient-signup')
  async patientSignUp(@Body() signupData: PatientSignupDto) {
    return this.authService.patientSignup(signupData);
  }

  @Post('staff-signup')
  async staffSignUp(@Body() signupData: StaffSignupDto) {
    return this.authService.staffSignup(signupData);
  }

  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @UseGuards(AuthenticationGuard)
  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    return this.authService.changePassword(
      req.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyResetCode(body.email, body.code);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: { token: string; newPassword: string }) {
    return this.authService.resetPasswordWithToken(
      resetPasswordDto.newPassword,
      resetPasswordDto.token,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.authService.getUserProfile(req.userId);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req) {
    const result = req.user;
    // Redirect to patient dashboard with authentication data
    const redirectUrl = `http://localhost:3000/auth/google/success?token=${result.accessToken}&refreshToken=${result.refreshToken}&userId=${result.userId}`;
    return `<script>window.location.href='${redirectUrl}'</script>`;
  }
}
