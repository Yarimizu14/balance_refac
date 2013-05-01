(function(w) {
	
	var $s = {
		all: [],
		getStorage: function() {
			var storage = JSON.parse(window.localStorage.getItem("balance"));
			if (storage !== null) {
				if(!(storage instanceof Array)) {
					$s.all[0] = storage;
				} else {
					$s.all = storage;
				};		
			};			
		},
		addStorage: function() {
			
		}
	};

	var $b = {
		wrapper: null,
		cvs: null,
		ctx: null,
		timer: null,
		result: {
			time: null,
			score: 0
		},
		//gravity detection
		move: {
			xg: 0,
			yg: 0	
		},
		pos_target: Math.floor(w.innerHeight/2),
		pos_current: Math.floor(w.innerHeight/2),

		initialize: function() {
			this.wrapper = document.getElementById("play");
			this.wrapper.innerHTML = "";

			var new_cvs = document.createElement("canvas");
			new_cvs.setAttribute("id", "canvas");

			this.cvs = new_cvs;
			this.wrapper.appendChild(new_cvs);
			this.ctx = this.cvs.getContext("2d");

			this.cvs.height = 320;
			this.cvs.width = 480;

			this.timer = new Timer(0, 10, this.draw);
			
			this.result.score =0;
			
			this.draw(0);

			w.addEventListener("devicemotion", function(e){
				var xg = e.accelerationIncludingGravity.x;  // X方向の傾き
				var yg = e.accelerationIncludingGravity.y;  // Y方向の傾き
				
				$b.move.xg = xg;
				$b.move.yg = yg;
				
			}, true);
		},
		draw: function() {
			var cvs = $b.cvs,
				ctx = $b.ctx,
				move = $b.move,
				pos_current = $b.pos_current,
				pos_target = $b.pos_target;

			ctx.clearRect(0, 0, cvs.width, cvs.height);

			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, cvs.width, cvs.height);

			pos_current = Math.floor(window.innerHeight/2 + move.xg * 30);
			ctx.fillStyle = "red";
			ctx.fillRect(0, pos_current, cvs.width, 3);

			ctx.fillStyle = "blue";
			ctx.fillRect(0, pos_target, cvs.width, 3);

			var dif = Math.abs(pos_current - pos_target);
			if(dif == 0) { 
				pos_target = Math.floor(Math.random() * (window.innerHeight - 20)); 
				$b.result.score++;
			};
			
			var angle = 90 * Math.PI / 180;
			ctx.rotate(angle);
			ctx.font = "18px 'ＭＳ Ｐゴシック'";
			ctx.fillStyle = "red";
			ctx.fillText($b.timer.show(), 10, -10);
			ctx.rotate(-angle);

			return pos_current;
		}, 
		saveResult: function() {
/*
			var d = new Date();
			this.result.time = util.translate(d);
			w.all_result[w.all_result.length] = this.result;
*/
/*初期化*/	//w.all_result = [];
//			window.localStorage.setItem("$b", JSON.stringify(w.all_result));

		},
		destroy: function() {
			this.wrapper.removeChild(this.cvs);
			this.cvs = null;
			this.ctx = null;
			//w.removeEventListener();
		}
	};

	w.$b = $b;
	w.$s = $s;

})(window);