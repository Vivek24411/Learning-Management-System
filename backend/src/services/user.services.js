const crypto = require("crypto");
const {Resend} = require("resend");

module.exports.createOTP = ()=>{
    const OTP =  crypto.randomInt(100000,999999);
    return OTP.toString();
}

module.exports.sendOTP = async(email,OTP)=>{
    const resend = new Resend(process.env.RESEND_API_KEY);

    const {data,error} = await resend.emails.send({
        from: "Edvance <noreply@devx6.live>",
        to: email,
        subject: "Edvance - Your OTP Verification Code",
        text : `Your OTP verification code is: ${OTP}`,
        html : `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #5F6FFF; margin: 0;">Edvance</h1>
                        <p style="color: #666; margin: 5px 0 0;">Yoga Lessons</p>
                    </div>
                    <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
                        <h2 style="margin-top: 0; color: #333;">Verification Code</h2>
                        <p style="margin-bottom: 25px; color: #555;">Use the following code to complete your verification:</p>
                        <div style="background-color: #5F6FFF; color: white; font-size: 24px; font-weight: bold; text-align: center; padding: 15px; border-radius: 5px; letter-spacing: 5px;">
                            ${OTP}
                        </div>
                        <p style="margin-top: 25px; color: #555; font-size: 14px;">This code will expire in 5 minutes for security purposes.</p>
                    </div>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>&copy; 2025 MediCare. All rights reserved.</p>
                    </div>
                </div>
            `
    })

    if(error){
        console.log(`Error sending OTP ${error.message}`);
        throw new Error(`Email Sending Failed: ${error.message}`);
    }
}

module.exports.createHash = (OTP)=>{
    return crypto.createHash("sha256").update(OTP).digest("hex");
}