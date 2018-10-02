const express = require('express');
const app = express();
const users = require('./sample/usersData');
const bodyParser = require("body-parser");

const jwt = require('jsonwebtoken');
const secret = 'ILoveGunjan'; // Note : Change this when going live
const bcrypt = require("bcrypt-nodejs");

const Authentication = require('./middlewares/Authentication.js')

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

app.post('/register',function(req, res){
    if(req.body.name && req.body.password && req.body.surname) {
    // if(req.body.name !=undefined && req.body.name != '' && req.body.password != '' && req.body.surname != '' ) {
        users.push({
            id : users.length + 1,
            name : req.body.name,
            password : req.body.password,
            surname : req.body.surname
        });
        res.status(200).json({message: "User Registered sussefully"});
    }
    else {
        res.status(422).json({message: "Name, Password and Surname are required"});
    }
});

app.use(Authentication);

app.get('/',function(req, res){
    // res.sendFile(__dirname + '/abc.html');
    // res.send({message : "welcome"});
    if(req.query.name === 'Bhavesh')
        res.json({message : "Hello Bhavesh! " + req.query.surname});
    else
        res.status(400).json({message : "Error Occured!"});
});

app.get('/users', function(req,res){
    res.json(users);
})

app.get('/my-profile', function(req,res){
    res.json(req.decoded.data);
})

app.get('/users/:id', function(req,res){
    const id = req.params.id;
    let result = null;
    users.forEach(function(val, key){
        if(val.id == id){
            result = val;
        }
    })
    if(result) {
        res.json({message: "User Found", data : result});
    } else {
        res.status('404').json({message: "User Not found!"});
    }
})

app.post('/login', function(req, res){
    const name = req.body.name;
    const password = req.body.password;
    let result = null;
    users.forEach(function(val, key){
        if(val.name == name && val.password == password){
            result = Object.assign({},val);
            delete result.password;
        }
    })
    if(result) {
        var token = jwt.sign({data: result}, secret, { expiresIn: '24h' });
        res.json({message: "You are now logged In!!", token : token, profile : result});
    } else {
        res.status('401').json({message: "Username or password incorrect!"});
    }
})

app.listen(3000, function() {
	console.log("Server running on localhost:3000");
})


// Commiting for new development branch.