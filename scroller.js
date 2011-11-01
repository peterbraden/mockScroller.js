exports = (function(){return this;})();

(function($, _, undefined){
/*  
  
  Make a fake scrollbar. 

  Pass in the element you wish to scroll, and the height of
  the viewport, and it will setup a mock scroller, similar
  to facebooks


*/

exports.mockScroller = function($elem, height, padding){
  
  padding = padding || 5
  
  $elem = $($elem)
    .wrap('<div class="yj-scroller-viewport" />')
    .wrap('<div class="yj-scroller" />')
    
  
  var $viewport = $elem.parent().parent()
    , $scroller = $viewport.find('.yj-scroller').css('height', height)
    , $scrollbar = $("<div class='yj-mockscroll'><div class='yj-mockscroll-bar' /></div>").appendTo($viewport)
    , docScrollTop = -1
    , doc = document.documentElement
    , body = document.body
    , marginRight
    , disableWindowScroll = function(){
        var initialWidth = $(doc).width()
        marginRight = body.style.marginRight

        docScrollTop = doc.scrollTop;
        doc.style.overflow = 'hidden';
        body.scroll = "no";
        body.style.marginRight = ($(doc).width() - initialWidth) + 'px';          
        // Setting it to 'hidden' resets scrollTop in FF/IE
        doc.scrollTop = docScrollTop;
      }
     , enableWindowScroll = function(){
        // unlock window scroll
        doc.style.overflow = 'auto';
        body.scroll = "";
        body.style.marginRight = marginRight || 'auto';
        doc.scrollTop = docScrollTop;
      }
    , scroller = {
      
        hide: _.bind($scrollbar.fadeOut, $scrollbar, 'slow')
      , show: _.bind($scrollbar.fadeIn, $scrollbar, 20)
      , timeout : null

      , calculate: function(e){
        var hiddenHeight = Math.max($elem.height() - $viewport.height(), 1)
          , scrollbarheight = Math.max((1/(hiddenHeight+100) * 100) * $viewport.height(), 10);
          
        $scrollbar.css({
            top : ($scroller.scrollTop() / hiddenHeight) * ($viewport.height() - scrollbarheight - 2*padding) + padding
          , height : scrollbarheight
        })
        $scroller.parent().scrollLeft(0)
        return scrollbarheight;
      }
      
      // inverse of calculate
      , uncalculate: function(ydiff){
        
         var hiddenHeight = Math.max($elem.height() - $viewport.height(), 1)
            , scrollbarheight = Math.max((1/(hiddenHeight+100) * 100) * $viewport.height(), 10)
            , bartop = $scrollbar.position().top + ydiff
            , top =  hiddenHeight * ((bartop-padding)/($viewport.height() - scrollbarheight - 2*padding))
        
        $scroller.scrollTop(top)        
        scroller.calculate() // Move bar
      }
      
      , mouseover: function(){
          if (scroller.timeout) 
            clearTimeout(scroller.timeout);
          scroller.calculate()
          scroller.show()          
          disableWindowScroll()
        }
      , mouseout: function(){
          if (scroller.dragBar)
            return;
            
          scroller.timeout = setTimeout(scroller.hide, 100)
          enableWindowScroll();
        }
        
      , top: $.proxy($scroller.scrollTop, $scroller)
      , scrollToTop : _.bind($scroller.animate, $scroller, {scrollTop: 0}, 'fast')
      
      , scrollbarMousedown: function(e){
        scroller.dragBar = e.clientY
        
        $(body).bind({
            'mouseup.yj-scroller': scroller.scrollbarMouseup
          , 'mousemove.yj-scroller': scroller.barScroll 
          , 'selectstart.yj-scroller': function(e){e.preventDefault()} 
        })
        
      }
      
      , scrollbarMouseup: function(e){
        delete scroller.dragBar;
        $(body).unbind('.yj-scroller')
        if (!$viewport.find(e.target).length)
          scroller.mouseout()
      }
      
      , barScroll : function(e){
        if (scroller.dragBar == null)
          return;
        
        scroller.uncalculate(e.clientY - scroller.dragBar)  
        scroller.dragBar = e.clientY
      }
      
      /**
      * User's can drag-scroll across the hidden element.
      * Sadly, we don't get a scroll event for this, so this uber-hacky
      * method adds a global mouse handler to cancel any horizontal 
      * scroll when a mousedown in the $elem occurs
      */
      , preventSideScroll: function(){
        $(body).bind({
            'mouseup.yj-scroller': function(){$(body).unbind('.yj-scroller')}
          , 'mousemove.yj-scroller': function(){$scroller.parent().scrollLeft(0)}
          , 'selectstart.yj-scroller': function(e){e.preventDefault()} 
        })
                
      }
      
    }
  
  $elem.bind({
     scroll: scroller.calculate
   , mouseover: scroller.mouseover
   , mouseout: scroller.mouseout
   , domchange : scroller.calculate
   , mousedown : scroller.preventSideScroll
  })
  
  $scrollbar.bind({
     mouseover: scroller.mouseover
   , mouseout: scroller.mouseout
   , mousedown: scroller.scrollbarMousedown
  })
  
  return scroller;  
}

})($, _)
