const petsCollection = require("../db").db().collection("pets");
const sanitizeHtml = require("sanitize-html");
const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");

const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {}
};

exports.submitContact = async function (req, res) {
  if (req.body.secret.toUpperCase() !== process.env.CONTACTFORMSECRET) {
    console.log("spam detected");
    return res.json({ message: "Sorry!!!" });
  }

  if (!ObjectId.isValid(req.body.petId)) {
    console.log("Invalid ID");
    return res.json({ message: "Invalid ID" });
  }

  const doesPetExist = await petsCollection.findOne({
    _id: ObjectId.createFromHexString(req.body.petId)
  });

  if (!doesPetExist) {
    console.log("There's no pet with that ID");
    return res.json({ message: "Invalid ID" });
  }

  let ourFormData = {
    name: sanitizeHtml(req.body.name, sanitizeOptions),
    email: sanitizeHtml(req.body.email, sanitizeOptions),
    comment: sanitizeHtml(req.body.comment, sanitizeOptions)
  };

  console.log(ourFormData);

  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAPUSERNAME,
      pass: process.env.MAILTRAPPASSWORD
    }
  });

  transport.sendMail({
    from: ourFormData.email,
    to: "petadoptioncenter@me.com",
    subject: `Thank you to your interesting in ${doesPetExist.name}.`,
    html: `<h3 style="color: purple; font-size: 30px; font-weight: normal;">Thank you ${ourFormData.name},</h3>
      <p style="font-size: 20px;">We appreciate your interest in ${doesPetExist.name} and one of our
      staff will reach out to you shortly! Below is a copy of the message you sent us for your personal records.</p>
      <p style="font-size: 20px;"><em>${ourFormData.comment}</em></p>`
  });

  transport.sendMail({
    from: "petadoptioncenter@me.com",
    to: "petadoptioncenter@me.com",
    subject: `Someone is interesting in ${doesPetExist.name}.`,
    html: `<h3 style="color: purple; font-size: 30px; font-weight: normal;">New Contact!</h3>
      <p style="font-size: 20px;"><em>Name: ${ourFormData.name}</br>
      Email: ${ourFormData.email}</br>
      Pet interested in: ${doesPetExist.name}</br>
      Comment: ${ourFormData.comment}</em></p>`
  });

  res.send("Success!");
};
