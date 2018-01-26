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

var POPLOGIN;
window.SiRui = window.SiRui || {};
SiRui.Util = SiRui.Util || {};

var load_script = function(xyUrl, callback) {
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = xyUrl;
	script.onload = script.onreadystatechange = function() {
		if ((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
			callback && callback();
			script.onload = script.onreadystatechange = null;
			if (head && script.parentNode) {
				head.removeChild(script);
			}
		}
	};
	head.insertBefore(script, head.firstChild);
};

function showMap(lng, lat, gpstime) {

	var arr = bd_encrypt(lat, lng);
	/*
	 * 
	 * 以前的静态页面方式
	 */

	/*
	 * $("#afui").popup({ title : "GPS位置测试", message : '<img width="90%"
	 * height="90%"
	 * src="http://api.map.baidu.com/staticimage?center='+arr[0]+','+arr[1]+'&zoom=15&markers='+arr[0]+','+arr[1]+'&markerStyles=l,A&copyright=1"></img>',
	 * cancelText : "关闭", cancelCallback : function() { // showLogin(); },
	 * cancelOnly : true });
	 */

	/**
	 * 动态页面方式
	 */
	// 加载百度地图
	var clientWidth = document.documentElement.clientWidth;
	var clientHeight = document.documentElement.clientHeight;
	if (gpstime.length >= 21) {
		gpstime = gpstime.substr(0, 19);
	}
	$("#afui").popup({
		title : "GPS位置测试",
		message : '<h3><font  color="green">GPS更新时间 : </font><font id="shijian" color="red">' + gpstime + '</font></h3><h3 id="didian" style="color:orange">正在获取地点...</h3><div style="width:100%;height:' + (clientHeight * 0.6) + 'px;border:0px solid gray" id="container">',
		cancelText : "关闭",
		cancelCallback : function() {
			// showLogin();
		},
		cancelOnly : true,
		onShow : function() {
			var map = new BMap.Map("container");
			map.centerAndZoom(new BMap.Point(arr[0], arr[1]), 15);
			map.enableScrollWheelZoom();
			var marker = new BMap.Marker(new BMap.Point(arr[0], arr[1]));
			map.addOverlay(marker);

			/**
			 * 获取地理信息
			 */
			var callbackName = 'sirui_' + Math.round(Math.random() * 10000); // 随机函数名
			var xyUrl = "http://api.map.baidu.com/geocoder/v2/?ak=K52pNzWT61z1EHvdZptaSmlPRc7mKbjC&callback=SiRui.Util." + callbackName + "&location=" + arr[1] + "," + arr[0] + "&output=json"; // &pois=1
			// 查询周边
			// alert(xyUrl);
			load_script(xyUrl);

			SiRui.Util[callbackName] = function(xyResult) {
				delete SiRui.Util[callbackName]; // 调用完需要删除函数

				// if (xyResult.error != 0) {
				// translateNum++;
				// if (translateNum < 3) {
				// return translate(new BMap.Point(xyResult.x, xyResult.y),
				// type, callback);
				// }
				// }
				// var point = new BMap.Point(xyResult.x, xyResult.y);
				callback && callback(xyResult);
			};

		}
	});
}
function callback(data) {
	document.getElementById("didian").innerHTML = data.result.formatted_address;
}
function goRegister(){
	if(window.location.href.indexOf("192.168.6")!=-1||window.location.href.indexOf("localhost")!=-1){
		window.location.href="http://192.168.6.52:40000/pages/ops/register.jsp";
//		if(window.location.href.indexOf("192.168.6.113")!=-1){
//			window.location.href="http://192.168.6.113:40000/pages/ops/register.jsp";
//		}else{
//			window.location.href="http://192.168.6.52:40000/pages/ops/register.jsp";
//		}
	}else{
		window.location.href="http://maintain.mysirui.com:40000/pages/ops/register.jsp";
	}
	return false;
}
function refreshAuthCode() {
	$("#authcodeIMG")[0].src = "/provider/testProvide/getLoginAuthCodeImg?r=" + Math.random();
}
function showLogin() {

	POPLOGIN = $("#afui").popup({
		title : "请输入您的帐号信息",
		message : " <label style='float:left'>用户名:</label> <input type='text' id='username' value='' class='af-ui-forms' placeholder='请输入您的用户名' style='color:green'><br/>"+
		"<label style='float:left'>密码:</label> <input id='password' value='' onkeydown='tt()' type='password' class='af-ui-forms'  placeholder='请输入您的密码' style='color:green'><br/>"+
		"<label style='float:left'>验证码:</label> <input id='authcode' value='' onkeydown='tt()' type='text' class='af-ui-forms'  placeholder='请输入验证码' style='color:orange'><br/>"+
		"<label style='float:left'>&nbsp;</label> <img onclick='refreshAuthCode()' id='authcodeIMG' src='/provider/testProvide/getLoginAuthCodeImg'/><br/>"+
		"<label style='float:left'></label><a style='color:red' onclick='goRegister();'>注册成为安装人员</a>",
		cancelText : "取消",
		cancelCallback : function() {
			showLogin();
		},
		doneText : "登录",
		doneCallback : function() {
			login();
		},
		cancelOnly : false
	});
}
function tt() {
	stopEvent(getEvent());
	if (event.keyCode == 13) {
		login();
	}
}
// // 输入sim卡卡号
// function showSIMInput(msisdn, imei) {
// // 找出设备状态
// var _status = "";
// for ( var i = 0; i < OBJARR.length; i++) {
// var obj = OBJARR[i][0];
// if (obj.imei == imei) {
// _status = obj.status;
// i = OBJARR.length - 1; // 循环结束
// }
// }
// if (_status == "1" || _status == "2") { // 如果还没有开始测试 需要输入绑定sim卡
// if ($("#sim_" + imei).attr("data-sim") != "0") {
// msisdn = $("#sim_" + imei).attr("data-sim");
// }
// $("#afui").popup({
// title : "检测之前请输入车机号码",
// message : "<label style='float:left'>SIM卡号:</label> <input type='text'
// id='sim' value='" + msisdn + "' class='af-ui-forms' placeholder='请输入sim卡号'>",
// cancelText : "取消",
// cancelCallback : function() {
// },
// doneText : "提交",
// doneCallback : function() {
// var sim = $("#sim").val();
// if (sim.length == 0) {
// $("#afui").popup("请输入sim卡号...");
// showSIMInput(sim, imei); // 注意这里的msisdn已经变为 sim
// return null;
// }
// if (sim.length < 11) {
// $("#afui").popup("请输入<font color=red>大于等于11位的</font>sim卡号...");
// showSIMInput(sim, imei); // 注意这里的msisdn已经变为 sim
// return null;
// }
// $.ui.showMask("正在保存该设备车机号码,请稍候...");
// $.post(WEBROOT + "/om/om/saveSim", {
// sim : sim,
// imei : imei
// }, function(data, textStatus) {
// $.ui.hideMask(); // 取消mask
// if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
// alert("会话超时,请重新登录...");
// window.location.reload();
// return;
// } else if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
// alert("会话超时,请重新登录...");
// window.location.reload();
// return;
// } else if (data.result.resultCode == 0) { // 成功
// // 成功之后 应该记录 SIM 全局变量
// // 同时修改click事件,因为 sim卡已经变了....
// $("#sim_" + imei).attr("data-sim", sim);
// showTest(imei); // 跳转到测试界面
// } else {
// alert(data.result.resultMessage);
// showSIMInput(sim, imei); // 注意这里的msisdn已经变为
// // sim//重新显示出来
// }
// }, "json");
//
// },
// cancelOnly : false
// });
// } else {
// showTest(imei); // 跳转到测试界面
// }
//
// }
/**
 * 控制模块
 */
function control(cmd) {
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
		$("#afui").popup("<font color=red>该设备已经激活,无法测试控制功能!</font>");
		return null;
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
	$.ui.showMask("正在发送指令,请稍候...");
	$("body").append("<div id=\"mask\" style=\"opacity:0.5;\"></div>");
	$.post(WEBROOT + "/om/om/control", {
		cmd : cmd,
		imei : imei
	}, function(data, textStatus) {
		$.ui.hideMask(); // 取消mask
		$("#mask").remove();
		if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
			alert("会话超时,请重新登录...");
			window.location.reload();
			return;
		} else if (data.result.resultCode == 0) { // 成功
			var code = data.result.resultMessage.split("hy@@")[0];
			var msg = data.result.resultMessage.split("hy@@")[1];
			$("#afui").popup("返回状态码: <font color=red>" + code + "</font> ; 消息:" + msg);
		} else {
			$("#afui").popup({
				message : data.result.resultMessage,
				title : "提醒",
				cancelText : "取消",
				doneText : "确定"
			});
		}
	}, "json");
}

