// express validator 5.3.1
exports.userSignupValidator = (req, res, next) => {
    req.check('name', 'Name is required').notEmpty();
    req.check('email', 'Email must be between 3 to 32 characters')
        .matches(/.+\@.+\..+/)
        .withMessage('Email must contain @')
        .isLength({
            min: 4,
            max: 32
        });
    req.check('password', 'Password is required').notEmpty();
    req.check('password')
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters')
        .matches(/\d/)
        .withMessage('Password must contain a number');
    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    next();
};

// express validator 6.2.0

// const { check } = require('express-validator');

// exports.userSignupValidator = [
//     check('name')
//         .not()
//         .isEmpty()
//         .withMessage('Name is required'),
//     check('email')
//         .isEmail()
//         .withMessage('Must be a valid email address'),
//     check('password')
//         .isLength({ min: 6 })
//         .withMessage('Password must be at least  6 characters long')
// ];

// exports.userSigninValidator = [
//     check('email')
//         .isEmail()
//         .withMessage('Must be a valid email address'),
//     check('password')
//         .isLength({ min: 6 })
//         .withMessage('Password must be at least  6 characters long')
// ];

// exports.forgotPasswordValidator = [
//     check('email')
//         .not()
//         .isEmpty()
//         .isEmail()
//         .withMessage('Must be a valid email address')
// ];

// exports.resetPasswordValidator = [
//     check('newPassword')
//         .not()
//         .isEmpty()
//         .isLength({ min: 6 })
//         .withMessage('Password must be at least  6 characters long')
// ];

//https://auth0.com/blog/express-validator-tutorial/
//https://express-validator.github.io/docs/sanitization.html