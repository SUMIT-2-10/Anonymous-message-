import dbconnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import bcrypt from "bcrypt";

import { sendVerificationEmail } from "@/helpers/sendVerficationEmail";
import { success } from "zod";

export async function POST(request: Request) {
    await dbconnect();
    try {
        const { username, email, password } = await request.json();
        const existingUserVerfiedByUsername = await UserModel.findOne({ username, isverified: true})

        if (existingUserVerfiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists"
                },
                {
                    status: 400
                }
            )
        }

        const existingUserByEmail = await UserModel.findOne({ email})
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (existingUserByEmail) {
            if (existingUserByEmail.isverified){
                return Response.json({
                    success: false,
                    message: "User aleady exist wth this email"
                },{status: 400})

            }
            else{
                const hashedPassword = await bcrypt.hash(password,10)
                existingUserByEmail.password= hashedPassword,
                existingUserByEmail.verifycode = verificationCode;
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 1);
                existingUserByEmail.veryfycodeExpire = expiryDate;

                await existingUserByEmail.save();
            }
        }
        else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verificationCode,
                veryfycodeExpire: expiryDate,
                isverified: false,
                isAccpetingMessages: false,
                messages: []
            });

            await newUser.save();
        }

        //send verification email 
        const emailResponse = await sendVerificationEmail(email,username,verificationCode)

        if(!emailResponse.success){
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message
                },
                {
                    status: 500
                }
            )
        }

        return Response.json({
            success: true,
            message: "User registered successfully. Please verify email"
        },{status: 201})

    } catch (error) {
        console.error("Error in sign-up route", error);
        return Response.json(
            {
                success: false,
                message: "An error occurred during sign-up"
            },
            {
                status: 500
            }
        )

    }
}