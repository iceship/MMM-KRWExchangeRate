/* Magic Mirror
 * Module: KRW Exchange Rate
 *
 * By Juil Kim
 * MIT Licensed.
 */
Module.register("MMM-KRWExchangeRate", {
    requiresVersion: "2.12.0",
    default: {
        apiBase: "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON",
        authkey: "",
        units: ["AUD", "JPY(100)", "USD"],
        updateInterval: 1000 * 60 * 60, // refresh every 60 minutes
    },

    getStyles: function() {
        return ["MMM-KRWExchangeRate.css"]
    },

    getHeader: function() {
        return "<i class='fa fa-fw fa-won-sign'></i> 환율 정보";
    },

    start: function() {
        Log.info("Starting module: " + this.name);
        this.rateInfo = [];
        var self = this
        this.loaded = false;
    },

	getDom: function() {
		var wrapper = document.createElement("div");

        if (!this.loaded) {
            //wrapper.innerHTML = "Loading rate info...";
            return wrapper;
        }
        var rateTable = document.createElement("table");
        rateTable.className = "small";

        if(this.rateInfo.length > 0) {
            for(var t in this.rateInfo) {
                var rate = this.rateInfo[t];

                var row = document.createElement("tr");
                row.className = "title";
                rateTable.appendChild(row);

                var cur_nm = document.createElement("td");
                cur_nm.innerHTML = rate.cur_unit;
                row.appendChild(cur_nm);

                var deal_bas_r = document.createElement("td");
                deal_bas_r.className = "rate";
                deal_bas_r.innerHTML = rate.deal_bas_r;
                row.appendChild(deal_bas_r);
            }
        }
        wrapper.appendChild(rateTable);
		return wrapper;
	},

    getRateInfo: function() {
        //Log.info("Requesting rate info");
        this.sendSocketNotification("GET_RATE_DATA",
            {
                "config": this.config,
                "identifier": this.identifier
            }
        )
    },

	notificationReceived: function(notification, payload, sender){
        switch (notification) {
            case "DOM_OBJECTS_CREATED":
                this.getRateInfo();
                var timer = setInterval(() => {
                        this.getRateInfo();
                }, this.config.updateInterval);
                break;
        }
	},

    socketNotificationReceived: function (notification, payload) {
        switch (notification) {
            case "RATE_DATA":
                this.loaded = true;
                this.rateInfo = payload;
                this.updateDom();
                break;
            case "RATE_DATA_ERROR":
                this.updateDom();
                break;
        }
    }    
})
