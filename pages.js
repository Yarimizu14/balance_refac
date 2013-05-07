(function(w) {
	
	/**
	* ページ遷移の管理を行うオブジェクト
	* pages         : 各ページのpageオブジェクト(185行目参照)を保持する配列
	* page_current  : 現在表示しているページ番号
	* move          : 次のページへの遷移を行う関数
	*                 @next 遷移対象となるページの番号
	* controlHistory: 閲覧履歴の記録を行う関数
	*                 @next 遷移対象となるページの番号
	* initialize    : 各パラメータの初期化及びイベントの設定
	*/
	var $v =  {
		pages: [],
		page_current: 0,
		screen: {
			//iPhoneの方向
			"direction": window.orientation,
			//iPhoneの画面幅
			"width": window.innerWidth,
			//iPhoneの画面高 　
			"height": window.innerHeight　
		},

		move: function(next) {

			//現在表示しているページを非表示にし、次のページを表示する。
			this.pages[this.page_current].tag.style.display = "none";
			this.page_current = next;
			this.pages[next].tag.style.display = "block";

			//次に表示するページを初期化する。
			this.pages[next].initialize();
			setTimeout(function() { window.scrollTo(0, 1); }, 100);

		},

		controlHistory: function(next) {

			//ページの閲覧を記録する　診断中画面であれば履歴を残さない
			if (this.page_current === 2) {
				//history.replaceState({ "page_num": next }, null, '/balance/page' + next);
				history.replaceState({ "page_num": next }, null, '/balance/');
			} else {
				//history.pushState({ "page_num": next }, null, '/balance/page' + next);
				history.pushState({ "page_num": next }, null, '/balance/');
			}

		},

		initialize: function() {

			this.page_current = 0;

			//各ページ（各articleタグ）のpageオブジェクトを生成する
			var article = w.document.getElementsByTagName("article");
			for(var i=0; i < article.length; i++) {
				this.pages[i] = new page(article[i], i);								//考え直す必要あり、articleを入れるかpage(article[i], i)を入れるか？
			};

			//スマホ回転時のイベントをセット
			window.addEventListener("orientationchange", startGame, false);

			//履歴を戻る際のイベントをセット
			window.addEventListener("popstate", popstateHandler, false);

			//リンクを保持するタグをタップされた際のイベントをセット
			var links = w.document.getElementsByTagName("a");
			for(var i=0; i < links.length; i++) {
				links[i].addEventListener("touchstart", linkHandler, false);  			//すべてのページタグにイベントを設定：data-link属性で指定されたリンクに移動	
			}

			//フリック操作のためのイベントをセット
			var flickHandler = getFlickHandler();
			document.getElementById("flick-to-history").addEventListener("touchmove", flickHandler, false);
			document.getElementById("flick-to-history").addEventListener("touchstart", flickHandler, false);
			document.getElementById("flick-to-history").addEventListener("touchend", flickHandler, false);
			document.getElementById("score").addEventListener("webkitTransitionEnd", layerHandler , false);

			document.getElementById("flick-to-result").addEventListener("touchmove", flickHandler, false);
			document.getElementById("flick-to-result").addEventListener("touchstart", flickHandler, false);
			document.getElementById("flick-to-result").addEventListener("touchend", flickHandler, false);
			document.getElementById("history").addEventListener("webkitTransitionEnd", layerHandler, false);
			
			//診断終了時のイベントをセット
			window.addEventListener("custom_event", finishGame, false);
		},
	};

	/**
	* 診断画面の次の状態を判定する
	*/
	function startGame() {
		if ($v.page_current === 2) {

			//スマホが正しい向きの場合
			if (window.innerWidth === 480 && window.orientation < 0) {

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
		}
	}
	
	/**
	* 診断終了時の処理を行う
	*/
	function finishGame() {

		//診断結果をlocalStorageに格納する
		$s.addStorage($b.result);

		//診断画面を消去する
		$b.destroy();

		//ページ遷移を行う
		$v.controlHistory(3);
		$v.move(3);
	}

	/**
	* 履歴情報をもとに遷移を行う
	*/
	function popstateHandler(e) {
		(e.state !== null) ? $v.move(e.state.page_num) : $v.move(0);
	}

	/**
	* リンク先への遷移を行う
	*/
	function linkHandler(e) {
		var link = parseInt(e.currentTarget.getAttribute("data-link"));
		if(link !== null) {
			$v.controlHistory(link);
			$v.move(link);
		}
	}

	/**
	* 結果表示画面のレイヤーを変更する
	*/
	function layerHandler(e) {

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
	}

	/**
	* フリック操作
	*/
	function getFlickHandler() {
		var startY = 0;
		var diffY = 0;
		var sTime = 0;

		return function(e) {
			e.preventDefault();
			var touch = e.touches[0];

			//最初にタッチされた場合（タッチされた位置と時間を取得する）
			if (e.type == "touchstart") {
				startY = touch.pageY;
				sTime = (new Date()).getTime();
			}

			//タッチした指を動している時
			else if (e.type == "touchmove") {
				diffY = touch.pageY - startY;
				e.target.parentNode.setAttribute("class", "moving_touch");
				e.target.parentNode.style.top = diffY + "px";
			}

			//タッチが終了した場合
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
	
	/**
	* 降順でバブルソートを行う
	*/
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

	/**
	* ページオブジェクト
	* ページ番号と親タグを保持
	*/	
	function page(tag, num) {
		this.page_num = num;
		this.tag = tag;
		this.visible = false;
	};

	page.prototype = {
		initialize: function() {
			switch(this.page_num) {

				//診断画面
				case 2:
					startGame();
/*PCデバッグ用*/ 	
/*
					var wrapper = document.getElementById("play");
					wrapper.appendChild($b.initialize());
/**/
					break;

				//結果表示画面
				case 3:
					var out = document.getElementById("out");
					var level_img = document.getElementById("level_img");
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
					bubbleSort($s.all);

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
					break;
					
				default:
					break;
			};
		}
	}

	w.$v = $v;
	w.page = page;

})(window);