/**
 * 完成测试
 */
function finishTest() {
	var imei = $("#currentIMEI").val();

	// 找出设备状态
	var hasControlRight = false;
	for (var i = 0; i < OBJARR.length; i++) {
		var obj = OBJARR[i][0];
		if (obj.imei == imei) {
			// 只限制待发货
			if (obj.status == "1") {
				hasControlRight == false;
			} else {
				hasControlRight = true;
			}
			i = OBJARR.length - 1; // 循环结束
		}
	}

	if (!hasControlRight) {
		$("#afui").popup("<font color=red>该设备尚未发货,无法操作!</font>");
		return null;
	} else {
		$("#navbar_search").removeClass("pressed");
		$("#navbar_info").addClass("pressed");
		$("#navbar_admin").removeClass("pressed");
		$("#navbar_test").removeClass("pressed");
		showInfo();
	}

	/*
	 * $.ui.showMask("正在发送指令,请稍候..."); $.post(WEBROOT + "/om/om/finishTest", {
	 * imei : imei }, function(data, textStatus) { $.ui.hideMask(); // 取消mask if
	 * (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
	 * alert("会话超时,请重新登录..."); window.location.reload(); return; } else if
	 * (data.result.resultCode == 0) { // 成功 // 更新全局变量 for ( var i = 0; i <
	 * OBJARR.length; i++) { var obj = OBJARR[i][0]; if (obj.imei == imei) {
	 * OBJARR[i][0].status = "3"; } }
	 * 
	 * $("#afui").popup({ title : "测试完成", message : "您已经完成了测试,请选择是否需要完善设备信息?",
	 * cancelText : "以后再说", cancelCallback : function() { // 清理数据 clean();
	 * goToAnchor("main"); }, doneText : "去完善!", doneCallback : function() {
	 * $("#navbar_search").removeClass("pressed");
	 * $("#navbar_info").addClass("pressed");
	 * $("#navbar_admin").removeClass("pressed");
	 * $("#navbar_test").removeClass("pressed"); showInfo(); }, cancelOnly :
	 * false }); // 弹出是否完善信息 } else { $("#afui").popup({ message :
	 * data.result.resultMessage, title : "提醒", cancelText : "取消", doneText :
	 * "确定" }); } }, "json");
	 * 
	 */
}
/**
 * 也可能赋初值.
 */
