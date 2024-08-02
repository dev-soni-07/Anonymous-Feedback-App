import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Anonymous Feedback",
    description: "Anonymous feedback from real people",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <AuthProvider>
                <body className={`${inter.className} bg-gray-800`}>
                    <Navbar />
                    {children}
                    <Toaster />
                    <Footer />
                </body>
            </AuthProvider>
        </html>
    );
}