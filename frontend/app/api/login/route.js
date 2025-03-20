import dbConnect from '../../../lib/utils';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    // Parse the JSON body.
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing username or password' }), { status: 400 });
    }
    
    await dbConnect();
    
    const user = await User.findOne({ username });
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }
    
    return new Response(
      JSON.stringify({
        message: 'Login successful',
        role: user.role,
        username: user.username,
      }),
      { status: 200 }
    );
  }