function changeBrand(seriesID, modelID) {
	// 同时修改车型
	$("#VehicleModel").html("<option value=\"0\"> 请选择车型</option>");
	var value = $("#brand").val();
	if (!value) {
		return null;
	}
	if ("0" == value) {
		$("#series").html("<option value=\"0\"> 请选择车系</option>");
		$("#series").val(0);
		return null;
	}
	if (SERIESMAP.get(value) == null) {
		$.ajax({
			url : WEBROOT + "/basic/vehicleModel/getSeriesTreeList?brandID=" + value,
			dataType : "json",
			success : function(data) {
				SERIESMAP.put(value, data.rows);
				$("#series").html("");
				var html = "<option value=\"0\"> 请选择车系</option>";
				for (var i = 0; i < data.rows.length; i++) {
					var obj = data.rows[i];
					html += "<option value=" + obj.seriesid + ">" + obj.seriesname + "</option>"
				}
				$("#series").html(html);
				if (seriesID != null && typeof (seriesID) != "undefined") {
					$("#series").val(seriesID);
					changeSeries(modelID);// 赋值
				} else {
					$("#series").val(0);
				}
			}
		});
	} else {// 使用缓存
		var html = "<option value=\"0\"> 请选择车系</option>";
		var rows = SERIESMAP.get(value);
		for (var i = 0; i < rows.length; i++) {
			var obj = rows[i];
			html += "<option value=" + obj.seriesid + ">" + obj.seriesname + "</option>"
		}
		$("#series").html(html);
		if (seriesID != null && typeof (seriesID) != "undefined") {
			$("#series").val(seriesID);
			changeSeries(modelID);// 赋值
		} else {
			$("#series").val(0);
		}
	}

};

/**
 * 也可能赋初值.
 */
function changeSeries(modelID) {
	var value = $("#series").val();
	if (!value) {
		return null;
	}
	if ("0" == value) {
		$("#VehicleModel").html("<option value=\"0\"> 请选择车型</option>");
		$("#VehicleModel").val(0);
		return null;
	}
	if (MODELMAP.get(value) == null) {
		$.ajax({
			url : WEBROOT + "/basic/vehicleModel/getModelTreeList?seriesID=" + value,
			dataType : "json",
			success : function(data) {
				MODELMAP.put(value, data.rows);
				var html = "<option value=\"0\"> 请选择车型</option>";
				for (var i = 0; i < data.rows.length; i++) {
					var obj = data.rows[i];
					html += "<option value=" + obj.vehiclemodelid + ">" + obj.vehiclename + "</option>"
				}
				$("#VehicleModel").html(html);
				if (modelID != null && typeof (modelID) != "undefined") {
					$("#VehicleModel").val(modelID);
				} else {
					$("#VehicleModel").val(0);
				}
			}
		});
	} else {// 使用缓存
		$("#VehicleModel").html("");
		var html = "<option value=\"0\"> 请选择车型</option>";
		var rows = MODELMAP.get(value);
		for (var i = 0; i < rows.length; i++) {
			var obj = rows[i];
			html += "<option value=" + obj.vehiclemodelid + ">" + obj.vehiclename + "</option>"
		}
		$("#VehicleModel").html(html);
		if (modelID != null && typeof (modelID) != "undefined") {
			$("#VehicleModel").val(modelID);
		} else {
			$("#VehicleModel").val(0);
		}
	}

};
// 跳转到 完善信息 初始化品牌 如果已经被用户激活了 就不能再更改了
function showInfo() {

	var imei = $("#currentIMEI").val();
	// 找出设备状态
	var canModifyVM = false;
	var needToFinishTest = false;
	for (var i = 0; i < OBJARR.length; i++) {
		var obj = OBJARR[i][0];
		if (obj.imei == imei) {
			/*
			 * if (obj.status == "2") {//还没有测试完成,. 必须先测试完成才行 $("#afui").popup({
			 * message : "<font color=red>请先完成测试!</font>", title : "提醒",
			 * cancelText : "取消", doneText : "确定" }); needToFinishTest=true;
			 * break; }
			 */
			if (obj.status == "4") {// 已经激活,无法修改车型
				canModifyVM == false;
			} else {
				canModifyVM = true;
			}
			
			//展车可修改车型，反正也没有客户
			if(obj.isExhibitionTer){
				canModifyVM = true;
			}
			
			i = OBJARR.length - 1; // 循环结束
		}
	}

	var clientType = $("#clientType").val();
	if(clientType == 17){//wg设备的
		initWGInfo(imei);
		if (!needToFinishTest) {
			goToAnchor("wgInfo");
		}
	}else{
		if (!canModifyVM) {// 已经激活
			// initBrand();
			initInfo(imei, false);// 展示信息, 不可编辑
		} else {// 还可以改
			// initBrand();
			initInfo(imei, true);// 展示信息 可以编辑
		}
		if (!needToFinishTest) {
			goToAnchor("info");
		}
	}
	
}
function initInfo(imei, canEdit) {
	initBrand();
	$.post(WEBROOT + "/om/om/getTerminalInfo?imei=" + imei, {}, function(data, textStatus) {
		if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
			alert("会话超时,请重新登录...");
			window.location.reload();
			return;
		} else if (data.result.resultCode != 0) {
			$("#afui").popup({
				message : data.result.resultMessage,
				title : "提醒",
				cancelText : "取消",
				doneText : "确定"
			});
		} else { // 成功
			if (data.total == 0) {
				// $("#list").html("没有记录...");
			} else { // 有数据
				var obj = data.rows[0]; // 复制全局变量
				if (!canEdit) {
					$("#VehicleModel").html("<option value=\"" + obj.vehiclemodelid + "\">" + obj.vehiclemodelname + "</option>");
					$("#brand").html("<option value=\"" + obj.brandid + "\">" + obj.brandname + "</option>");
					$("#series").html("<option value=\"" + obj.seriesid + "\">" + obj.seriesname + "</option>");
				} else {// 能选择
					if (obj.brandid == null || obj.brandid == "" || typeof (obj.brandid) == 'undefined') {
						$("#brand").val(0);
						$("#series").val(0);
						$("#VehicleModel").val(0);
						// changeBrand(0,0);// 初始化化车型也在里面
					} else {
						$("#brand").val(obj.brandid);
						changeBrand(obj.seriesid, obj.vehiclemodelid);// 初始化化车型也在里面
					}

				}
				$("#PlateNumber").val(obj.platenumber);
				$("#VehicleID").val(obj.vin);
				$("#carUserName").val(obj.customername);
				$("#TelNumber").val(obj.customerphone);
				$("#msisdn").val(obj.msisdn);
				$("#levelCode").val(obj.levelcode);
				$("#depName").val(obj.depname);
				$// ("#list").html(html);
				// $("#list").show();
				
				//设置金融车的checkbox
				if(obj.finance == "1"){//是金融车
					if(!$("#isFinance").is(":checked")){
						$("#isFinanceLable").click();
					}
				}else{
					if($("#isFinance").is(":checked")){
						$("#isFinanceLable").click();
					}
				}
			}
		}
	}, "json");
}


