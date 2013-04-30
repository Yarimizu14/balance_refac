(function(w) {
	
	var balance = {
		wrapper: null,
		cvs: null,
		context: null,
		count: 0,
		timer: null,
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

			this.count = 0;
			this.timer = setInterval(this.countDown, 1000, this);

			w.addEventListener("devicemotion", function(e){
				var xg = e.accelerationIncludingGravity.x;  // X方向の傾き
				w.balance.draw(xg);
				//this.draw(xg/*, target*/);
				if(w.balance.count === 10) {
					clearInterval(w.balance.timer);
					w.balance.count++;
					alert("診断終了");
					w.View.move(3);
					w.balance.destroy();
				}
			}, true);
		},
		countDown: function(p) {
			p.count++;
			console.log(p.count);
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
			if(dif == 0) { this.pos_target = this.new_target(); }

			return this.pos_current;
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