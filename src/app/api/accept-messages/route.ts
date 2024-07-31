import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { User } from "next-auth";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated"
            },
            {
                status: 401
            }
        )
    }

    const userId = user._id;

    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                isAcceptingMessage: acceptMessages,
            },
            {
                new: true,
            }
        )

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Unable to find user to update message acceptance status"
                },
                {
                    status: 404,
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "Message acceptance status updated successfully",
                updatedUser,
            },
            {
                status: 200,
            }
        )

    } catch (error) {
        console.log("Failed to update user status to accept messages", error);
        return Response.json(
            {
                success: false,
                message: "Failed to update user status to accept messages"
            },
            {
                status: 500,
            }
        )
    }
}

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated"
            },
            {
                status: 401
            }
        )
    }

    const userId = user._id;

    try {
        const user = await UserModel.findById(userId);

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404,
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "User found",
                isAcceptingMessage: user.isAcceptingMessage,
            },
            {
                status: 200,
            }
        )
    } catch (error) {
        console.log("Failed to fetch user's accepting message status", error);
        return Response.json(
            {
                success: false,
                message: "Failed to fetch user's accepting message status"
            },
            {
                status: 500,
            }
        )
    }
}