(function(w) {
	
	var View =  {
		pages: [],						//各ページを格納する配列
		page_current: 0,
		playing: false,					//診断を実行中かどうか
		screen: {
			"direction": window.orientation,  　//iPhoneの方向
			"width": window.innerWidth, 　//iPhoneの画面幅
			"height": window.innerHeight　//iPhoneの画面高
		},
		//ページ遷移
		move: function(next) {
			this.pages[this.page_current].tag.style.display = "none";
			this.pages[next].tag.style.display = "block";
			setTimeout(function() { window.scrollTo(0, 1); }, 100);

			var text = "この端末の横幅は" + window.innerWidth + "pxです。";
			text += "この端末の縦幅は" + window.innerHeight + "pxです。";

			if(this.page_current === 2) {  View.startGame(); }

			this.page_current = next;
		},
		history_push: function(next) {
			var d = new Date();
			history.pushState(
				{ "type": "push", "date": d, "page_num": next }, // 次のページ描画に必要な情報
				'title : ' + d.getTime(), // タイトル（動かない）
				'/balance/page' + next// URL（必須）
			);
			console.log("pushed :" + next);
		},
		history_replace: function(next) {
			var d = new Date();
			history.replaceState(
				{ "type": "push", "date": d, "page_num": next }, // 次のページ描画に必要な情報
				'title : ' + d.getTime(), // タイトル（動かない）
				'/balance/page' + next// URL（必須）
			);
			console.log("replaced :" + next);
		},
		//ページをスキップして遷移遷移
		skip: function() {

		},
		//iPhoneが回転した場合
		startGame: function() {
			//プレイ画面で画面を傾けるとCanvasをイニシャライズ
			if (View.page_current === 2 && window.innerWidth === 480 && window.orientation < 0) {
				alert("canvasを描画します");
				this.playing = true;

				w.balance.initialize();
			} else if (this.playing){
				alert("プレイを終了します。");
				this.playing = false;
				w.balance.destroy();
			};
			//View.pages[View.page_current].show();
		},
		//初期化、イベントのセット
		initialize: function() {
			this.page_current = 0;
			var article = w.document.getElementsByTagName("article");

			for(var i=0; i < article.length; i++) {
				//考え直す必要あり、articleを入れるかpage(article[i], i)を入れるか？
				this.pages[i] = new page(article[i], i);
			};
			console.log("tag検知終了");
			console.log(this.pages);

			window.addEventListener("orientationchange", function(e) {
			//window.addEventListener("click", function(e) {
				View.startGame();
			}, false);

			window.addEventListener("devicemotion", function(e) {
			}, false);

			window.addEventListener("popstate", function(e) {
				console.log("/*********pop**********/");
				console.log(window.history);
				console.log("Eventの現在のstateは ");
				console.log(e.state);
				console.log("Historyの現在のstateは ");
				console.log(window.history.state);
				console.log("/**********************/");

				//if(window.history.state !== null && window.history.state.page_num !== 0) {
				if(e.state !== null) {
					console.log("moved");
					w.View.move(e.state.page_num);
				} else {
					w.View.move(0);
				}
			}, false);
			
			var links = w.document.getElementsByTagName("a");
			//すべてのページタグにイベントを設定：data-link属性で指定されたリンクに移動
			for(var i=0; i < links.length; i++) {
				links[i].addEventListener("touchstart", function(e) {
					w.View.move(parseInt(e.target.getAttribute("data-link")));
					w.View.history_push(e.target.getAttribute("data-link"));
				}, false);
			};

			var flickHandler = getFlickHandler();
			document.getElementById("flick-to-history").addEventListener("touchmove", flickHandler, false);
			document.getElementById("flick-to-history").addEventListener("touchstart", flickHandler, false);
			document.getElementById("flick-to-history").addEventListener("touchend", flickHandler, false);
			document.getElementById("score").addEventListener("webkitTransitionEnd", function(e) {
			
				if(parseInt(e.target.getAttribute("data-layer")) === 1) { 
					e.target.style.top = 0 + "px";
					e.target.style.zIndex = 1;
					document.getElementById("history").style.zIndex = 2;
					document.getElementById("history").setAttribute("data-layer", "2");
				}

			}, false);

			document.getElementById("flick-to-result").addEventListener("touchmove", flickHandler, false);
			document.getElementById("flick-to-result").addEventListener("touchstart", flickHandler, false);
			document.getElementById("flick-to-result").addEventListener("touchend", flickHandler, false);
			document.getElementById("history").addEventListener("webkitTransitionEnd", function(e) {

				if(parseInt(e.target.getAttribute("data-layer")) === 1) {
					e.target.style.top = 0 + "px";
					e.target.style.zIndex = 1;
					document.getElementById("score").style.zIndex = 2;
					document.getElementById("score").setAttribute("data-layer", "2");
				}

			}, false);
		},
	};

	function getFlickHandler() {
		var startY = 0;
		var diffY = 0;
		var sTime = 0;

		return function(e) {
			e.preventDefault();
			var touch = e.touches[0];
			if (e.type == "touchstart") {
				startY = touch.pageY;
				sTime = (new Date()).getTime();
			}

			else if (e.type == "touchmove") {
				diffY = touch.pageY - startY;
				e.target.parentNode.setAttribute("class", "moving_touch");
				e.target.parentNode.style.top = diffY + "px";
			}

			else if (e.type == "touchend") {
				var t = (new Date()).getTime() - sTime;
				if (Math.abs(diffY) > 260 || (t < 300 && Math.abs(diffY) > 80)) {

					e.target.parentNode.setAttribute("class", "moving_release");
					e.target.parentNode.style.top = - window.innerHeight + "px";
					e.target.parentNode.setAttribute("data-layer", "1");
				} else {
					e.target.parentNode.setAttribute("class", "moving_release");
					e.target.parentNode.style.top = 0 + "px";
					e.target.parentNode.setAttribute("data-layer", "2");
				}
				startY = 0;
			}
		}
	}

	function page(tag, num) {
		this.page_num = num;
		this.tag = tag;
		this.visible = false;
	};

	w.View = View;

})(window);