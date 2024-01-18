const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "alfhakjfkagfkahfkaf"


// Route 1 : Authanticat a user using post "/api/auth/creatUser", no login required
router.post('/createUser', [
    body('email','Enter a valid email').isEmail(),
    body('name',' Enter a valid name').isLength({ min: 3 }),
    body('password', 'Password must contain at least 5 cherectors').isLength({ min: 5 }),
],   
  async (req, res)=> {
    let success = false
   const errors = validationResult(req);
   if(!errors.isEmpty()){
    return res.status(400).json({ success, errors: errors.array()})
   }

   // check is user with this e-mail exist already 

   try {
   
    let user  = await User.findOne({email: req.body.email});
    if(user){
        return res.status(400).json({success, error: "Sorry a user with this email is already exists."})
    }
    const salt = await bcrypt .genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt) 

    // Creat a new user

    user = await User.create({
    name: req.body.name,
    password: secPass,
    email: req.body.email,

});
const data = {
    user: {
        id: user.id
    }
}
const authtoken = jwt.sign(data, JWT_SECRET)
// console.log(authtoken);
success = true

res.json({success, authtoken})

} catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured")
}
   



});
// Route 2 : Authanticat a user using post "/api/auth/login", no login required


router.post('/login', [
    body('email','Enter a valid email').isEmail(),
    body('password', 'Password connot be blank').exists({ min: 5 }),

],   
  async (req, res)=> {
    let success = false
    const errors = validationResult(req);
    if(!errors.isEmpty()){
     return res.status(400).json({ errors: errors.array()})
    }
 

    const {email, password} = req.body;
    try {
        let user = await User.findOne({email})
        if(!user){
            return res.status(400).json({error: "Please try to log in with correct credentials"})
        }
        const passwordcompare = await bcrypt.compare(password, user.password);
        if(!passwordcompare){
            success = false
            return res.status(400).json({success, error: "Please try to log in with correct credentials"})
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        // console.log(authtoken, "abc");
        success = true
        res.json({success, authtoken})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error")
        
    }

  });

  // Route 3 : Get logged-in user details using post "/api/auth/getuser", login required
  router.post('/getuser', fetchuser,   async (req, res)=> {

  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message);
        res.status(500).send("Internal server error")
  }

})
module.exports = router