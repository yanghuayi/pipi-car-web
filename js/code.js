/**
 * 项目公共初始化操作
 */
$(function () {
  $('body').append('<div class="toast"></div>');
})
var SIRUI = {};
/**
 * toast 模块
 */
SIRUI.toast = function (text, backgourndColor) {
  var $toast = $('.toast');
  $toast.css('background', 'none');
  if (backgourndColor) {
    $toast.css('background', backgourndColor);
  }
  $toast.html(text).addClass('show');
  setTimeout(function () {
    $toast.removeClass('show');
  }, 1500);
}

