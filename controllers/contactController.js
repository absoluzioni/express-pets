const petsCollection = require("../db").db().collection("pets");
const contactsCollection = require("../db").db().collection("contacts");
const sanitizeHtml = require("sanitize-html");
const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");
const validator = require("validator");

const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {}
};

exports.submitContact = async function (req, res, next) {
  if (req.body.secret.toUpperCase() !== process.env.CONTACTFORMSECRET) {
    console.log("spam detected");
    return res.json({ message: "Sorry!!!" });
  }

  // check if any fields aren't a string for avoid injections of objects in our MongoDB collection
  if (typeof req.body.name != "string") {
    req.body.name = "";
  }
  if (typeof req.body.email != "string") {
    req.body.email = "";
  }
  if (typeof req.body.comment != "string") {
    req.body.comment = "";
  }

  if (!validator.isEmail(req.body.email)) {
    console.log("invalid email detected");
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

  let ourEmailData = {
    name: sanitizeHtml(req.body.name, sanitizeOptions),
    email: sanitizeHtml(req.body.email, sanitizeOptions),
    comment: sanitizeHtml(req.body.comment, sanitizeOptions)
  };

  let ourDBData = {
    name: ourEmailData.name,
    email: ourEmailData.email,
    comment: ourEmailData.comment,
    petId: doesPetExist._id
  };

  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAPUSERNAME,
      pass: process.env.MAILTRAPPASSWORD
    }
  });

  try {
    const promise1 = transport.sendMail({
      from: ourEmailData.email,
      to: "petadoptioncenter@me.com",
      subject: `Thank you to your interesting in ${doesPetExist.name}.`,
      html: `<h3 style="color: purple; font-size: 30px; font-weight: normal;">Thank you ${ourEmailData.name},</h3>
        <p style="font-size: 20px;">We appreciate your interest in ${doesPetExist.name} and one of our
        staff will reach out to you shortly! Below is a copy of the message you sent us for your personal records.</p>
        <p style="font-size: 20px;"><em>${ourEmailData.comment}</em></p>`
    });

    const promise2 = transport.sendMail({
      from: "petadoptioncenter@me.com",
      to: "petadoptioncenter@me.com",
      subject: `Someone is interesting in ${doesPetExist.name}.`,
      html: `<h3 style="color: purple; font-size: 30px; font-weight: normal;">New Contact!</h3>
        <p style="font-size: 20px;"><em>Name: ${ourEmailData.name}</br>
        Email: ${ourEmailData.email}</br>
        Pet interested in: ${doesPetExist.name}</br>
        Comment: ${ourEmailData.comment}</em></p>`
    });

    const promise3 = await contactsCollection.insertOne(ourDBData);

    await Promise.all([promise1, promise2, promise3]);
  } catch (err) {
    next(err);
  }

  res.send("Thanks for sending data to us");
};

exports.viewPetContacts = async function (req, res) {
  res.send("Success!");
};
