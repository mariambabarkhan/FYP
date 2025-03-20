import dbConnect from '../../../lib/utils';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    console.log('POST /api/register');
    const { username, password, email } = await request.json();
  
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Missing username or password' }),
        { status: 400 }
      );
    }
  
    if (username.toLowerCase() === 'admin') {
      return new Response(
        JSON.stringify({ error: 'Cannot register as admin' }),
        { status: 400 }
      );
    }
  
    await dbConnect();
  
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'User already exists' }),
        { status: 400 }
      );
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      email,
      role: 'user'
    });
    console.log(user);
  
    try {
      await user.save();
      return new Response(
        JSON.stringify({ message: 'User registered successfully' }),
        { status: 200 }
      );
    } catch (error) {
      console.error('Error saving user:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500 }
      );
    }
  }