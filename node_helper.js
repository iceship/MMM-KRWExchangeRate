const NodeHelper = require("node_helper");
const fs = require('fs')
const path = require('path')
const request = require('request');

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node helper: " + this.name);
    },

    socketNotificationReceived: function (notification, payload) {
        switch (notification) {
            case "GET_RATE_DATA":
                let self = this;
                self.getData(payload);
                break;
        }
    },

    getData: async function (payload) {
        let self = this;
        var queryParams = '?' + encodeURIComponent('authkey') + '=' + payload.config.authKey; /* Auth Key*/
        //queryParams += '&' + encodeURIComponent('searchdate') + '=' + encodeURIComponent("20220128"); /* */
        queryParams += '&' + encodeURIComponent('data') + '=AP01'
        var url = payload.config.apiBase + queryParams;
        request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (! error & response.statusCode == 200) {
                var data = JSON.parse(body);
                units = data.filter(x => payload.config.units.includes(x.cur_unit));
                if (units.length > 0) { 
                    var fpath = path.resolve(__dirname, "cache")
                    fs.writeFile(fpath + "/rateListCache.json", JSON.stringify(units), (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            //console.log('rate list cache saved')
                        }
                    });
                    self.sendSocketNotification("RATE_DATA", units);
                } else {
                    //try to load from cache
                    var fpath = path.resolve(__dirname, "cache")
                    fs.readFile(fpath +"/rateListCache.json", 'utf-8', (err,data) => {
                        if (err) { console.log('unable to load cache', err) }
                        else {
                          units = JSON.parse(data.toString())
                          //console.log("successfully loaded cache of ", units.length, " rates")
                          self.sendSocketNotification("RATE_DATA", units);
                        }
                    })
                    //self.sendSocketNotification("RATE_DATA_ERROR", data);
                }
            }
        });
    }
});
