var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var User = require(libs + 'model/user');
var Attendance = require(libs + 'model/attendance')
var log = require(libs + 'log')(module);
var Course = require(libs + 'model/course')
var db = require(libs + 'db/mongoose');

router.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header("Access-Control-Allow-Credentials", value = "true");
    log.info(req.method);
    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
        //respond with 200
        res.send(200);
    } else {
        //move on
        next();
    }
});

router.get('/:id', passport.authenticate('bearer', { session: false }),
    function(req, res) {
        Course.findOne({ _id: req.params.id })
            .populate('attendance')
            .exec(function(err, obj) {

                if (!err) {
                    return res.json(obj);
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s', res.statusCode, err.message);

                    return res.json({
                        error: 'Server error'
                    });
                }
            });
    }
);


router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var attendance = new Attendance({
        number: req.body.number,
    });

    attendance.save(function(err, obj) {
        if (!err) {
            Course.update({ _id: req.body.id }, {
                    $push: { attendance: attendance._id },
                    $inc: { attendanceNum: 1 }
                },
                function(err, obj) {
                    if (!err) {
                        return res.json({
                            status: 'OK',
                            response: obj
                        });
                    }
                    console.log(err);
                    return res.status(500).send();
                });
        }
    });

});


module.exports = router;