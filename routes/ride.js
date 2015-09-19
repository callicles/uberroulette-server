/**
 * Created by nicolas on 9/19/15.
 */
var express = require('express');
var request = require('request-promise');
var Promise = require('bluebird');
var _ = require('lodash');
var router = express.Router();

var uberAPI = 'https://api.uber.com/v1/';
if (process.env.DEBUG){
    uberAPI = 'https://sandbox-api.uber.com/v1/'
}

console.log(" Using the Uber API: ", uberAPI);

// Minimum ride length
var MIN_RIDE_LENGTH = 1;


/* get a user rides */
router.post('/', function(req, res) {

    var
        estimates = [];

    for (var i = 0; i < req.json.location_list.length ; i++){
        estimates.push(req.get({
            url: uberAPI + 'estimates/price',
            qs: {
                start_latitude: req.body.start_latitude,
                start_longitude: req.body.start_longitude,
                end_latitude: req.body.location_list[i].end_latitude,
                end_longitude: req.body.location_list[i].end_longitude
            },
            auth: {
                bearer: req.body.accessToken
            }
        }))
    }

    return Promise.settle(estimates).then(function(results){

        return _(results)
            .filter(function(res){

                var rideEstimate = {};

                if (!res.isFulfilled()){
                    console.error('An estimate request was rejected, ', req.json.location_list[i].name)
                } else {
                    rideEstimate = res.value();
                    rideEstimate.friendFullName =  req.json.location_list[i].friendFullName;
                    rideEstimate.name =  req.json.location_list[i].name;
                    rideEstimate.message =  req.json.location_list[i].message;
                    rideEstimate.end_latitude =  req.json.location_list[i].end_latitude;
                    rideEstimate.end_longitude =  req.json.location_list[i].end_longitude;
                }

                return res.isFulfilled() &&
                    _.includes(rideEstimate.prices, function(price){
                        return price.high_estimate <= req.body.max_dollar
                    }) &&
                    rideEstimate.prices[0].distance >= MIN_RIDE_LENGTH &&
                    rideEstimate.prices[0].distance <= req.body.max_radius

            })
            .sample(1)
            .min('high_estimate')
    }).then(function(selectedRide){
        if (!_.isEmpty(selectedRide)){
            return req.post({
                url: uberAPI + '/requests',
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

            });
        } else {
            return res.json([]);
        }
    })
});

module.exports = router;
