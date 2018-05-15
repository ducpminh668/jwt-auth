var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');

var port = process.env.PORT || 3000;
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(morgan('dev'));

var user = {
    username: 'duc123',
    'password': '123456'
};

app.get('/', function(req, res) {
    res.send('The API is at http://localhost:' + port + '/api');
});

var apiRoutes = express.Router();

apiRoutes.use(function(req, res, next) {
    if ( req.originalUrl == '/api/authenticate') {
        next();
    } else {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, app.get('superSecret'), function(err, decoded) {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    }

});


apiRoutes.post('/authenticate', function(req, res) {

    var username = req.body.username;
    var password = req.body.password;

    if (username == user.username && password == user.password) {
        var token = jwt.sign(user, app.get('superSecret'), {
            expiresIn: 60 * 60 * 24
        });
        res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
        });
    } else {
        res.json({
            success: false,
            message: 'Authentication failed. Wrong password.'
        });
    }
});




apiRoutes.get('/', function(req, res) {
    res.json({
        message: 'Welcome to API'
    });
});

apiRoutes.get('/users', function(req, res) {
    res.json(user);
});



app.use('/api', apiRoutes);


app.listen(port);
