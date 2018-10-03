const users = require('../sample/usersData');

module.exports = function( req, res, next ) {

    let name            = req.body.name;
    let surname         = req.body.surname;
    let password        = req.body.password;
    let strMessage      = '';
    let boolIsValid     = true;
    let passwordPattern = new RegExp('^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))');
    
    if( !name ) {
        boolIsValid = false
        strMessage += "Name is required. ";
    } else if ( users.some( item => item.name == req.body.name ) ) {
        boolIsValid = false
        strMessage += "Name already exists. ";
    }

    if( !surname ) {
        boolIsValid = false
        strMessage += "Surname is required. ";
    }

    if( !password ) {
        boolIsValid = false
        strMessage += "Password is required. ";
    } else if ( password.length < 8 ) {
        boolIsValid = false
        strMessage += "Password length should be minimum 8 characters. ";
    } else if ( !passwordPattern.test( password ) ) {
        boolIsValid = false
        strMessage += "Password must contain at least 1 lowercase, 1 uppercase and 1 numeric character. ";
    }

    if( !boolIsValid ) {
        res.status(422).json({ message: strMessage });
    }
    
    next();
}