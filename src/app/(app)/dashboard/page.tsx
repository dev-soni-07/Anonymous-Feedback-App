'use client';

import MessageCard from "@/components/MessageCard";
import MessageCardCarousel from "@/components/MessageCardCarousel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/models/User.model";
import { acceptMessageSchema } from "@/schemas/acceptMessage.schema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Key, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const UserDashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const { toast } = useToast();

  // Optimistic UI Update
  const handleDeleteMessage = (messageId: unknown) => {
    setMessages(messages.filter((message) => message._id !== messageId));
    fetchAllMessages();
  };

  const { data: session } = useSession();

  // Implementing zod
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);

    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessage);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error occurred",
        description: axiosError.response?.data.message || 'Failed to fetch accept messages status',
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchAllMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    setIsSwitchLoading(false);

    try {
      const response = await axios.get<ApiResponse>('/api/get-messages', {});
      let result = response.data.message ?? [];
      setMessages(result as unknown as Message[]);
      if (refresh) {
        toast({
          title: "Refreshed Messages",
          description: "Messages have been refreshed",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error occurred",
        description: axiosError.response?.data.message || 'Failed to fetch messages',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSwitchLoading(false);
    }
  }, [setIsLoading, setMessages, toast]);

  useEffect(() => {
    if (!session || !session.user || hasFetched) return;
    fetchAllMessages();
    fetchAcceptMessages();
    setHasFetched(true);
  }, [session, setValue, fetchAcceptMessages, fetchAllMessages, toast, hasFetched]);

  // Handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });

      setValue('acceptMessages', !acceptMessages);

      toast({
        title: response.data.message,
        variant: "default",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error occurred",
        description: axiosError.response?.data.message || 'Failed to fetch accept messages status',
        variant: "destructive",
      });
    }
  };

  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
        <h1 className="text-3xl font-bold mb-10">Please login to access your dashboard</h1>
        <Link href="/login">
          <Button className="bg-blue-600 text-white hover:bg-blue-500">Login</Button>
        </Link>
      </div>
    );
  }

  const { username } = session?.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/user/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "URL Copied!",
      description: "Profile URL has been copied to clipboard",
      variant: "default",
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      <div className="my-8 mx-4 md:mx-6 lg:mx-8 xl:mx-10 p-4 md:p-6 lg:p-8 bg-gray-800 text-white rounded w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-10">My Dashboard</h1>

        <div className="mb-4 w-full">
          <h2 className="text-lg font-semibold mb-2 text-slate-100">Copy Your Profile Link</h2>
          <div className="flex items-center justify-center w-full">
            <input
              type="text"
              value={profileUrl}
              disabled
              className="input input-bordered w-full p-2 mr-2 text-slate-600 bg-slate-100"
            />
            <Button onClick={copyToClipboard} className="bg-slate-700 text-white hover:bg-slate-600">Copy</Button>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-start w-full">
          <Switch
            {...register('acceptMessages')}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <span className="ml-2 text-slate-300">
            Accept Messages: {acceptMessages ? 'On' : 'Off'}
          </span>
        </div>
        <Separator />

        <div className="flex justify-end mt-5 w-full">
          <Button
            className="bg-slate-700 text-slate-100 hover:bg-slate-600 hover:text-white"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              fetchAllMessages(true);
            }}
          >
            {isLoading ? (
              <>
                Loading Messages... &nbsp; <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Refresh Messages &nbsp; <RefreshCcw className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {messages.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {messages.map((message, index) => (
              <MessageCard
                key={message._id as Key}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-10 w-full">
            <p className="text-slate-300 text-lg">No messages to display</p>
            <div className="flex flex-col md:flex-row gap-5 items-center justify-center p-5 w-full">
              <p className="text-center md:text-left text-slate-300">Please share your profile link within your network to receive messages</p>
              <Button onClick={copyToClipboard} className="bg-slate-700 text-white hover:bg-slate-600">
                Copy Profile Link
              </Button>
            </div>
            <MessageCardCarousel />
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;