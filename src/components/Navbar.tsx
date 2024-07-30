'use client'

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from './ui/button';

const Navbar = () => {
    const { data: session } = useSession();
    const user: User = session?.user as User;

    return (
        <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <Link href="/dashboard" className="text-xl font-bold mb-4 md:mb-0">
                    Anonymous Feedback App
                </Link>
                {session ? (
                    <>
                        <span className="mr-4">
                            Welcome, {user?.username || user?.email}
                        </span>
                        <Button onClick={() => signOut()} className="w-full md:w-auto bg-slate-100 text-black" variant='outline'>
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Link href="/login">
                            <Button className="w-full md:w-auto bg-slate-100 text-black" variant={'outline'}>Login</Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button className="w-full md:w-auto bg-black-100 text-slate" variant={'outline'}>Sign up</Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar;