(function(w) {
	var storage = JSON.parse(window.localStorage.getItem("balance"));
	var all_result = [];
	
	if (storage !== null) {
		if(!(storage instanceof Array)) {
			all_result[0] = storage;
		} else {
			all_result = storage;
		};		
	};
	
	var balance = {
		wrapper: null,
		cvs: null,
		context: null,
		count: {
			min: 0,
			sec: 10,
			check: null
		},
		result: {
			time: null,
			score: 0
		},
		pos_target: Math.floor(w.innerHeight/2),
		pos_current: Math.floor(w.innerHeight/2),

		initialize: function() {
			this.wrapper = document.getElementById("play");
			this.wrapper.innerHTML = "";

			var new_cvs = document.createElement("canvas");
			new_cvs.setAttribute("id", "canvas");
			this.wrapper.appendChild(new_cvs);
			//this.wrapper.insertBefore(new_cvs, this.wrapper.firstChild);

			this.cvs = document.getElementById("canvas");
			this.context = this.cvs.getContext("2d");

			this.cvs.height = 320;
			this.cvs.width = 480;

			this.count.check = this.startCount();
			
			this.result.score =0;
			
			w.balance.draw(0);

			w.addEventListener("devicemotion", function(e){
				var xg = e.accelerationIncludingGravity.x;  // X方向の傾き
				w.balance.draw(xg);
			}, true);
		},
		draw: function(move/*, target*/) {
			var cvs = this.cvs;
			var context = this.context;

			context.clearRect(0, 0, cvs.width, cvs.height);

			context.fillStyle = "black";
			context.fillRect(0, 0, cvs.width, cvs.height);

			this.pos_current = Math.floor(window.innerHeight/2 + move*30);
			context.fillStyle = "red";
			context.fillRect(0, this.pos_current, cvs.width, 3);

			context.fillStyle = "blue";
			context.fillRect(0, this.pos_target, cvs.width, 3);

			var dif = Math.abs(this.pos_current - this.pos_target);
			if(dif == 0) { 
				this.pos_target = this.new_target(); 
				this.result.score++;
			};
			
			var angle = 90 * Math.PI / 180;
			context.rotate(angle);
			context.font = "18px 'ＭＳ Ｐゴシック'";
			context.fillStyle = "red";
			context.fillText(this.showCount(), 10, -10);
			context.rotate(-angle);

			return this.pos_current;
		}, 
		startCount: function() {
			var countDown = function() {
				w.balance.count.sec -= 1;
				console.log(w.balance.showCount());
				w.balance.count.check();
			};
			var timerID = setInterval(countDown, 1000);
			
			return function() {
				if(w.balance.count.min <= 0 && w.balance.count.sec <= 0) {
					alert("診断終了");
					clearInterval(timerID);
					w.balance.saveResult();
					w.View.move(3);
					w.balance.destroy();
				};
			}			
		},
		showCount: function() {
			var limit = "";
			if(this.count.min < 10) {
				limit += "0" + this.count.min;
			} else {
				limit += this.count.min;
			};
			limit += ":"
			if(this.count.sec < 10) {
				limit += "0" + this.count.sec;
			} else {
				limit += this.count.sec;
			}
			
			return limit;
		},
		saveResult: function() {
			var d = new Date();
			this.result.time = util.translate(d);
			w.all_result[w.all_result.length] = this.result;
/*初期化*/	//w.all_result = [];
			window.localStorage.setItem("balance", JSON.stringify(w.all_result));
		},
		new_target: function() {
			var posy = Math.floor(Math.random() * (window.innerHeight - 20));
			return posy;
		},
		destroy: function() {
			this.wrapper.removeChild(this.cvs);
			this.cvs = null;
			this.context = null;
			//w.removeEventListener();
		}
	};

	w.balance = balance;
	w.all_result = all_result;

})(window);