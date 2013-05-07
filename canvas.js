(function(w) {


	/**
	* 記録の管理を行うオブジェクト
	* all         : これまでの記録を保持する配列
	* getStorage  : localStorageからこれまでの記録を取得する
	* addStorage  : localStorageに新しい記録を追加する
	*               @param obj 新しい記録
	* reset       : これまでの記録をすべて消去する
	*/
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

		addStorage: function(obj) {
			this.all[this.all.length] = obj;
			window.localStorage.setItem("balance", JSON.stringify(this.all));
		},

		reset: function() {
			this.all = [];
			window.localStorage.clear();
		}
	};

	/**
	* 診断画面のオブジェクト
	* cvs        : Canvas
	* ctx        : CanvasのContext
	* plaing     : 診断開始状態の真偽値
	* active     : 画面表示状態の真偽値
	* timer      : 残り時間を管理するTimerオブジェクト
	* result     : スコア及び診断時間
	* move       : ジャイロセンサーの傾き
	* current    : 現在のユーザーの位置
	* target     : 現在のアメーバの位置
	* level      : 現在の難易度
	* imgs       : 画面描画時に使用する画像のスプライトシート
	* initialize : 診断画面の初期化を行う
	               return Canvasタグ
	* draw       : 画面の描画を行う
	* start      : 診断を開始する
	* update     : 画面の更新、終了時間の確認を行う
	* stop       : 診断の一時停止を行う
	* restart    : 一時停止状態からの復帰
	* destroy    : 診断終了時の処理
	* preload    : 画像のプリロードを行う
	*/
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
		move: {
			xg: 0,
			yg: 0	
		},
		current: {
			x: 0,
			y: 0
		},
		target: {
			x: window.innerHeight/2,
			y: window.innerWidth/2,
			size: 0
		},
		level: 0,
		imgs: new Image(),

		initialize: function() {

			//診断画面の状態を変更
			this.playing = true;
			this.active = true;
			
			//Canvasの初期化
			var new_cvs = document.createElement("canvas");
			new_cvs.setAttribute("id", "canvas");				/* position: absolute; z-index: 10; を指定 */
			this.cvs = new_cvs;
			this.ctx = this.cvs.getContext("2d");
			this.cvs.height = 320;
			this.cvs.width = 480;
			
			//アメーバの大きさ設定する
			this.level = 0;
			this.target.size =  150 - (Math.floor(Math.random() * 10) * this.level);
			this.target.x = Math.floor(Math.random() * (window.innerHeight - this.target.size) + this.target.size/2);
			this.target.y = Math.floor(Math.random() * (window.innerWidth - this.target.size) + this.target.size/2);
			
			//スコアの初期化
			this.result.score =0;

			//画像が既に読み込まれている場合
			if (this.imgs.complete) {

				this.start();

			//画像が読み込まれていない場合
			} else {
				this.imgs.src = "./images/tiny_draw.png";
				
				this.imgs.addEventListener("load", function() {
					$b.start();
				}, false);	
			}

			return new_cvs;
		},

		draw: function() {
			var cvs = $b.cvs,
				ctx = $b.ctx,
				move = $b.move,
				current = $b.current,
				target = $b.target,
				imgs = $b.imgs,
				size = $b.target.size;

			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, cvs.width, cvs.height);

			//現在のユーザー位置を算出
			current.x = Math.floor(window.innerHeight/2 + move.xg * 35);
			current.y = Math.floor(window.innerWidth/2 + move.yg * 60) + 15;
			
			ctx.drawImage(imgs, 0, 0, 400, 400, target.y-Math.floor(size/2), target.x-Math.floor(size/2), size, size);
			ctx.drawImage(imgs, 400, 0, 400, 400, current.y-45, current.x-30, 80, 80);

			var dif = {};
			dif.x = Math.abs(current.x - target.x);
			dif.y = Math.abs(current.y - target.y);
			
			//衝突判定
			if(dif.x <= Math.floor(size/7) && dif.y <= Math.floor(size/7)) {

				//難易度を一つ上げる
				if($b.level < 15) { $b.level++; }

				//次のアメーバを設定
				$b.target.size = 150 - ((Math.floor(Math.random() * 2) + 7) * $b.level);
				$b.target.x = Math.floor(Math.random() * (window.innerHeight - $b.target.size) + $b.target.size/2);
				$b.target.y = Math.floor(Math.random() * (window.innerWidth - $b.target.size) + $b.target.size/2);

				//スコアを加算する
				$b.result.score += $b.level * 10;
			};
			
			//タイムカウントの表示
			var angle = 90 * Math.PI / 180;
			ctx.rotate(angle);
			ctx.font = "18px 'ＭＳ Ｐゴシック'";
			ctx.fillStyle = "red";
			ctx.fillText($b.timer.show(), 10, -10);
			ctx.rotate(-angle);

			return current;
		},

		start: function() {
			
			//タイマーをセットする
			$b.timer = new Timer(0, 30, $b.update);

			//センサー反応時のイベントをセットする
			w.addEventListener("devicemotion", gravity_detection, true);
			//$b.draw();
		},

		update: function() {
			$b.draw();
			if ($b.timer.check()) {
				alert("診断終了");

				//診断時刻を記録
				var d = new Date();
				$b.result.time = util.translate(d);
				
				//イベントを発火しページ管理オブジェクトに通知
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
			w.removeEventListener("devicemotion", gravity_detection, true);
		},

		preload: function() {
			this.imgs.src = "./images/tiny_draw.png";
		}
	};
	
	function gravity_detection(e) {
		var xg = e.accelerationIncludingGravity.x;  // X方向の傾き
		var yg = e.accelerationIncludingGravity.y;  // Y方向の傾き
		
		$b.move.xg = xg;
		$b.move.yg = yg;
		
		//センサー反応時に状態を更新する
		$b.update();		
	}

	$b.preload();
	w.$b = $b;
	$s.getStorage();
	w.$s = $s;

})(window);