function initWGInfo(imei) {
	$.post(WEBROOT + "/om/om/getTerminalInfo?imei=" + imei, {}, function(data, textStatus) {
		if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
			alert("会话超时,请重新登录...");
			window.location.reload();
			return;
		} else if (data.result.resultCode != 0) {
			$("#afui").popup({
				message : data.result.resultMessage,
				title : "提醒",
				cancelText : "取消",
				doneText : "确定"
			});
		} else { // 成功
			if (data.total == 0) {
				// $("#list").html("没有记录...");
			} else { // 有数据
				var obj = data.rows[0]; // 复制全局变量
				$("#wgVehicleID").val(obj.mac);
				$("#wgCarUserName").val(obj.customername);
				$("#wgTelNumber").val(obj.customerphone);
				$("#wgMsisdn").val(obj.msisdn);
				$("#wgLevelCode").val(obj.levelcode);
				$("#wgDepName").val(obj.depname);
				$("#wgVehicleModelID").val(obj.wgvehiclemodelid);
			}
		}
	}, "json");
}

/**
 * 获取品牌信息
 */
function initBrand() {
	if (BRANDLIST.length == 0) {// 还没有缓存
		$.post(WEBROOT + "/basic/brand/getBrandList", {}, function(data, textStatus) {
			if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
				alert("会话超时,请重新登录...");
				window.location.reload();
				return;
			} else if (data.result.resultCode == 0) {
				BRANDLIST = data.entity.brands;
				initBrand_do();
			} else {
				// $("#afui").popup(data.result.resultMessage);
			}
		}, "json");
	} else {// 有缓存
		initBrand_do();
	}
}
// 初始化之后的下一步操作
function initBrand_do() {
	var brands = BRANDLIST;
	var html = " <option value=\"0\">请先选择品牌</option>";
	for (var i = 0; i < brands.length; i++) {
		html += "<option value=\"" + brands[i].entityID + "\">" + brands[i].name + "</option>";
	}
	$("#brand").html(html);
	$("#brand").val(0);
}
// 完善信息
function saveInfo() {
	var imei = $("#currentIMEI").val();
	// 找出设备状态
	var hasControlRight = false;
	var obj;
	for (var i = 0; i < OBJARR.length; i++) {
		obj = OBJARR[i][0];
		if (obj.imei == imei) {
			if (obj.status == "1") {
				hasControlRight == false;
			} else {
				hasControlRight = true;
			}
			i = OBJARR.length - 1; // 循环结束
		}
	}

	if (!hasControlRight) {
		$("#afui").popup("<font color=red>该设备尚未发货,无法完善信息!</font>");
		return null;
	}

	var VehicleModel = $("#VehicleModel").val();
	var brandID = $("#brand").val();
	var seriesID = $("#series").val();
	var PlateNumber = $("#PlateNumber").val();
	var VehicleID = $("#VehicleID").val();// 这里是车架号
	var carUserName = $("#carUserName").val();
	var TelNumber = $("#TelNumber").val();
	var msisdn = $("#msisdn").val();
	var levelCode = $("#levelCode").val();
	var isFinance = $("#isFinance").val();
	
	if (typeof (brandID) == "undefined" || brandID == "" || brandID == 0) {
		$("#afui").popup("请选择车辆品牌!");
		return;
	}
	if (typeof (seriesID) == "undefined" || seriesID == "" || seriesID == 0) {
		$("#afui").popup("请选择车辆车系!");
		return;
	}
	if (typeof (VehicleModel) == "undefined" || VehicleModel == "" || VehicleModel == 0) {
		$("#afui").popup("请选择车辆车型!");
		return;
	}
//	if(obj == false){
		if (VehicleModel == -1 || VehicleModel == 10305) {
			$("#afui").popup("无法选择该车型,请重新选择!");
			return;
		}
//	}
	if (typeof (levelCode) == "undefined" || levelCode == "" || levelCode == 0) {
		$("#afui").popup("必选选择安装门店");
		return;
	}
	if (typeof (VehicleID) == "undefined" || VehicleID == "" || VehicleID.trim().length != 17) {
		$("#afui").popup("必选输入正确的车架号");
		return;
	}
	// if(!msisdn.trim()){
	// $("#afui").popup("请输入车机号码!");
	// return;
	// }else {
	// var mobileValidate = /^[0-9]{11,}$/;
	// if (!mobileValidate.test(msisdn)) {
	// $("#afui").popup("请输入正确的车机号码!");
	// return;
	// }
	// }

	$.ui.showMask("正在保存,请稍候...");
	$.post(WEBROOT + "/om/om/saveInfo", {
		imei : imei,
		VehicleModel : VehicleModel,
		brandID : brandID,
		seriesID : seriesID,
		levelCode : levelCode,
		PlateNumber : PlateNumber,
		VehicleID : VehicleID,
		carUserName : carUserName,
		TelNumber : TelNumber,
		isFinance : isFinance,
		msisdn : msisdn
	}, function(data, textStatus) {
		$.ui.hideMask(); // 取消mask
		if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
			alert("会话超时,请重新登录...");
			window.location.reload();
			return;
		} else if (data.result.resultCode == 0) { // 成功
			$("#afui").popup(data.result.resultMessage);
			// 清理数据
			clean();
			goToAnchor("main");

			// 弹出是否完善信息
		} else {
			$("#afui").popup({
				message : data.result.resultMessage,
				title : "提醒",
				cancelText : "取消",
				doneText : "确定"
			});
		}
	}, "json");
}

