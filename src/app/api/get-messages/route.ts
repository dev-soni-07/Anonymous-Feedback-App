import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/models/User.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const _user: User = session?.user as User;

    if (!session || !_user) {
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

    // Converting user._id to a mongoose ObjectId type to use in MongoDB Aggregation Pipelines
    const userId = new mongoose.Types.ObjectId(_user._id);

    try {
        const user = await UserModel.aggregate(
            [
                {
                    $match: {
                        _id: userId,
                    }
                },
                {
                    $unwind: {
                        path: "$messages",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $sort: {
                        "messages.createdAt": -1
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        messages: {
                            $push: "$messages"
                        }
                    }
                },
            ]
        );

        if (!user || user.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: user[0]?.messages as Message[]
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("Failed to get user messages", error);
        return Response.json(
            {
                success: false,
                message: "Failed to get user messages"
            },
            {
                status: 500
            }
        )
    }
}