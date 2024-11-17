import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            console.error("Login error:", errorData);
            return null;
          }

          const result = await res.json();

          if (result && result.user) {
            return result.user;
          }
          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.user = user;
        if (user.token) {
          token.accessToken = user.token;
        }
      }
      return token;
    },
  },

  pages: {
    signIn: "/users",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// Simply export NextAuth as the default export.
export default NextAuth(authOptions);
