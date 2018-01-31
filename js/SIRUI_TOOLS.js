/**
 * 项目公共初始化操作
 */
$(function () {
  $('body').append('<div class="sirui_toast"></div>');
})
var SIRUI = {};
/**
 * toast 模块
 */
SIRUI.toast = function (text, backgourndColor) {
  var $toast = $('.sirui_toast');
  $toast.css('background', 'rgba(0, 0, 0, .7)');
  $('body').append('<div class="sirui_mask"></div>');
  if (backgourndColor) {
    $toast.css('background', backgourndColor);
  }
  $toast.html(text).addClass('show');
  setTimeout(function () {
    $toast.removeClass('show');
    $('.sirui_mask').remove();
  }, 1500);
}
/**
 * alert 模块
 * params: {
 *  title: '',
 *  text: '',
 *  callback: function () {}
 * }
 */
SIRUI.alert = function (params) {
  var html = '<div class="sirui_mask"><div class="sirui_alert"><h3 class="head">'+ params.title +'</h3><p class="txt">'+ params.text +'</p><div class="btn_wrap"><button class="ok_btn">确定</button></div></div></div>';
  $('body').append(html);
  var $okBtn = $('.sirui_alert .ok_btn');
  $okBtn.click(function () {
    $('.sirui_mask').remove();
    params.callback();
  });
}
/**
 * loadToast 模块
 */
SIRUI.showLoad = function (text) {
  var html = '<div class="sirui_mask"><div class="sirui_load_toast"><img src="./dist/images/loading.svg" alt=""><p class="txt">' + text + '</p></div></div>';
  $('body').append(html);
}

SIRUI.hideLoad = function (text) {
  $('.sirui_mask').remove();
}
/**
 * 获取URL参数模块
 */
SIRUI.getUrlParam = function (paraName) {
  var url = document.location.toString();
  var arrObj = url.split("?");

  if (arrObj.length > 1) {
    var arrPara = arrObj[1].split("&");
    var arr;

    for (var i = 0; i < arrPara.length; i++) {
      arr = arrPara[i].split("=");

      if (arr != null && arr[0] == paraName) {
        return arr[1];
      }
    }
    return "";
  }
  else {
    return "";
  }
};
