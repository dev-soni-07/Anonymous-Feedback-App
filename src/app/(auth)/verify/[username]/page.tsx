'use client';

import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { verifySchema } from '@/schemas/verify.schema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const VerifyAccount = () => {
    const router = useRouter();
    const params = useParams<{ username: string }>();
    const { toast } = useToast();

    // Implementing Zod
    const form = useForm<z.infer<typeof verifySchema>>(
        {
            resolver: zodResolver(verifySchema),
        }
    );

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try {
            const response = await axios.post('/api/verify-code', {
                username: params.username,
                code: data.code,
            });

            toast(
                {
                    title: "Success",
                    description: response.data.message,
                }
            );

            router.replace(`/login`);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;

            toast({
                title: 'Verification Failed',
                description:
                    axiosError.response?.data.message ??
                    'An error occurred. Please try again.',
                variant: 'destructive',
            });
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="w-full max-w-max p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Verify Code
                    </h1>
                    <p className="mb-4">Enter the verification code sent to your email</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="code"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <Input placeholder='Enter your verification code' {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className='w-full'>Verify</Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default VerifyAccount;