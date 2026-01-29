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
      authorize(credentials) {
        // user check
        const users = {
          'customer@example.com': { password: 'password123', name: 'John Customer', role: 'customer', id: '1' },
          'owner@example.com': { password: 'password123', name: 'Sarah Owner', role: 'owner', id: '2' },
        };

        const user = users[credentials.email];
        
        if (user && user.password === credentials.password && user.role === credentials.role) {
          return { id: user.id, email: credentials.email, name: user.name, role: user.role };
        }
        
        return null;
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