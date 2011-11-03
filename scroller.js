exports = (function(){return this;})();

(function($, undefined){
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
  
  var bind = function(func, ctx){ // _.bind
    var args = Array.prototype.slice.call(arguments, 2)
    return function(){func.apply(ctx, args)}
  }  
  
  var $viewport = $elem.parent().parent()
    , $scroller = $viewport.find('.yj-scroller').css('height', height)
    , $scrollbar = $("<div class='yj-mockscroll'><div class='yj-mockscroll-bar' /></div>").appendTo($viewport)
    , docScrollTop = -1
    , doc = document.documentElement
    , body = document.body
    , marginRight = null
    , dwidth = function(){
      return $.browser.msie ? $(body).width() : $(doc).width()
    }
    
    // Lock the window's scroll
    , disableWindowScroll = function(){
        var initialWidth = dwidth()
        marginRight = body.style.marginRight
        docScrollTop = doc.scrollTop;
        doc.style.overflow = 'hidden';
        body.scroll = "no";
        body.style.marginRight = (dwidth() - initialWidth) + 'px';  
        // Setting it to 'hidden' resets scrollTop in FF/IE
        doc.scrollTop = docScrollTop;
      }
      
     // unlock window scroll  
     , enableWindowScroll = function(){       
        doc.style.overflow = 'auto';
        body.scroll = "";
        body.style.marginRight = marginRight || 'auto';
        doc.scrollTop = docScrollTop;
        docScrollTop = -1
      }
    
    /*
    * Stick methods onto an object so we can control scroller programatically
    */  
    , scroller = {
      
        hide: bind($scrollbar.fadeOut, $scrollbar, 'slow')
      , show: bind($scrollbar.fadeIn, $scrollbar, 20)
      
      , timeout : null // Used to hide the bar on mouseout

      /*
      * Based on the position of the $elem within the viewport,
      * position a scrollbar down the side, and size it proportionally
      * to the size of the internal element.
      */
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
      
      /*
      * Inverse of calculate
      * 
      * Given the y inset of the mouse from the top of the viewport
      * scroll the $elem to the point it would be if the scrollbar was
      * centered on the mouses y-position.
      */
      , uncalculate: function(ydiff){
        
         var hiddenHeight = Math.max($elem.height() - $viewport.height(), 1)
            , scrollbarheight = Math.max((1/(hiddenHeight+100) * 100) * $viewport.height(), 10)
            , top =  hiddenHeight * ((ydiff-padding-scrollbarheight/2)/($viewport.height() - scrollbarheight - 2*padding))
        
        $scroller.scrollTop(top)        
        scroller.calculate() // Move bar
      }
      
      , mouseover: function(e){
          if (scroller.timeout) 
            clearTimeout(scroller.timeout);
          scroller.calculate()
          scroller.show()   
          if (docScrollTop == -1)
            disableWindowScroll()
        }
      , mouseout: function(e){
          if (!scroller.dragBar && !$(e.relatedTarget || e.target).parents().is('.yj-scroller-viewport')){            
            scroller.timeout = setTimeout(scroller.hide, 100)
            enableWindowScroll();
          }  
        }
        
      , top: $.proxy($scroller.scrollTop, $scroller)
      , scrollToTop : bind($scroller.animate, $scroller, {scrollTop: 0}, 'fast')
      
      , scrollbarMousedown: function(e){
        scroller.dragBar = e.pageY
        
        $(body).bind({
            'mouseup.yj-scroller': scroller.scrollbarMouseup
          , 'mousemove.yj-scroller': scroller.barScroll 
          , 'selectstart.yj-scroller': function(e){e.preventDefault()} 
        })
        
      }
      
      /*
      * The mouseup for the scrollbar can be fired from anywhere
      * so be careful before assuming we can mousout.
      * 
      * Clear up events bound on mousedown
      */
      , scrollbarMouseup: function(e){
        delete scroller.dragBar;
        $(body).unbind('.yj-scroller')
        scroller.mouseout(e)
      }
      
      /*
      * an onscroll event for the scroll bar
      */
      , barScroll : function(e){
        if (scroller.dragBar == null)
          return;
        
        scroller.uncalculate(e.pageY - $viewport.offset().top)  
      }
      
      /**
      * Users can drag-scroll across the hidden element.
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
  
  /*
  * Bind the inner element with scroll events.
  */
  $viewport.bind({
     scroll: scroller.calculate
   , mouseover: scroller.mouseover
   , mouseout: scroller.mouseout
   , domchange : scroller.calculate
   , mousedown : scroller.preventSideScroll
   , touchmove : scroller.calculate // iOs
  })
  
  /*
  * Bind events onto the scrollbar
  * mice can drag it, but it shouldn't 
  * be draggable on touch devices
  */
  $scrollbar.bind({
   mousedown: scroller.scrollbarMousedown
  })
  
  return scroller;  
}

})($)
