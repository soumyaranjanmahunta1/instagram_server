const express = require("express");
const { connection } = require("./configs/db");
const { userModel } = require("../BackEnd/Model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authentication } = require("./middleware/authentication");
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello world");
});

//signup
app.post("/signup", async (req, res) => {
  const { email, name, password } = req.body;
  const isUser = await userModel.findOne({ email: email });
  if (isUser) {
    res.send({ msg: "User alredy exist go to login" });
  } else {
    bcrypt.hash(password, 4, async function (err, hash) {
      if (err) {
        res.send({ msg: "Somthing went wrong in bcrypt" });
      }
      const new_user = new userModel({
        email,
        name,
        password: hash,
      });
      try {
        await new_user.save();
        res.send({ msg: "signup successful" });
      } catch (err) {
        res.send({ msg: "Somthing went wrong in bcrypt", error: err });
      }
       console.log(new_user);
    });
  }
});
//login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const User = await userModel.findOne({ email });
    const user_id=User._id
    console.log(user_id);
    bcrypt.compare(password, User.password, function (err, result) {
        if (err) {
            res.send({ msg: "Somthing went wrong try again later" })
        }
        if (result) {
            var token = jwt.sign({ user_id }, process.env.SECRET_KEY);
            res.send({mas:"login Successful",token})
        }
        else {
            res.send({ mas: "login Faild"});
        }
   })

})
//Home
app.get("/home", authentication, async (req, res) => {
    const { user_id }=req.body;
    const user = await userModel.findOne({ _id: user_id });
    const { name, email } = user;
    res.send({name,email})
})

app.listen(8000, async () => {
  try {
    await connection;
  } catch (err) {
    console.log(err);
  }
  console.log("listening on 8000");
});
