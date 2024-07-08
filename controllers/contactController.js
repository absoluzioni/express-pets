const petsCollection = require("../db").db().collection("pets");
const sanitizeHtml = require("sanitize-html");
const { ObjectId } = require("mongodb");

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
  res.send("Success!");
};
