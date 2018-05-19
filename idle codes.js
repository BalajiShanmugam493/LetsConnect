//Email verification

let transporter = mailer.createTransport({
    host: 'localhost',
    port: 587,
    secure: false,
    auth: {
      user: 'ajaynba001@gmail.com',
      pass: 'ajaydev#1'
    }
  });


  let mailOptions = {
    from: '"LetsConnect" <ajaynba001@gmail.com>',
    to: req.body.email,
    subject: 'nodemailer check',
    text: 'You did it fucker!!',
    html:'<b>Yeah!!!</b>'
  };


  transporter.sendMail(mailOptions, function(err, info){
    console.log("In sendMail")
    if(err) return err;
    console.log("Message sent: %s", info.messageId);
    console.log('Preview URL: %s', mailer.getTestMessageUrl(info));
    console.log('Success');
  });
  