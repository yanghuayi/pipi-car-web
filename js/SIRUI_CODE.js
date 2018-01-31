var IDARR = new Array(); // 记录id
var DEPARR = new Array(); // 记录id
var LIMITDEPARR = new Array(); //北汽融创的 记录id
var OBJARR = new Array(); // 记录设备对象(不包括attachment)
var ROWS;
var BRANDLIST = "";// 用于缓存查询
var SERIESLIST = "";
var MODELLIST = "";
var SERIESMAP = new Map();// 用于缓存
var MODELMAP = new Map();// 用于缓存

SIRUI.control = function(cmd, callBack) {
  var imei = $("#currentIMEI").val();
	// 找出设备状态
	var hasControlRight = false;
	for (var i = 0; i < OBJARR.length; i++) {
		var obj = OBJARR[i][0];
		if (obj.imei == imei) {
			if (obj.status == "4") {
				hasControlRight == false;
			} else {
				hasControlRight = true;
			}
			i = OBJARR.length - 1; // 循环结束
		}
	}
	if (!hasControlRight) {
		SIRUI.toast("<font color=red>该设备已经激活,无法测试控制功能!</font>", '#fff');
		return false;
	}

	if (cmd == "km") {
		cmd = "1283";
	} else if (cmd == "gm") {
		cmd = "1281";
	} else if (cmd == "sf") {
		cmd = "20485";
	} else if (cmd == "cf") {
		cmd = "20486";
	} else if (cmd == "qd") {
		cmd = "1285";
	} else if (cmd == "xh") {
		cmd = "1286";
	} else if (cmd == "xc") {
		cmd = "1290";
	}
	SIRUI.showLoad("正在发送指令,请稍候...");

	$.post("/api/om/om/control", {
		cmd : cmd,
		imei : imei
	}, function(data, textStatus) {
		SIRUI.hideLoad();
		if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
			alert("会话超时,请重新登录...");
			window.location.href = '/login.html';
			return;
		} else if (data.result.resultCode == 0) { // 成功
			var code = data.result.resultMessage.split("hy@@")[0];
			var msg = data.result.resultMessage.split("hy@@")[1];
			SIRUI.toast("返回状态码: <font color=red>" + code + "</font> ; 消息:" + msg);
			callBack ? callBack() : null;
		} else {
			SIRUI.alert({
				message : data.result.resultMessage,
				title : "提醒",
			});
		}
	}, "json");
}

SIRUI.getTerminalObj = function (imei, arr) {
	var obj = "";
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].imei == imei) {
			obj = arr[i];
			break;
		}
	}
	if (obj.length == 0) {
		return null;
	}
	return obj;
}

