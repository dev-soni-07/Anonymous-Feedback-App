'use client';

import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/message.schema';
import { useSession } from 'next-auth/react';

const SendMessage = () => {
    const params = useParams<{ username: string }>();
    const username = params.username;

    const { data: session } = useSession();

    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
    });

    const messageContent = form.watch('content');

    const handleMessageClick = (message: string) => {
        form.setValue('content', message);
    };

    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestLoading, setIsSuggestLoading] = useState(false);
    const [suggestedMessages, setSuggestedMessages] = useState<{ messageId: string, messageText: string }[]>([]);

    const fetchSuggestedMessages = useCallback(async () => {
        setIsSuggestLoading(true);
        try {
            const response = await axios.post('/api/suggest-messages');
            setSuggestedMessages(response.data.suggestions);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast({
                title: 'Error',
                description: 'Error fetching suggested messages',
                variant: 'destructive',
            });
        } finally {
            setIsSuggestLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSuggestedMessages();
    }, [fetchSuggestedMessages]);

    const onSubmit = async (data: z.infer<typeof messageSchema>) => {
        setIsLoading(true);
        try {
            const response = await axios.post<ApiResponse>('/api/send-message', {
                ...data,
                username,
            });

            toast({
                title: response.data.message,
                variant: 'default',
            });
            form.reset({ ...form.getValues(), content: '' });
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description:
                    axiosError.response?.data.message ?? 'Failed to send message',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen text-white">
            <div className="my-8 mx-4 md:mx-6 lg:mx-8 xl:mx-10 p-4 md:p-6 lg:p-8 bg-gray-800 text-white rounded w-full max-w-6xl">
                <h1 className="text-4xl font-bold mb-10">
                    Public Profile Link
                </h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg font-semibold mb-2 text-slate-100 mb-5">Send Anonymous Message to @{username}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Start writing a anonymous message here"
                                            className="resize-none bg-slate-800 text-slate-300"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-center">
                            {isLoading ? (
                                <Button disabled className="bg-slate-700 text-white hover:bg-slate-600">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait...
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isLoading || !messageContent} className="bg-slate-700 text-white hover:bg-slate-600">
                                    Send Message
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>

                <div className="space-y-4 my-8">
                    <div className="space-y-2">
                        <div className="flex justify-end mt-5">
                            <Button
                                onClick={fetchSuggestedMessages}
                                className="bg-slate-700 text-slate-100 hover:bg-slate-600 hover:text-white"
                                variant="outline"
                                disabled={isSuggestLoading}
                            >
                                {isSuggestLoading ? (
                                    <>
                                        Loading Messages... &nbsp; <Loader2 className="h-4 w-4 animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        Suggest Messages &nbsp; <RefreshCcw className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-slate-400">Click on any message below to select it.</p>
                    </div>
                    <Card className="bg-slate-800">
                        <CardHeader>
                            <h3 className="text-xl font-semibold text-slate-200">Suggested Messages</h3>
                        </CardHeader>
                        <CardContent className="flex flex-col space-y-4">
                            {suggestedMessages.length === 0 ? (
                                <p className="text-slate-400">No suggestions available</p>
                            ) : (
                                suggestedMessages.map(({ messageId, messageText }) => (
                                    <Button
                                        key={messageId}
                                        variant="outline"
                                        className="bg-slate-700 text-slate-100 hover:bg-slate-600 hover:text-white"
                                        onClick={() => handleMessageClick(messageText)}
                                    >
                                        {messageText}
                                    </Button>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
                {
                    (!session || !session.user) && (
                        <>
                            <Separator className="my-6 bg-slate-600" />
                            <div className="flex flex-row gap-5 items-center justify-center p-5">
                                <p className="text-slate-300">Get Your Message Dashboard</p>
                                <Link href={'/sign-up'}>
                                    <Button className="bg-slate-700 text-white hover:bg-slate-600">Create Your Account</Button>
                                </Link>
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    );
}

export default SendMessage;