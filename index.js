const express = require('express');
const app = express();
const bodyParser = require("body-parser");

// ===================================================
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const secret = 'ILoveGunjan'; // Note : Change this when going live
const bcrypt = require("bcrypt-nodejs");
mongoose.connect('mongodb://localhost/node-demo');

const userSchema = new Schema({
    email : {type: String, required: [true,"Email is required"], unique:true},
    name : {type: String, required: [true,"Name is required"], unique:true},
    password : {type: String, required: [true,"Password is required"], unique:true},
    surname : {type: String},
}, {
    collection: 'Users',
    timestamps: true
});

userSchema.pre("save", function(next){
    let user = this;
    if (!user.isModified('password')) return next();
    bcrypt.hash(user.password,null,null,function(err,hash){
        if(err) return next(err);
        user.password = hash;
        next();
    });
});
const Users = mongoose.model('Users', userSchema);
//======================================

const Authentication = require('./middlewares/Authentication.js')
const Validations = require('./middlewares/Validations.js')

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());
// const router = app.Router();

app.post('/register', Validations, function(req, res){
    const user = new Users({
        email: req.body.email,
        name : req.body.name,
        password : req.body.password,
        surname : req.body.surname
    });
    const validationError = user.validateSync();
    if(validationError){
        //Note Check individual validation and respond with proper message
        if(validationError.email){
            return res.status(422).json({message: validationError.email.message});
        }
        else
            return res.status(422).json({message: "Validation Error"});
    }
    user.save((err, data) => {
        if(err){
            if(err.code===11000){

                if(err.errmsg.match(/email/gi)){
                    return res.status(422).json({message: "User Already exists by that email"});
                }
                if(err.errmsg.match(/phone/gi)){
                    return res.status(422).json({message: "User Already exists by that phone"});
                }
                return res.status(422).json({message: "User Already exists."});
            }
            else
                return res.status(400).json({message: "Some Error Occured"});
        }
        delete user.password;

        var token = jwt.sign({data: user}, secret, { expiresIn: '24h' });
        return res.status(200).json({message: "User Registered & logged In successfully", token : token, profile : user});
    })
});

app.post('/login', function(req, res){
    const email = req.body.email;
    const password = req.body.password;
    
    Users.findOne({email}).exec((err, user)=>{
        if(err){
            return res.status(400).json({message : "Error Occured!", mongoMessage: err})
        } else if(user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if(err){
                    return res.status('500').json({message: "Some Error Occured!"});
                }
                if(result) {
                    delete user.password;
                    var token = jwt.sign({data: user}, secret, { expiresIn: '24h' });
                    return res.json({message: "You are now logged In!!", token : token, profile : user});
                } else {
                    return res.status('401').json({message: "Password incorrect!"});
                }
            });
            
        } else {
            return res.status('404').json({message: "User not found!"});
        }
    })
})

app.use(Authentication);

app.get('/',function(req, res){
    // return res.sendFile(__dirname + '/abc.html');
    // return res.send({message : "welcome"});
    if(req.query.name === 'Bhavesh')
        return res.json({message : "Hello Bhavesh! " + req.query.surname});
    else
        return res.status(400).json({message : "Error Occured!"});
});

app.get('/users', function(req,res){
    Users.find().exec((err, users)=>{
        if(err){
            return res.status(400).json({message: "Error occured"});  
        }
        else if(users){
            return res.json(users);
        }
        else {
            return res.status(404).json({message: "No users"});
        }
    })
});

app.get('/my-profile', function(req,res){
    return res.json(req.decoded.data);
});

app.get('/users/:id', function(req,res){ 
    Users.findOne({_id: req.params.id},function(err, user) { 
        if(err) {
            return res.status(400).json({message: err.message});
        } else if(user) {
            return res.json({message: "User Found", data : user});
        } else {
            return res.status('404').json({message: "User Not found!"});
        }
    });
});

app.listen(3000, function() {
	console.log("Server running on localhost:3000");
})

// Commiting for new development branch.