//完善wg设备的信息
function saveWGInfo() {
	var imei = $("#currentIMEI").val();
	// 找出设备状态
	var hasControlRight = false;
	for (var i = 0; i < OBJARR.length; i++) {
		var obj = OBJARR[i][0];
		if (obj.imei == imei) {
			if (obj.status == "1") {
				hasControlRight == false;
			} else {
				hasControlRight = true;
			}
			i = OBJARR.length - 1; // 循环结束
		}
	}

	if (!hasControlRight) {
		$("#afui").popup("<font color=red>该设备尚未发货,无法完善信息!</font>");
		return null;
	}

	var wgVehicleID = $("#wgVehicleID").val();// 这里是车架号
	var wgCarUserName = $("#wgCarUserName").val();
	var wgTelNumber = $("#wgTelNumber").val();
	var wgMsisdn = $("#wgMsisdn").val();
	var wgLevelCode = $("#wgLevelCode").val();
	var wgVehicleModelID = $("#wgVehicleModelID").val();
	
	if (typeof (wgVehicleID) == "undefined" || wgVehicleID == "" || wgVehicleID.trim().length != 17) {
		$("#afui").popup("必选输入正确的车架号");
		return;
	}

	$.ui.showMask("正在保存,请稍候...");
	$.post(WEBROOT + "/om/om/saveWGInfo", {
		imei : imei,
		wgLevelCode : wgLevelCode,
		wgVehicleID : wgVehicleID,
		wgCarUserName : wgCarUserName,
		wgTelNumber : wgTelNumber,
		wgMsisdn : wgMsisdn,
		VehicleModel : wgVehicleModelID
	}, function(data, textStatus) {
		$.ui.hideMask(); // 取消mask
		if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
			alert("会话超时,请重新登录...");
			window.location.reload();
			return;
		} else if (data.result.resultCode == 0) { // 成功
			$("#afui").popup(data.result.resultMessage);
			// 清理数据
			clean();
			goToAnchor("main");

			// 弹出是否完善信息
		} else {
			$("#afui").popup({
				message : data.result.resultMessage,
				title : "提醒",
				cancelText : "取消",
				doneText : "确定"
			});
		}
	}, "json");
}

function tipsBindOtuWg(dataInfo, imei){
	if(dataInfo.entity && dataInfo.entity == true){//true，需要绑定otu和wg
		var clientType = $("clientType").val();
		var msg = "";
		if(clientType == 17){
			msg = "该设备是否需要绑定当前车辆的OTU设备?";
		}else{
			msg = "该设备是否需要绑定当前车辆的无线GPS设备?";
		}
		$("#afui").popup({
			message : msg,
			title : "提醒",
			cancelText : "取消",
			doneText : "确定",
			doneCallback : function(){
				$.post(WEBROOT + "/om/om/bindOtuWg", {
					imei : imei
				}, function(data, textStatus) {
					if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
						alert("会话超时,请重新登录...");
						window.location.reload();
						return;
					} else if (data.result.resultCode == 0) { // 成功
						$("#afui").popup("绑定成功!");
						// 清理数据
						clean();
						goToAnchor("main");
					} else{
						$("#afui").popup({
							message : data.result.resultMessage,
							title : "提醒",
							doneText : "确定"
						});
					}
				}, "json");
			},
			cancelCallback : function(){
				$("#afui").popup("成功完成测试!");
				// 清理数据
				clean();
				goToAnchor("main");
			}
		});
	}else{
		$("#afui").popup("成功完成测试!");
		// 清理数据
		clean();
		goToAnchor("main");
	}
}

// 完成一次测试之后,需要清理数据
function clean() {
	IDARR = new Array();
	OBJARR = new Array();
	ROWS = new Array();
	$("#list").html("");
	$("#list").hide();
	$("#search").val("");
	$("#levelCode").val("");
	$("#depName").val("");
	
	//设置金融车的checkbox为false
	if($("#isFinance").is(":checked")){
		$("#isFinanceLable").click();
	}
}
function login() {
	var username = $("#username").val();
	var password = $("#password").val();
	var authcode = $("#authcode").val();
	
	if (username.length == 0) {
		$("#afui").popup("请输入账号...");
		showLogin();
		return null;
	}
	if (password.length == 0) {
		$("#afui").popup("请输入密码...");
		showLogin();
		return null;
	}
	if (authcode.length != 4) {
		$("#afui").popup("请输入4位验证码...");
		showLogin();
		return null;
	}
	// $("div.afPopup").remove();
	// $("#mask").remove();
	POPLOGIN.hide();// 隐藏登陆框
	initBrand();// 可能会出现顺序问题,所以在初始化页面时 加载
	$.ui.showMask("正在登陆,请稍候...");
	$.post(WEBROOT + "/purview/user/login?name=" + username + "&password=" + password+"&authcode="+authcode, {}, function(data, textStatus) {
		$.ui.hideMask(); // 取消mask
		if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
			alert("会话超时,请重新登录...");
			window.location.reload();
			return;
		} else  if(6 == data.result.resultCode){//需要刷新验证码
			alert("验证码错误");
			refreshAuthCode();
			showLogin(); // 重新显示出来
			return;
		}else  if(7 == data.result.resultCode){//直接alert
			alert(data.result.resultMessage);
			refreshAuthCode();
			showLogin(); // 重新显示出来
			return;
		}else if (data.result.resultCode == 0) { // 成功
			goToAnchor("main");
			initDepTree();
			initLimitDepTree();
		} else {
			alert("登陆失败");
			refreshAuthCode();
			showLogin(); // 重新显示出来
		}
	}, "json");

}
function initDepTree() {
	$.post(WEBROOT + "/om/om/getDepTreeForOM", {}, function(data, textStatus) {
		if (data.result.resultCode == 0) { // 成功
			DEPARR = new Array();
			var html = "";
			var rows = data.entity;
			// 需要从第一个开始,但是第一个不一定是 1, 可能是1/2
			var firstCengShu = rows[0].levelCode.split("/").length - 1;
			for (var i = 0, length = rows.length; i < length; i++) {
				var A = rows[i];
				DEPARR.push(A);
				var levelCode = A.levelCode;
				var name = A.name;
				var cengshu = levelCode.split("/").length - firstCengShu;
				var qianzui = "";
				for (var m = 1; m < cengshu; m++) {
					qianzui += "|&nbsp;&nbsp;";
				}
				html += "<option value='" + levelCode + "'>" + qianzui + "|-- " + name + "</option>";
			}
			$("#depList").html(html);
		}
	}, "json");
}

function initLimitDepTree() {
	$.post(WEBROOT + "/om/om/getBqrcDepTreeForOM", {}, function(data, textStatus) {
		if (data.result.resultCode == 0) { // 成功
			LIMITDEPARR = new Array();
			var html = "";
			var rows = data.entity;
			// 需要从第一个开始,但是第一个不一定是 1, 可能是1/2
			var firstCengShu = rows[0].levelCode.split("/").length - 1;
			for (var i = 0, length = rows.length; i < length; i++) {
				var A = rows[i];
				LIMITDEPARR.push(A);
				var levelCode = A.levelCode;
				var name = A.name;
				var cengshu = levelCode.split("/").length - firstCengShu;
				var qianzui = "";
				for (var m = 1; m < cengshu; m++) {
					qianzui += "|&nbsp;&nbsp;";
				}
				html += "<option value='" + levelCode + "'>" + qianzui + "|-- " + name + "</option>";
			}
			$("#limitDepList").html(html);
		}
	}, "json");
}

/**
 * 跳转到某锚点,必须使用这种方式, 才能支持低端机
 */
function goToAnchor(name) {
	var el = $('<a>');
	el.html('&nbsp;');
	$('#anchor').parent().append(el);
	el.attr('href', "#" + name);
	if (el.onClick) {
		el.onClick();
	} else if (el.click) {
		el.click();
	}
}

// 展示详细信息
function showTest(imei) {
	ctrlShow4HMterminal(false);
	
	// 先给 控件赋值
	$("#currentIMEI").val(imei);
	var barcode = "";
	var status = "";
	var isonline = "";
	var gpsantenna = "";
	var gpsstatus = "";
	var startnumber = "";
	var signalstrength = "";
	var acc = "";
	var arr = getArr(imei);
	var html = getHtmlData(imei, arr);
	var clientType = getTerminalClientType(imei, arr);
	$("#clientType").val(clientType);
	if (html != false) {
		
		if(clientType == 17){//wg设备的
			$("#wg_test_info").html(html);
			goToAnchor("wgTest");
		}else{//原来的设备的
			$("#test_info").html(html);
			goToAnchor("test");
		}
		
		if(arr[0].barcode.toUpperCase().indexOf("HM") == 0){
			ctrlShow4HMterminal(true);
		}
	}
}

function ctrlShow4HMterminal(isShow){
	if(isShow){
		$("#hmTips").show();//hm开头的设备加的提示
		
		$("#limitDepHrefDiv").show();
		$("#depHrefDiv").hide();
	}else{
		$("#hmTips").hide();//hm开头的设备加的提示
		
		$("#limitDepHrefDiv").hide();
		$("#depHrefDiv").show();
	}
}

function refreshData() {
	$.ui.showMask("正在获取数据,请稍候...");
	var imei = $("#currentIMEI").val();
	$.post(WEBROOT + "/om/om/getDeviceStatus?search=imei_" + imei, {}, function(data, textStatus) {
		$.ui.hideMask(); // 取消mask
		if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
			alert("会话超时,请重新登录...");
			window.location.reload();
			return;
		} else if (data.result.resultCode != 0) {
			$("#afui").popup({
				message : data.result.resultMessage,
				title : "提醒",
				cancelText : "取消",
				doneText : "确定"
			});
		} else { // 成功

			if (data.total == 0) {
				// $("#list").html("没有记录...");
				// $("#list").show();
			} else { // 有数据
				ROWS = data.entity; // 复制全局变量
				// 遍历重新封装数据
				IDARR = new Array(); // 记录id
				OBJARR = new Array(); // 记录对象
				for (var i = 0; i < data.entity.length; i++) {
					if (IDARR.in_array(data.entity[i].terminalid)) { // 在数组中
						// OBJARR[OBJARR.length-1].push(data.entity[i]);//存入最后一个
					} else {
						var temp = new Array();
						temp.push(data.entity[i]);
						OBJARR.push(temp);
						IDARR.push(data.entity[i].terminalid);
					}
				}

				// 开始处理数据
				var arr = new Array();
				for (var i = 0; i < ROWS.length; i++) {
					var obj = ROWS[i];
					if (obj.imei == imei) {
						arr.push(obj);
					}
				}

				var html = getHtmlData(imei, arr);
				var clientType = getTerminalClientType(imei, arr);
				if (html != false) {
					if(clientType == 17){//wg设备的
						$("#wg_test_info").html(html);
						goToAnchor("wgTest");
					}else{//原来的设备的
						$("#test_info").html(html);
						goToAnchor("test");
					}
				}
			}
		}
	}, "json");
}

/**
 * 搜索IMEI或主机编号
 */
function goSearch() {
	// $("#afui").popup("aaa");
	var value = $("#search").val();
	if (value.length == 0) {
		$("#afui").popup("请输入你要查找的IMEI号后六位...");
		// $("#search")[0].focus();//这一步可能会弹出输入法
		return null;
	}

	$.ui.showMask("正在搜索,请稍候...");
	$.post(WEBROOT + "/om/om/getDeviceStatus?search=" + value, {}, function(data, textStatus) {
		$.ui.hideMask(); // 取消mask
		if (data.result.resultCode == 3) {// session已将超时,不需要再发送请求.
			alert("会话超时,请重新登录...");
			window.location.reload();
			return;
		} else if (data.result.resultCode != 0) {
			$("#afui").popup({
				message : data.result.resultMessage,
				title : "提醒",
				cancelText : "取消",
				doneText : "确定"
			});
		} else { // 成功

			if (data.entity.length == 0) {
				$("#list").html("没有记录...");
				$("#list").show();
			} else { // 有数据
				ROWS = data.entity; // 复制全局变量
				var html = ("<p>\n" + "		输入的设备号是:\n" + "		<font color=\"red\" id=\"list_imei\">" + value + "		</font>\n" + "</p>\n");
				// 遍历重新封装数据
				IDARR = new Array(); // 记录id
				OBJARR = new Array(); // 记录对象
				for (var i = 0; i < data.entity.length; i++) {
					if (IDARR.in_array(data.entity[i].terminalid)) { // 在数组中
						// OBJARR[OBJARR.length-1].push(data.entity[i]);//存入最后一个
					} else {
						var temp = new Array();
						temp.push(data.entity[i]);
						OBJARR.push(temp);
						IDARR.push(data.entity[i].terminalid);
					}
				}
				// 开始展示
				for (var i = 0; i < OBJARR.length; i++) {
					var status = "";
					if (OBJARR[i][0].status == "1") {
						status = "待发货";
					} else if (OBJARR[i][0].status == "2") {
						status = "待测试";
					} else if (OBJARR[i][0].status == "3") {
						status = "已测试";
					} else if (OBJARR[i][0].status == "4") {
						status = "已激活账号";
					} else if (OBJARR[i][0].status == "5") {
						status = "待检测维修";
					} else if (OBJARR[i][0].status == "6") {
						status = "已报废";
					}
					html += "<a onClick=\"showTest('" + OBJARR[i][0].imei + "');\"><ul class=\"list inset\" data-sim=\"0\" id=\"sim_" + OBJARR[i][0].imei + "\" >\n" + "		<li>\n" + "				IMEI:<font color=green>" + OBJARR[i][0].imei + "</font>\n" + "		</li>\n" + "		<li>\n" + "				主机编号:<font color=green>" + OBJARR[i][0].barcode + "</font>\n" + "		</li>\n" + "		<li>\n" + "				 终端状态<font color=orange>"
							+ status + "</font>\n" + "		</li>" + "</ul></a>";
				}
				$("#list").html(html);
				$("#list").show();
			}
		}
	}, "json");
}

function getArr(imei){
	var arr = [];
	for (var i = 0; i < ROWS.length; i++) {
		var obj = ROWS[i];
		if (obj.imei == imei) {
			arr.push(obj);
		}
	}
	return arr;
}

function getTerminalClientType(imei, arr){
	var terminal = getTerminalObj(imei, arr);
	if(terminal == null){
		return 0;
	}
	var clientType = terminal.clientType;
	return clientType;
}

