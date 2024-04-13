const nodemailer = require('nodemailer');

const sendEmail = async (option)=>{
    
    // CREATE A TRANSORTER
    const transporter = nodemailer.createTransport({
        host:"sandbox.smtp.mailtrap.io",
        port:25,
        secure:false,
        auth:{
            user:"2930038d748f15",
            pass:"734254db57e89c"
        }
    });
   
    // DEFINE EMAIL OPTIONS
    const emailOptions = {
        from: '"Field Ruan support" <fieldruan@gmail.com>',
        to: option.email,
        subject:option.subject,
        text:option.message
    }
    //console.log(option.email,option.subject,option.message);
    await transporter.sendMail(emailOptions);
    //console.log("Message sent:%s",info.messageId);
}
module.exports = sendEmail;