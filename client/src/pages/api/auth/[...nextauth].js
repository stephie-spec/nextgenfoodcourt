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
        try {
          // Call your Flask backend API
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });

          const user = await response.json();
          
          if (response.ok && user) {
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              role: user.role
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
    session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    }
  },
  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions);