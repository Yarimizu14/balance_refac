(function(w) {

	/**
	* Util
	* translate   : 日時を日本語に変換する
	*               @params d Dateオブジェクト
	*/
	var util = {

		translate: function(d) {

			//一桁の数値を二文字にする
			var adjust = function(num) {
				var str = "";
				if(parseInt(num) < 10) {
					str += "0" + num;
				} else {
					str += num;					
				}
				return str;
			}
		
			//日時を取得し文字列に追加
			var now = "";
			now += adjust(d.getMonth() + 1) + "月";
			now += adjust(d.getDate()) + "日";
			now += adjust(d.getHours()) + "時";
			now += adjust(d.getMinutes()) + "分";
			
			return now;
		}
	};
	
	/**
	* タイマー機能を持つオブジェクト
	* min   : 残り分数
	* sec   : 残り秒数
	* //func
	* start : カウントを開始する
	* stop  : カウントを停止する
	* count : 残り時間を減らす
	* reset : 残り時間をリセットする
	* check : 終了判定を行い真偽値を返す
	* show  : 残り時間を文字列として返す
	*/
	function Timer(min, sec, func){
		this.min = min;
		this.sec = sec;
		this.func = func;
		this.timerID = null;
		
		this.start();
	}

	Timer.prototype = {

		start: function() {
			var self = this;
			this.timerID = setInterval(function(){
				self.count();
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

			this.check();
		},

		reset: function() {
			this.min = 0;
			this.sec = 0;
		},

		check: function() {
			if (this.min <= 0 && this.sec <= 0) {
				//this.stop();
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