(function(w) {
	var util = {
		translate: function(d) {
			var now = "";
			now += "西暦" + d.getFullYear() + "年";
			now += d.getMonth() + 1 + "月";
			now += d.getDate() + "日";
			
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
			
			now += d.getHours() + "時";
			now += d.getMinutes() + "分";
			now += d.getSeconds() + "秒";
			
			return now;
		}
	};
	
	w.util = util;

})(window);