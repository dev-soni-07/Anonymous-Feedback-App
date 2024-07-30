import dbConnect from "@/lib/dbConnect";
import { z } from "zod";
import UserModel from "@/models/User.model";
import { usernameValidation } from "@/schemas/signUp.schema";
import { messageSchema } from "@/schemas/message.schema";

const UsernameQuerySchema = z.object(
    {
        username: usernameValidation,
    }
);

export async function GET(request: Request) {
    await dbConnect();
    // http://localhost:3000/api/check-username-unique?username=devsoni071103

    try {
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get("username"),
        }

        // Validate the query parameters using Zod
        const result = UsernameQuerySchema.safeParse(queryParam);
        console.log(result); // TODO: To be removed

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];

            return Response.json(
                {
                    success: false,
                    message: usernameErrors?.length > 0 ? usernameErrors.join(", ") : "Invalid query parameters",
                },
                {
                    status: 400,
                }
            )
        }

        const { username } = result.data;

        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Username already taken",
                },
                {
                    status: 400,
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "Username is unique",
            },
            {
                status: 200,
            }
        )

    } catch (error) {
        console.error("Error checking username uniqueness", error);

        return Response.json(
            {
                success: false,
                message: "An error occurred while checking username uniqueness",
            },
            {
                status: 500,
            }
        )
    }
}