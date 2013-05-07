(function(w) {
	
	var $v =  {
		pages: [],						//各ページを格納する配列
		page_current: 0,
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
			setTimeout(function() { window.scrollTo(0, 1); }, 100);

			this.page_current = next;
		},
		controlHistory: function(next) {
			if (this.page_current === 2) {
				console.log("replace");
				//history.replaceState({ "page_num": next }, null, '/balance/page' + next);
				history.replaceState({ "page_num": next }, null, '/balance/');
			} else {
				console.log("pushed");
				//history.pushState({ "page_num": next }, null, '/balance/page' + next);
				history.pushState({ "page_num": next }, null, '/balance/');
			}
		},
		//初期化、イベントのセット
		initialize: function() {
			this.page_current = 0;

			var article = w.document.getElementsByTagName("article");
			for(var i=0; i < article.length; i++) {
				this.pages[i] = new page(article[i], i);								//考え直す必要あり、articleを入れるかpage(article[i], i)を入れるか？
			};

			window.addEventListener("orientationchange", startGame, false);
			window.addEventListener("popstate", popstateHandler, false);

			var links = w.document.getElementsByTagName("a");
			for(var i=0; i < links.length; i++) {
				links[i].addEventListener("touchstart", linkHandler, false);  			//すべてのページタグにイベントを設定：data-link属性で指定されたリンクに移動	
			}
/*
			var links2 = w.document.getElementsByTagName("section");
			for(var i=0; i < links2.length; i++) {
				links2[i].addEventListener("touchstart", function() {
					console.log("test");
				}, false);  			//すべてのページタグにイベントを設定：data-link属性で指定されたリンクに移動	
			}
*/
			var flickHandler = getFlickHandler();
			document.getElementById("flick-to-history").addEventListener("touchmove", flickHandler, false);
			document.getElementById("flick-to-history").addEventListener("touchstart", flickHandler, false);
			document.getElementById("flick-to-history").addEventListener("touchend", flickHandler, false);
			document.getElementById("score").addEventListener("webkitTransitionEnd", layerHandler , false);

			document.getElementById("flick-to-result").addEventListener("touchmove", flickHandler, false);
			document.getElementById("flick-to-result").addEventListener("touchstart", flickHandler, false);
			document.getElementById("flick-to-result").addEventListener("touchend", flickHandler, false);
			document.getElementById("history").addEventListener("webkitTransitionEnd", layerHandler, false);
			
			window.addEventListener("custom_event", finishGame, false);
		},
	};

	function startGame() {
		if ($v.page_current === 2) {
			if (window.innerWidth === 480 && window.orientation < 0) {		//正常な位置の場合
				if (!$b.playing) {
					alert("ゲームを開始します。");
					var wrapper = document.getElementById("play");
					wrapper.appendChild($b.initialize());
					return true;
				}
				if ($b.playing && !$b.active) {
					$b.restart();
					alert("リスタートします。");
				}
			} else {														//正常な位置ではない場合
				//($b.active) ? $b.stop() : return false;
				if ($b.playing && $b.active) {
					$b.stop();
					alert("一時停止します。");
				}
			}			
		}
	}
	
	function finishGame() {		
		$s.addStorage($b.result);
		$b.destroy();
		$v.controlHistory(3);
		$v.move(3);
	}

	function linkHandler(e) {
		var link = parseInt(e.currentTarget.getAttribute("data-link"));
		if(link !== null) {
			$v.controlHistory(link);
			$v.move(link);
		}
	}

	function popstateHandler(e) {
		(e.state !== null) ? $v.move(e.state.page_num) : $v.move(0);
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
	
	function bubbleSort(records) {
		var tmp = 0;
		
		for(var i=0; i < records.length-1; i++) {
			for(var j=0; j < records.length-i-1; j++) {
				if (records[j].score < records[j+1].score) {
					tmp = records[j];
					records[j] = records[j+1];
					records[j+1] = tmp;
				}
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
/*PCデバッグ用*/ 	
/*
					var wrapper = document.getElementById("play");
					wrapper.appendChild($b.initialize());
*/
					break;
				case 3:
					var out = document.getElementById("out");
					var history_list = document.getElementById("history_list");
					
					out.innerHTML = $b.result.score + "  pt";
					history_list.innerHTML = "";
					
					bubbleSort($s.all);
					
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
					break;
				default:
					break;
			};
		}
	}

	w.$v = $v;
	w.page = page;

})(window);