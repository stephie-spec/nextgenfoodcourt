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
        // Determine which endpoint to call based on role
        const endpoint = credentials.role === 'customer' 
          ? 'http://localhost:5555/api/customer/login'
          : 'http://localhost:5555/owners/login';
        
        return fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          })
        })
          .then(response => {
            if (!response.ok) return null;
            return response.json();
          })
          .then(user => {
            if (user && (user.id || user.owner?.id)) {
              const userData = user.owner || user;
              return {
                id: userData.id.toString(),
                email: userData.email,
                name: userData.name || userData.email,
                role: credentials.role,
                token: user.token || userData.token
              };
            }
            return null;
          })
          .catch(() => null);
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
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};

export default NextAuth(authOptions);