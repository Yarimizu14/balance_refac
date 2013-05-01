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
			this.pages[next].initialize();

			this.page_current = next;
			setTimeout(function() { window.scrollTo(0, 1); }, 100);
		},
		history_push: function(next) {
			history.pushState({ "page_num": next }, null, '/balance/page' + next);
		},
		history_replace: function(next) {
			history.replaceState({ "page_num": next }, null, '/balance/page' + next);
		},
		skip: function() {

		},
		//初期化、イベントのセット
		initialize: function() {
			this.page_current = 0;

			var article = w.document.getElementsByTagName("article");
			for(var i=0; i < article.length; i++) {
				//考え直す必要あり、articleを入れるかpage(article[i], i)を入れるか？
				this.pages[i] = new page(article[i], i);
			};

			window.addEventListener("orientationchange", startGame, false);
			window.addEventListener("popstate", popstateHandler, false);

			var links = w.document.getElementsByTagName("a");
			for(var i=0; i < links.length; i++) {
				links[i].addEventListener("touchstart", linkHandler, false);  			//すべてのページタグにイベントを設定：data-link属性で指定されたリンクに移動	
			}

			var flickHandler = getFlickHandler();
			document.getElementById("flick-to-history").addEventListener("touchmove", flickHandler, false);
			document.getElementById("flick-to-history").addEventListener("touchstart", flickHandler, false);
			document.getElementById("flick-to-history").addEventListener("touchend", flickHandler, false);
			document.getElementById("score").addEventListener("webkitTransitionEnd", layerHandler , false);

			document.getElementById("flick-to-result").addEventListener("touchmove", flickHandler, false);
			document.getElementById("flick-to-result").addEventListener("touchstart", flickHandler, false);
			document.getElementById("flick-to-result").addEventListener("touchend", flickHandler, false);
			document.getElementById("history").addEventListener("webkitTransitionEnd", layerHandler, false);
		},
	};

	function startGame() {
		//プレイ画面で画面を傾けるとCanvasをイニシャライズ
		if (View.page_current === 2 && window.innerWidth === 480 && window.orientation < 0) {
			alert("canvasを描画します");
			this.playing = true;

			//w.balance.initialize();
			$b.initialize();
		} else if (this.playing){
			alert("向きが正常ではありません。プレイを終了します。");
			this.playing = false;
			/*「右に傾けてください」とアラートを出すdivをアペンドする。*/
			
			//w.balance.destroy();
			$b.destroy();
		};
	}

	function linkHandler(e) {
		View.move(parseInt(e.target.getAttribute("data-link")));
		View.history_push(e.target.getAttribute("data-link"));
	}

	function popstateHandler(e) {
		(e.state !== null) ? View.move(e.state.page_num) : View.move(0);
	}

	function layerHandler(e) {
		var section = e.target.id;
		var target = (section === "history") ? "score" : "history";

		if(parseInt(e.target.getAttribute("data-layer")) === 1) {
			e.target.style.top = 0 + "px";
			e.target.style.zIndex = 1;
			document.getElementById(target).style.zIndex = 2;
			document.getElementById(target).setAttribute("data-layer", "2");
		}		
	}

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

	page.prototype = {
		initialize: function() {
			switch(this.page_num) {
				case 2:
					startGame();
/*PCデバッグ用*/ 		$b.initialize();
					console.log("3番目のページがロードされました。");
					break;
				case 3:
					var out = document.getElementById("out");
					var history_list = document.getElementById("history_list");
					
					out.innerHTML = "スコア : " + $b.result.score;
					
					for(var i=0; i < $s.all.length && i < 5; i++) {
						var liTag = document.createElement("li");
						var pScoreTag = document.createElement("p");
						var pTimeTag = document.createElement("p");
						
						pScoreTag.innerHTML = $s.all[i].score + " pt";
						pScoreTag.className = "record_score";
						pTimeTag.innerHTML = $s.all[i].time;
						pTimeTag.className = "record_time";	
						
						liTag.appendChild(pScoreTag);
						liTag.appendChild(pTimeTag);
						history_list.appendChild(liTag);
					};
					console.log("4番目のページがロードされました。");
					break;
				default:
					break;
			};
		}
	}

	w.View = View;
	w.page = page;

})(window);