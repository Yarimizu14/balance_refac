(function(w) {
	var util = {
		translate: function(d) {
			var adjust = function(num) {
				var str = "";
				if(parseInt(num) < 10) {
					str += "0" + num;
				} else {
					str += num;					
				}
				return str;
			}
		
			var now = "";
			/*
			now += "西暦" + d.getFullYear() + "年";
			*/
			now += adjust(d.getMonth() + 1) + "月";
			now += adjust(d.getDate()) + "日";
			
			/*
			var y = d.getDay();
			if (y == 6) {
				now +=  "土曜日" + "　";
			}else if (y == 5) {
				now +=  "金曜日" + "　";
			} else if (y == 4) {
				now +=  "木曜日" + "　";
			} else if (y == 3) {
				now +=  "水曜日" + "　";
			} else if (y == 2) {
				now +=  "火曜日" + "　";
			} else if (y == 1) {
				now +=  "月曜日" + "　";
			} else if (y == 0) {
				now +=  "日曜日" + "　";	
			};
			*/
			now += adjust(d.getHours()) + "時";
			now += adjust(d.getMinutes()) + "分";
			/*
			now += adjust(d.getSeconds()) + "秒";
			*/
			
			return now;
		}
	};
	
	function Timer(min, sec, func){
		this.min = min;
		this.sec = sec;
		this.func = func;
		this.timerID = null;
		
		this.start();
	}

	Timer.prototype = {
		start: function() {
			var self = this; /* 一旦、selfを介することで出来る */
			this.timerID = setInterval(function(){
				self.count();
				console.log(self.show());
			}, 1000);
		},
		stop: function() {
			clearInterval(this.timerID);
		},
		count: function() {
			this.sec -= 1;
			if (this.sec <= 0 && this.min >= 1) {
				this.sec = 60;
				this.min--;
			};

			//this.func();
			this.check();
		},
		reset: function() {
			this.min = 0;
			this.sec = 0;
		},
		check: function() {
			if (this.min <= 0 && this.sec <= 0) {
				clearInterval(this.timerID);
				return true;
			} else {
				return false;	
			};
		},
		show: function() {
			var clock = "";
			if(this.min < 10) {
				clock += "0" + this.min;
			} else {
				clock += this.min;
			};
			clock += ":"
			if(this.sec < 10) {
				clock += "0" + this.sec;
			} else {
				clock += this.sec;
			}
			
			return clock;			
		}
	};
	
	w.util = util;
	w.Timer = Timer;

})(window);