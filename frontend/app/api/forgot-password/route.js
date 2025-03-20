import dbConnect from '../../../lib/utils';
import User from '../../../models/User';
import { sendOTPEmail } from '../../../lib/email';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
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
    
    // Generate a 6-digit OTP and set expiry (10 minutes from now)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    
    await user.save();
    
    // Send the OTP via email using Nodemailer (or log it for testing)
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
      // Optionally, you could choose to still return success or an error.
    }
    
    return new Response(
      JSON.stringify({ message: 'OTP sent successfully to your email' }),
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error in forgot-password endpoint:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
