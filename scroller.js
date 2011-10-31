
(function($, _, JSON, undefined){
/*  
  
  Make a fake scrollbar. 

  Pass in the element you wish to scroll, and the height of
  the viewport, and it will setup a mock scroller, similar
  to facebooks


*/
var exports = exports || window;

var disableWindowScroll = function(){
  var doc = document.documentElement
    , body = document.body
    , initialWidth = $(doc).width()
    
  docScrollTop = doc.scrollTop;
  doc.style.overflow = 'hidden';
  body.scroll = "no";
  body.style.marginRight = ($(doc).width() - initialWidth) + 'px';          
  // Setting it to 'hidden' resets scrollTop in FF/IE
  doc.scrollTop = docScrollTop;
}

var enableWindowScroll = function(){
  var doc = document.documentElement
    , body = document.body
    
  // unlock window scroll
  doc.style.overflow = 'auto';
  body.scroll = "";
  body.style.marginRight = 'auto';
  doc.scrollTop = docScrollTop;
}

exports.mockScroller = function($elem, height){
  
  $elem = $($elem)
    .wrap('<div class="yj-scroller-viewport" />')
    .wrap('<div class="yj-scroller" />')
    
  
  var $viewport = $elem.parent().parent()
    , $scroller = $viewport.find('.yj-scroller').css('height', height)
    , $scrollbar = $("<div class='yj-mockscroll' />").appendTo($viewport)
    , docScrollTop = -1
    , scroller = {
      
        hide: _.bind($scrollbar.fadeOut, $scrollbar, 'slow')
      , show: _.bind($scrollbar.fadeIn, $scrollbar, 20)
      , timeout : null

      , calculate: function(e){
        var hiddenHeight = Math.max($elem.height() - $viewport.height(), 1)
          , scrollbarheight = Math.max((1/(hiddenHeight+100) * 100) * $viewport.height(), 10);
          
        $scrollbar.animate({
            top : ($scroller.scrollTop() / hiddenHeight) * ($viewport.height() - scrollbarheight - 10) + 5
          , height : scrollbarheight
        }, 20)
        
        return scrollbarheight;
      }
      , mouseover: function(){
          if (scroller.timeout) 
            clearTimeout(scroller.timeout);
          scroller.calculate()
          scroller.show()          
          disableWindowScroll()
        }
      , mouseout: function(){
          scroller.timeout = setTimeout(scroller.hide, 100)
          enableWindowScroll();
        }
        
      , top: $.proxy($scroller.scrollTop, $scroller)
      , scrollToTop : _.bind($scroller.animate, $scroller, {scrollTop: 0}, 'fast')
    }
  
  $elem.bind({
     scroll: scroller.calculate
   , mouseover: scroller.mouseover
   , mouseout: scroller.mouseout
   , domchange : scroller.calculate
  })
  
  return scroller;  
}

})($, _, JSON)

