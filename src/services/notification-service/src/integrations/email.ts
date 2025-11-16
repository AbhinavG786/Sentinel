import {Resend} from "resend";

const resendClient = new Resend(process.env.RESEND_API_KEY!);   

export const sendEmail=async({to,body,subject}: {to: string, body: string, subject: string})=>{
    try {
        await resendClient.emails.send({
            from: "bengupta786@gmail.com",
            to,
            subject,
            html: `<h1>${body}</h1>`
        });
    } catch (error) {
        console.error("Error sending email:", error);
    }
}