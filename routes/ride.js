/**
 * Created by nicolas on 9/19/15.
 */
var express = require('express');
var request = require('request-promise');
var Promise = require('bluebird');
var _ = require('lodash');

var User = require('../models/user.js');

// Minimum ride length
var MIN_RIDE_LENGTH = 1;
var router = express.Router();
var uberAPI = 'https://api.uber.com/v1/';

if (process.env.DEBUG){
    uberAPI = 'https://sandbox-api.uber.com/v1/'
}

console.log(" Using the Uber API: ", uberAPI);

/* get a user rides */
router.post('/', function(req, res) {

    console.log(req.body)

    User.findOne({uberId: req.body.uberId})
        .populate('listOfPlaces')
        .exec(function(err, user){

        if (user != null){
            var estimates = [];

            user = user.toObject();

            for (var i = 0; i < user.listOfPlaces.length ; i++){

                var reqInst = request.get({
                    url: uberAPI + 'estimates/price',
                    json: true,
                    qs: {
                        start_latitude: req.body.start_latitude,
                        start_longitude: req.body.start_longitude,
                        end_latitude: user.listOfPlaces[i].latitude,
                        end_longitude: user.listOfPlaces[i].longitude
                    },
                    auth: {
                        bearer: req.body.accessToken
                    }
                }).promise();

                estimates.push(reqInst);
            }
            return Promise.settle(estimates).then(function(results){

                var rideEstimates = [];

                _.forEach(results, function(res, i){

                    if (!res.isFulfilled()){
                        console.error('An estimate request was rejected, ', user.listOfPlaces[i].name)
                        console.error(res.reason())
                    } else {
                        rideEstimates.push([]);

                        _.forEach(res.value().prices, function(rideEstimate){

                            if (rideEstimate.high_estimate <= req.body.max_dollar &&
                                rideEstimate.distance >= MIN_RIDE_LENGTH &&
                                rideEstimate.distance <= req.body.max_radius
                            ) {

                                rideEstimate.friendFullName = user.listOfPlaces[i].friendFullName;
                                rideEstimate.name = user.listOfPlaces[i].name;
                                rideEstimate.message = user.listOfPlaces[i].message;
                                rideEstimate.end_latitude = user.listOfPlaces[i].latitude;
                                rideEstimate.end_longitude = user.listOfPlaces[i].longitude;

                                rideEstimates[rideEstimates.length - 1].push(rideEstimate)
                            }
                        });
                    }

                });

                return _.min(_.sample(rideEstimates), function(estimate){
                    return estimate.high_estimate;
                });

            }).then(function(selectedRide){
                console.log(selectedRide);

                if (!_.isEmpty(selectedRide)){
                    /*
                    return request.post({
                        url: uberAPI + 'requests',
                        header: {
                            "Content-type": "application/json"
                        },
                        json: true,
                        body: {
                            product_id: selectedRide.product_id,
                            start_latitude: req.body.start_latitude,
                            start_longitude: req.body.start_longitude,
                            end_latitude: selectedRide.end_latitude,
                            end_longitude: selectedRide.end_longitude
                        },
                        auth: {
                            bearer: req.body.accessToken
                        }
                    }).then(function(rideRes){
                        rideRes.friendFullName =  selectedRide.friendFullName;
                        rideRes.name =  selectedRide.name;
                        rideRes.message =  selectedRide.message;

                        return res.json([rideRes]);
                    }).then(function(){

                    }).catch(function(e){
                        console.error(e)
                    });*/

                    res.json({
                        friendFullName: selectedRide.friendFullName,
                        name: selectedRide.name,
                        message: selectedRide.message,
                        "request_id": "852b8fdd-4369-4659-9628-e122662ad257",
                        "status": "processing",
                        "vehicle": "Mercedes 67",
                        "driver": "Mario Luchini",
                        "location": "1567 Broadway, New York, 10036",
                        "eta": 5,
                        "surge_multiplier": null
                    })
                } else {
                    return res.json([]);
                }
            })
        } else {
            res.status(401).send('Unauthorized');
        }
    })
});

module.exports = router;
