const jwt = require('jsonwebtoken');
const secret = 'ILoveGunjan'; // Note : Change this when going live
const bcrypt = require("bcrypt-nodejs");

module.exports = function(req, res, next) {
    if(req.headers.authorization){
        jwt.verify(req.headers.authorization, secret, function(err, decoded) {
            if(err) {
                res.staus(401).json({message:"Token invalid"})
            } else {
                req.decoded = decoded;
                next();
            }
        })
    } else {
        res.status(401).json({message: "Token Missing!, Please login"})
    }
}