SIRUI.getHtmlData = function (imei, arr) {
	var obddigconn;
	var clientType = 0;
	if (arr.length != 0) { // 取出非attachment的数据
		var obj = SIRUI.getTerminalObj(imei, arr);
		if(obj == null){
			return false;
		}
    // 终端状态
		$('#barcode').html(obj.barcode);
		$('#IMEI').html($("#currentIMEI").val());

		if (obj.status == "1") {
			var status = "待发货";
			SIRUI.alert({
        title: '提示',
        text: '<font color=red>设备未发货,无法测试!</font>',
      });
			return false;
		}
		/*
		 * else if (obj.status == "6") { status = "已报废"; $("#afui").popup({
		 * message : "<font color=red>设备已报废,无法测试!</font>", title : "提醒",
		 * cancelText : "取消", doneText : "确定" }); return false; }
		 */
    else if (obj.status == "2") {
			status = "待测试";
		} else if (obj.status == "3") {
			status = "已测试";
		} else if (obj.status == "4") {
			status = "已激活账号";
		} else if (obj.status == "5") {
			status = "待检测维修";
		}
		$('#status').html(status);

    // GPS 天线状态
    var $li_gps = $('.li_gps');
		if (obj.gpsantenna == "0" || obj.gpsantenna == "") {
      $li_gps.find('.iconfont').addClass('c-orange');
		} else if (obj.gpsantenna == "1") {
      $li_gps.find('.iconfont').addClass('c-green');
		} else if (obj.gpsantenna == "2") {
      $li_gps.find('.iconfont').addClass('c-red');
    }
    // 卫星数量
    var $gpsNum = $li_gps.find('.txt');
    if (obj.startnumber <= 0) {
			$gpsNum.html("<font color=orange>未知</font>");
		} else {
			$gpsNum.html("<font color=green>" + obj.startnumber + "</font>");
		}
    // GPS状态
		// if (obj.gpsstatus == "0" || obj.gpsstatus == "") {
		// 	gpsstatus = "<font color=orange>未知</font>";
		// } else if (obj.gpsstatus == "1") {
		// 	gpsstatus = "<font color=green>在线</font>";
		// } else if (obj.gpsstatus == "2") {
		// 	gpsstatus = "<font color=red>不在线</font>";
    // }
		// 设备状态
		// if (obj.isonline == "0") {
		// 	isonline = "<font color=red>不在线</font>";
		// } else if (obj.isonline == "1") {
		// 	isonline = "<font color=green>在线</font>";
		// } else {
		// 	isonline = "<font color=green>未知</font>";
    // }
		// GSM信号强度
		var $li_signal = $('.li_signal');
		var signalstrength = parseInt(obj.signalstrength);
		if ( obj.signalstrength == "" || signalstrength <= 0) {
		} else {
			if (signalstrength < 15) {
				$li_signal.find('.iconfont').addClass('signal_1');
			} else if (signalstrength < 20 && signalstrength >= 15) {
				$li_signal.find('.iconfont').addClass('signal_2');
			} else if (signalstrength < 25 && signalstrength >= 20) {
				$li_signal.find('.iconfont').addClass('signal_3');
			} else if ( signalstrength >= 25) {
				$li_signal.find('.iconfont').addClass('signal_4');
			}
		}
		if (obj.isonline == "0") {// 如果GSM不在线, 即使有信号数据,也是之前的信号数据,要显示为不在线
			$li_signal.find('.iconfont').removeClass('signal_1 signal_2 signal_3 signal_4');
			$li_signal.find('.txt').addClass('c-red').html('不在线');
    }

		var cjhm = obj.msisdn;
		// ACC状态 0:无效 1:开 2:关
		if (obj.acc == null || obj.acc == "") {
			acc = "<font color=orange>未知</font>";
		} else if (obj.acc == "0") {
			acc = "<font color=orange>无效</font>";
		} else if (obj.acc == "1") {
			acc = "<font color=green>开</font>";
		} else if (obj.acc == "2") {
			acc = "<font color=red>关</font>";
		}
		$('#ACC').html(acc);
		// OBD诊断链接状态
		if (obj.obddigconn == null || obj.obddigconn == "") {
			obddigconn = "<font color=orange>未知</font>";
		} else if (obj.obddigconn == "0") {
			obddigconn = "<font color=orange>无效</font>";
		} else if (obj.obddigconn == "1") {
			obddigconn = "<font color=green>正常</font>";
		} else if (obj.obddigconn == "2") {
			obddigconn = "<font color=red>异常</font>";
		}
		$('#OBD').html(obddigconn);
		// 外挂设备
		var obj = arr[0];
		var html = '';
		for (var i = 0, count = 0; i < obj.a_name.split(";").length; i++) {
			if (obj.a_name.split(";")[i] != "") {
				count++;
				html += "<li class='plugin-li'><span class='label'>外挂设备" + (i + 1) + "：</span><span class='value'><font color=green>" + obj.a_name.split(";")[i] + "</font>;&nbsp;版本:<font color=green>" + obj.a_version.split(";")[i] + "</font></span></li>";
			}
		}
		if (count == 0) {
			html += "<li class='plugin-li'><span style=\"color:green\">无外挂设备</span></li>";
		}
		$('.plugin-li').remove();
    $('.msg-list').append(html);
  }
};
