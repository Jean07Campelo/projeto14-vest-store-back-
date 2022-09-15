import db from "../database/db.js";
import joi from "joi";
import bcrypt from "bcrypt";

const newUserSchema = joi.object({
  name: joi.string().required().empty(" "),
  email: joi.string().required().email(),
  password: joi.string().required(),
  imageProfile: joi.string().required(),
});

async function registerNewUser(req, res) {
  const { name, email, password, imageProfile } = req.body;

  const validationNewUser = newUserSchema.validate(req.body, {
    abortEarly: false,
  });

  if (validationNewUser.error) {
    const errors = validationNewUser.error.details.map(
      (detail) => detail.message
    );
    return res.status(422).send({ message: errors });
  }

  try {
    const userAlreadyRegistered = await db
      .collection("dataUsers")
      .findOne({ email });

    if (userAlreadyRegistered) {
      res.status(422).send({ message: "User already registered" });
    }
  } catch (error) {
    return res.sendStatus(500);
  }

  //register new user
  try {
    db.collection("dataUsers").insertOne({
      name,
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      imageProfile,
    });
  } catch (error) {
    return res.status(500).send({ message: "Register failed" });
  }

  res.sendStatus(201);
}

export { registerNewUser };
