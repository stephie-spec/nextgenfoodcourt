import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        // Determine endpoint based on role
        let endpoint;
        if (credentials.role === 'customer') {
          endpoint = 'http://localhost:5555/api/customer/login';
        } else if (credentials.role === 'owner') {
          endpoint = 'http://localhost:5555/owners/login'; 
        } else {
          return null;
        }
        
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          if (!response.ok) {
            console.error('Login failed:', response.status);
            return null;
          }

          const data = await response.json();
          
          if (data.token) {
            // Store token in localStorage for API calls
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', data.token);
              localStorage.setItem('user_role', credentials.role);
            }
            
            return {
              id: data.customer?.id?.toString() || data.owner?.id?.toString(),
              email: data.customer?.email || data.owner?.email,
              name: data.customer?.name || data.owner?.name || credentials.email,
              role: credentials.role,
              token: data.token
            };
          }
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-nextauth-secret-key',
};

export default NextAuth(authOptions);