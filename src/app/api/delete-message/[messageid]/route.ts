import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { User } from "next-auth";

export async function DELETE(request: Request, { params }: { params: { messageid: string } }) {
    const messageId = params.messageid;
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

    try {
        const updatedResult = await UserModel.updateOne(
            {
                _id: user._id
            },
            {
                $pull: {
                    messages: {
                        _id: messageId
                    }
                }
            }
        );

        if (updatedResult.modifiedCount === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Message not found or already deleted"
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Message deleted successfully"
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.log("Error while deleting message", error);
        return Response.json(
            {
                success: false,
                message: "Error while deleting message"
            },
            {
                status: 500
            }
        )
    }
}