function getTerminalObj(imei, arr){
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

function getHtmlData(imei, arr) {
	var obddigconn;
	var clientType = 0;
	if (arr.length != 0) { // 取出非attachment的数据
		var obj = getTerminalObj(imei, arr);
		if(obj == null){
			return false;
		}

		barcode = obj.barcode;
		if (obj.status == "1") {
			status = "待发货";
			$("#afui").popup({
				message : "<font color=red>设备未发货,无法测试!</font>",
				title : "提醒",
				cancelText : "取消",
				doneText : "确定"
			});
			return false;
		}
		/*
		 * else if (obj.status == "6") { status = "已报废"; $("#afui").popup({
		 * message : "<font color=red>设备已报废,无法测试!</font>", title : "提醒",
		 * cancelText : "取消", doneText : "确定" }); return false; }
		 */else if (obj.status == "2") {
			status = "待测试";
		} else if (obj.status == "3") {
			status = "已测试";
		} else if (obj.status == "4") {
			status = "已激活账号";
		} else if (obj.status == "5") {
			status = "待检测维修";
		}
		if (obj.gpsantenna == "0" || obj.gpsantenna == "") {
			gpsantenna = "<font color=orange>未知</font>";
		} else if (obj.gpsantenna == "1") {
			gpsantenna = "<font color=green>连接正常</font>";
		} else if (obj.gpsantenna == "2") {
			gpsantenna = "<font color=red>天线断开</font>";
		}
		if (obj.gpsstatus == "0" || obj.gpsstatus == "") {
			gpsstatus = "<font color=orange>未知</font>";
		} else if (obj.gpsstatus == "1") {
			gpsstatus = "<font color=green>在线</font>";
		} else if (obj.gpsstatus == "2") {
			gpsstatus = "<font color=red>不在线</font>";
		}
		if (obj.isonline == "0") {
			isonline = "<font color=red>不在线</font>";
		} else if (obj.isonline == "1") {
			isonline = "<font color=green>在线</font>";
		} else {
			isonline = "<font color=green>未知</font>";
		}
		if (obj.signalstrength == "" || obj.signalstrength <= 0) {
			signalstrength = "<font color=red>未知</font>&nbsp;<img src ='" + WEBROOT + "/OM/images/signal_0.png'></img>";
		} else {
			if (obj.signalstrength < 15) {
				signalstrength = "<font color=red>" + obj.signalstrength + "</font>&nbsp;<img src ='" + WEBROOT + "/OM/images/signal_1.png'></img>";
			} else if (obj.signalstrength < 20 && obj.signalstrength >= 15) {
				signalstrength = "<font color=red>" + obj.signalstrength + "</font>&nbsp;<img src ='" + WEBROOT + "/OM/images/signal_2.png'></img>";
			} else if (obj.signalstrength < 25 && obj.signalstrength >= 20) {
				signalstrength = "<font color=red>" + obj.signalstrength + "</font>&nbsp;<img src ='" + WEBROOT + "/OM/images/signal_3.png'></img>";
			} else if ( obj.signalstrength >= 25) {
				signalstrength = "<font color=red>" + obj.signalstrength + "</font>&nbsp;<img src ='" + WEBROOT + "/OM/images/signal_4.png'></img>";
			} 
			/* else if (obj.signalstrength >= 30) {
				signalstrength = "<font color=red>" + obj.signalstrength + "</font>&nbsp;<img src ='" + WEBROOT + "/OM/images/signal_5.png'></img>";
			}
			*/
		}
		if (obj.isonline == "0") {// 如果GSM不在线, 即使有信号数据,也是之前的信号数据,要显示为不在线
			signalstrength = "<font color=red>不在线</font>&nbsp;<img src ='" + WEBROOT + "/OM/images/signal_0.png'></img>";
		}
		var cjhm=obj.msisdn;
		if (obj.startnumber <= 0) {
			startnumber = "<font color=orange>未知</font>";
		} else {
			startnumber = "<font color=green>" + obj.startnumber + "</font>";
		}
		// 0:无效 1:开 2:关
		if (obj.acc == null || obj.acc == "") {
			acc = "<font color=orange>未知</font>";
		} else if (obj.acc == "0") {
			acc = "<font color=orange>无效</font>";
		} else if (obj.acc == "1") {
			acc = "<font color=green>开</font>";
		} else if (obj.acc == "2") {
			acc = "<font color=red>关</font>";
		}
		if (obj.obddigconn == null || obj.obddigconn == "") {
			obddigconn = "<font color=orange>未知</font>";
		} else if (obj.obddigconn == "0") {
			obddigconn = "<font color=orange>无效</font>";
		} else if (obj.obddigconn == "1") {
			obddigconn = "<font color=green>正常</font>";
		} else if (obj.obddigconn == "2") {
			obddigconn = "<font color=red>异常</font>";
		}

		clientType = obj.clientType;
	}

	var html = "";
	if(clientType == 17){//wg设备的
		html += "<li>GPS时间:<span class='hy_left'>" + obj.gpstime + "</span></li>";
		html += "<li>GPS位置<a class=\"button icon picture big\" onClick=\"showMap('" + obj.lng + "','" + obj.lat + "','" + obj.gpstime + "');\" style=\"float:right\">显示地图</a></li>";
	}else{//原来的
		html = "<li>主机编号:<span class='hy_left'>" + barcode + "</li><li>IMEI编号:" + $("#currentIMEI").val() + "</span></li>";
		html += "<li> 终端状态:<span class='hy_left'><font color=orange>" + status + "</font></span></li>";
		html += "<li>设备状态:<span class='hy_left'>" + isonline + "</span></li>";
		html += "<li>车机号码:<span class='hy_left' style='color:green'>" + cjhm + "</span></li>";
		html += "<li>GSM信号:<span class='hy_left'>" + signalstrength + "</span></li>";
		html += "<li>GPS天线状态:<span class='hy_left'>" + gpsantenna + "</span></li>";
		html += "<li>GPS状态:<span class='hy_left'>" + gpsstatus + "</span>  <a class=\"button icon picture big\" onClick=\"showMap('" + obj.lng + "','" + obj.lat + "','" + obj.gpstime + "');\" style=\"float:right\">显示地图</a></li>";
		html += "<li>卫星数量:<span class='hy_left'>" + startnumber + "</span></li>";
		html += "<li>ACC状态:<span class='hy_left'>" + acc + "</span></li>";
		html += "<li>OBD诊断连接状态:<span class='hy_left'>" + obddigconn + "</span></li>";
		
		// 处理外挂设备
		var obj = arr[0];
		for (var i = 0, count = 0; i < obj.a_name.split(";").length; i++) {
			if (obj.a_name.split(";")[i] != "") {
				count++;
				html += "<li>外挂设备" + (i + 1) + ":<span class='hy_left'><font color=green>" + obj.a_name.split(";")[i] + "</font>;&nbsp;版本:<font color=green>" + obj.a_version.split(";")[i] + "</font></span></li>";
			}
		}
		if (count == 0) {
			html += "<li><span style=\"color:green\">无外挂设备</span></li>";
		}
	}

	return html;
}

var myScroller;
$.ui.ready(function() {
	myScroller = $("#test").scroller(); // Fetch the scroller from cache
	// Since this is a App Framework UI scroller, we could also do
	// myScroller=$.ui.scrollingDivs['webslider'];
	myScroller.addInfinite();
	myScroller.addPullToRefresh();
	$.bind(myScroller, 'scrollend', function() {
	});

	$.bind(myScroller, 'scrollstart', function() {
	});

	$.bind(myScroller, "refresh-trigger", function() {
	});

	var hideClose;
	$.bind(myScroller, "refresh-release", function() {
		var that = this;
		clearTimeout(hideClose);
		hideClose = setTimeout(function() {
			that.hideRefresh();
		}, 50);
		return false; // tells it to not auto-cancel the refresh
	});

	$.bind(myScroller, "refresh-cancel", function() {
		clearTimeout(hideClose);
	});

	$.bind(myScroller, "refresh-finish", function() {
		refreshData();
	});

	myScroller.enable();

	if(!ROWS){
		goToAnchor("main");
	}
	// $("#webslider").css("overflow", "auto");
	
	setScrollerRefresh();
});

var myWGScroller;
function setScrollerRefresh(){
	myWGScroller = $("#wgTest").scroller(); // Fetch the scroller from cache
	// Since this is a App Framework UI scroller, we could also do
	// myScroller=$.ui.scrollingDivs['webslider'];
	myWGScroller.addInfinite();
	myWGScroller.addPullToRefresh();
	$.bind(myWGScroller, 'scrollend', function() {
	});

	$.bind(myWGScroller, 'scrollstart', function() {
	});

	$.bind(myWGScroller, "refresh-trigger", function() {
	});

	var hideClose;
	$.bind(myWGScroller, "refresh-release", function() {
		var that = this;
		clearTimeout(hideClose);
		hideClose = setTimeout(function() {
			that.hideRefresh();
		}, 50);
		return false; // tells it to not auto-cancel the refresh
	});

	$.bind(myWGScroller, "refresh-cancel", function() {
		clearTimeout(hideClose);
	});

	$.bind(myWGScroller, "refresh-finish", function() {
		refreshData();
	});

	myWGScroller.enable();
}
