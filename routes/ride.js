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


/* get a user rides */
router.post('/ridesEstimates', function(req, res) {

    var estimates = [];

    for (var i = 0; i < req.json.location_list.length ; i++){
        estimates.push(req.get({
            url: uberAPI + 'estimates/price',
            qs: {
                start_latitude: req.json.start_latitude,
                start_longitude: req.json.start_longitude,
                end_latitude: req.json.location_list[i].end_latitude,
                end_longitude: req.json.location_list[i].end_longitude
            }
        }))
    }

    return Promise.settle(estimates).then(function(results){

        return _.reduce(results, function(acc, res){
            if (res.isFulfilled()){
                acc.push(res.value());
            } else {
                console.error('An estimate request was rejected, ', req.json.location_list[i].name)
            }
        }, []);
    }).then(function(estimates){

    })
});

module.exports = router;
