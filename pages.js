(function(w) {	//疎結合

	/**
	* 各ページの型(prototype)となるコンストラクタ
	*/
	function Page() {
		//ページの名前
		this.name     		= null;
		
		//ページの番号
		this.num 	  		= null;
		
		//ヒストリーをreplaceするか否か
		this.replace  		= false;

		//ページの親となるarticleタグ	
		this.tag 	  		= null;
		
		//イベントハンドラを格納する配列
		this.handlers 		= [];

		//イベントハンドラの設定
		this.setHandlers 	= function() { return true; };

		//ページを開くときに行う処理
		this.open			= function() { return true; };
		
		//ページを閉じるときに行う処理
		this.close			= function() { return true; };

	};

	/**
	* TOP
	*/
	function pageTop() {
		this.name = "TOP";
		this.num  = 0;
		this.tag  = window.document.getElementsByTagName("article")[0];
	};
	pageTop.prototype = new Page();

	/**
	* Description
	*/
	function pageDescription() {
		this.name = "DESCRIPTION";
		this.num  = 1;
		this.tag  = window.document.getElementsByTagName("article")[1];
		this.open = function() {
			var description = w.document.getElementById("description_img");
			description.className = "description_sprite";
		};
	};
	pageDescription.prototype = new Page();

	/**
	* Description
	*/
	function pageGame() {
		this.name        = "GAME";
		this.num         = 2;
		this.tag         = window.document.getElementsByTagName("article")[2];
		this.handlers    = [];
		this.setHandlers = function() {
			var handlers = [];

			handlers["startGame"] = function() {
				//スマホが正しい向きの場合
				if (window.innerWidth >= 480 && window.orientation < 0) {
					//診断が開始されていない場合
					if (!$b.playing) {
						alert("診断を開始します。");
						//診断画面の初期化及び表示
						var wrapper = document.getElementById("play");
						wrapper.appendChild($b.initialize());
					//診断が一時停止中の場合
					} else if ($b.playing && !$b.active) {
						alert("リスタートします。");
						$b.restart();
					}
				//スマホが正しい向きではない場合
				} else {
					if ($b.playing && $b.active) {
						$b.stop();
						alert("一時停止します。");
					}
				}
			};
			handlers["finishGame"] = function() {
				//診断結果をlocalStorageに格納する
				$s.addStorage($b.result);

				//診断画面を消去する
				$b.destroy();

				//ページ遷移を行う
				$v.controlHistory(3);
				$v.move(3);
			};

			return handlers;
		};
		this.open = function() {
			this.handlers = this.setHandlers();
			this.handlers["startGame"]();

			//診断終了時のイベントをセット
			w.addEventListener("game_end", this.handlers["finishGame"], false);
			//スマホ回転時のイベントをセット
			w.addEventListener("orientationchange", this.handlers["startGame"], false);
		};
		this.close = function() {
			//スマホ回転時のイベントをセット
			w.removeEventListener("orientationchange", this.handlers["startGame"], false);
		};

	};
	pageGame.prototype = new Page();

	/*
	 * Result
	*/
	function pageResult() {
		this.name        = "RESULT";
		this.num         = 3;
		this.tag         = w.document.getElementsByTagName("article")[3];
		this.replace     = true;
		this.handlers    = [];
		this.setHandlers = function() {
			var handlers = [];

			handlers["layer"] = function(e) {
				//現在の上位レイヤー
				var section = e.target.id;

				//次の上位レイヤー
				var next = (section === "history") ? "score" : "history";

				if(parseInt(e.target.getAttribute("data-layer")) === 1) {
					e.target.style.top = 0 + "px";
					e.target.style.zIndex = 1;

					document.getElementById(next).style.zIndex = 2;
					document.getElementById(next).setAttribute("data-layer", "2");
				}
			};

			handlers["flick"] = (function() {
				var startY = 0;
				var diffY  = 0;
				var sTime  = 0;

				return function(e) {
					e.preventDefault();
					var touch          = e.touches[0];
					var moving_section = e.target.parentNode;

					//最初にタッチされた場合（タッチされた位置と時間を取得する）
					if (e.type == "touchstart") {
						startY = touch.pageY;
						sTime = (new Date()).getTime();
					}

					//タッチした指を動している時
					else if (e.type == "touchmove") {
						diffY = touch.pageY - startY;
						moving_section.setAttribute("class", "moving_touch");
						moving_section.style.top = diffY + "px";
					}

					//タッチが終了した場合
					else if (e.type == "touchend") {
						var t = (new Date()).getTime() - sTime;

						if (Math.abs(diffY) > 260 || (t < 300 && Math.abs(diffY) > 80)) {

							moving_section.setAttribute("class", "moving_release");
							moving_section.style.top = - window.innerHeight + "px";
							moving_section.setAttribute("data-layer", "1");

						} else {

							moving_section.setAttribute("class", "moving_release");
							moving_section.style.top = 0 + "px";
							moving_section.setAttribute("data-layer", "2");
						
						}
						startY = 0;
					}
				}
			}());

			return handlers;
		};
		this.open = function() {
			this.handlers = this.setHandlers();

			//フリック操作のためのイベントをセット
			var flickToHistory = document.getElementById("flick-to-history"),
				score          = document.getElementById("score");
				
			flickToHistory.addEventListener("touchmove", this.handlers["flick"], false);
			flickToHistory.addEventListener("touchstart", this.handlers["flick"], false);
			flickToHistory.addEventListener("touchend", this.handlers["flick"], false);
			score.addEventListener("webkitTransitionEnd", this.handlers["layer"] , false);

			var flickToResult = document.getElementById("flick-to-result"),
				history       = document.getElementById("history");
				
			flickToResult.addEventListener("touchmove", this.handlers["flick"], false);
			flickToResult.addEventListener("touchstart", this.handlers["flick"], false);
			flickToResult.addEventListener("touchend", this.handlers["flick"], false);
			history.addEventListener("webkitTransitionEnd", this.handlers["layer"], false);

			var out          = document.getElementById("out");
			var level_img    = document.getElementById("level_img");
			var history_list = document.getElementById("history_list");

			//結果スコアの表示
			out.innerHTML = $b.result.score + "  pt";

			//レベルの判定
			if ($b.result.score > 1800) {
				level_img.className = "level_4_china";
			} else if ($b.result.score > 1200) {
				level_img.className = "level_3_taisou";						
			} else if ($b.result.score > 600) {
				level_img.className = "level_2_safa";
			} else {
				level_img.className = "level_1_baby";
			}

			//これまでの結果をソート
			util.bubbleSort($s.all);

			//上位5つのスコア及び診断時間をリスト表示
			history_list.innerHTML = "";
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
		}
	};
	pageResult.prototype = new Page();

	/**
	* ページ遷移の管理を行うオブジェクト
	* pages         : 各ページのpageオブジェクト(185行目参照)を保持する配列
	* page_current  : 現在表示しているページ番号
	* handlers      : イベントハンドラを格納する配列
	* move          : 次のページへの遷移を行う関数
	*                 @next 遷移対象となるページの番号
	* controlHistory: 閲覧履歴の記録を行う関数
	*                 @next 遷移対象となるページの番号
	* setHandlers   : イベントハンドラの設定
	* init          : 各パラメータの初期化及びイベントの設定
	*/
	var $v = (function(w) {

		var pages = [],
			page_current = 0,
			handlers = [];

		return {

			move: function(next) {

				//現在表示しているページを閉じ、ページ番号を更新する。。
				pages[page_current].close();
				pages[page_current].tag.style.display = "none";
				page_current = next;
								
				//次に表示するページを初期化し、表示する。
				pages[next].open();
				pages[next].tag.style.display = "block";

				setTimeout(function() { window.scrollTo(0, 1); }, 100);

			},

			controlHistory: function(next) {

				//ページの閲覧を記録する　診断中画面であれば履歴を残さない
				if (pages[page_current].replace) {
					history.replaceState({ "page_num": next }, null, '/balance/page' + next);
				} else {
					history.pushState({ "page_num": next }, null, '/balance/page' + next);
				}

			},

			setHandlers: function() {

				handlers["popstate"] = function(e) {
					(e.state !== null) ? $v.move(e.state.page_num) : $v.move(0);
				};

				handlers["link"] = function(e) {
					var link = parseInt(e.currentTarget.getAttribute("data-link"));
					if(link !== null) {
						$v.controlHistory(link);
						$v.move(link);
					}
				};

			},

			init: function() {

				$s.reset();
				
				//ページ番号の初期化
				page_current = 0;

				pages[0] = new pageTop();
				pages[1] = new pageDescription();
				pages[2] = new pageGame();
				pages[3] = new pageResult();

				this.setHandlers();
				//履歴を戻る際のイベントをセット
				w.addEventListener("popstate", handlers["popstate"], false);

				//リンクを保持するタグをタップされた際のイベントをセット
				var links = w.document.getElementsByTagName("a");
				for(var i=0; i < links.length; i++) {
					links[i].addEventListener("touchstart", handlers["link"], false);  	//すべてのページタグにイベントを設定：data-link属性で指定されたリンクに移動	
				}
			}

		}

	}(window));

	w.$v = $v;

})(window);