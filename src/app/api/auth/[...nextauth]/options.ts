import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User.model';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();

                try {
                    let user;
                    if (credentials.identifier.includes('@')) {
                        user = await UserModel.findOne({ email: credentials.identifier });
                    } else {
                        user = await UserModel.findOne({ username: credentials.identifier });
                    }

                    if (!user) {
                        console.error("User not found with this email or username");
                        throw new Error("User not found with this email or username");
                    }

                    // if (!user.isVerified) {
                    //     console.error("User not verified");
                    //     throw new Error("Please verify your account first");
                    // }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                    if (isPasswordCorrect) {
                        return user;
                    } else {
                        console.error("Password is incorrect");
                        throw new Error("Password is incorrect");
                    }
                } catch (error: any) {
                    console.error("Error in authorize function:", error.message);
                    throw new Error(error.message);
                }
            }
        })

        // Add other providers here like google, github, linkedin etc.
    ],

    // Callbacks
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user._id?.toString();
                // token.isVerified = user.isVerified;
                token.isAcceptingMessage = user.isAcceptingMessage;
                token.username = user.username;
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token.id as string;
                // session.user.isVerified = token.isVerified as boolean;
                session.user.isAcceptingMessage = token.isAcceptingMessage as boolean;
                session.user.username = token.username as string;
            }

            return session;
        }
    },

    pages: {
        signIn: "/login",
    },

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,
};