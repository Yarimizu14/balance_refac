(function(w) {
	
	var $s = {
		all: [{time: "sample", score: 5}, {time: "sample2", score: 4}, {time: "sample3", score: 6}, {time: "sample4", score: 7}, {time: "sample5", score: 3}],
		//all: [],
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
		addStorage: function(obj) {
			this.all[this.all.length] = obj;
			window.localStorage.setItem("balance", JSON.stringify(this.all));
		},
		reset: function() {
			this.all = [];
			window.localStorage.setItem("balance", "");			
		}
	};

	var $b = {
		cvs: null,
		ctx: null,
		playing: false,
		active: false,
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
			this.playing = true;
			this.active = true;
			
			var new_cvs = document.createElement("canvas");
			new_cvs.setAttribute("id", "canvas");				/* position: absolute; z-index: 10; を指定 */

			this.cvs = new_cvs;
			this.ctx = this.cvs.getContext("2d");

			this.cvs.height = 320;
			this.cvs.width = 480;

			this.timer = new Timer(0, 10, this.update);
			
			this.result.score =0;
			
/*デバッグ用*/	this.draw(0);

			w.addEventListener("devicemotion", gravity_detection, true);

			return new_cvs;
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
				$b.pos_target = Math.floor(Math.random() * (window.innerHeight - 20)); 
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
		update: function() {
			$b.draw();
			if ($b.timer.check()) {
				alert("診断終了");
				var d = new Date();
				$b.result.time = util.translate(d);
				
				var customEvent = document.createEvent("HTMLEvents");
				customEvent.initEvent("custom_event", true, false);
				window.dispatchEvent(customEvent);
			}
		},
		stop: function() {
			this.timer.stop();
			this.active = false;
			w.removeEventListener("devicemotion", gravity_detection, true);
			this.cvs.style.display = "none";
		},
		restart: function() {
			this.timer.start();
			this.active = true;
			w.addEventListener("devicemotion", gravity_detection, true);
			this.cvs.style.display = "block";
		},
		destroy: function() {
			this.playing = false;
			this.active = false;
			this.cvs.parentNode.removeChild(this.cvs);
			this.cvs = null;
			this.ctx = null;
			w.addEventListener("devicemotion", gravity_detection, true);
		}
	};
	
	function gravity_detection(e) {
		var xg = e.accelerationIncludingGravity.x;  // X方向の傾き
		var yg = e.accelerationIncludingGravity.y;  // Y方向の傾き
		
		$b.move.xg = xg;
		$b.move.yg = yg;
		
		$b.update();		
	}

	w.$b = $b;
	$s.getStorage();
	w.$s = $s;

})(window);