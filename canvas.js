(function(w) {
	
	var balance = {
		wrapper: null,
		cvs: null,
		context: null,
		count: {
			min: 0,
			sec: 10,
			check: null
		},
		pos_target: Math.floor(w.innerHeight/2),
		pos_current: Math.floor(w.innerHeight/2),

		initialize: function() {
			this.wrapper = document.getElementById("play");

			var new_cvs = document.createElement("canvas");
			new_cvs.setAttribute("id", "canvas");
			this.wrapper.insertBefore(new_cvs, this.wrapper.firstChild);

			this.cvs = document.getElementById("canvas");
			this.context = this.cvs.getContext("2d");

			this.cvs.height = 320;
			this.cvs.width = 480;

			this.count.check = this.startCount();
			w.balance.draw(0);

			w.addEventListener("devicemotion", function(e){
				var xg = e.accelerationIncludingGravity.x;  // X方向の傾き
				w.balance.draw(xg);
				//this.draw(xg/*, target*/);
				/*
				if(w.balance.count === 10) {
					clearInterval(w.balance.timer);
					w.balance.count++;
					alert("診断終了");
					w.View.move(3);
					w.balance.destroy();
				}
				*/
			}, true);
		},
		draw: function(move/*, target*/) {
			var cvs = this.cvs;
			var context = this.context;

			context.clearRect(0, 0, cvs.width, cvs.height);

			context.fillStyle = "black";
			context.fillRect(0, 0, cvs.width, cvs.height);

			/*
			context.fillStyle = "black";
			context.fillRect(0, current_pos, cvs.width, 3);
			*/

			this.pos_current = Math.floor(window.innerHeight/2 + move*30);
			context.fillStyle = "red";
			context.fillRect(0, this.pos_current, cvs.width, 3);

			context.fillStyle = "blue";
			context.fillRect(0, this.pos_target, cvs.width, 3);

			var dif = Math.abs(this.pos_current - this.pos_target);
			if(dif == 0) { this.pos_target = this.new_target(); };
			
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
				w.balance.count.check();
			};
			var timerID = setInterval(countDown, 1000);
			
			return function() {
				if(w.balance.count.min <= 0 && w.balance.count.sec < 0) {
					alert("診断終了");
					clearInterval(timerID);
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

})(window);