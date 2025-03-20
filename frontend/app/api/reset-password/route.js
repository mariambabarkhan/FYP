import dbConnect from '../../../lib/utils';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();
    if (!email || !otp || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Query user by email
    const user = await User.findOne({ email });
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      );
    }
    
    // Validate the OTP and expiry
    if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        { status: 400 }
      );
    }
    
    // Hash the new password and update the user record
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;
    
    await user.save();
    
    return new Response(
      JSON.stringify({ message: 'Password reset successfully' }),
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error in reset-password endpoint:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
