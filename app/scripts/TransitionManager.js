var Util = Util || {};

Util.TransitionManager = (function () {
	function TransitionManager() {
		this.init();
	}
	TransitionManager.prototype.init = function(){
		//init the class

	};
	TransitionManager.prototype.getProperties = function(){
		//init the class
		var prevProps = {left:'0px', top:'0px', opacity:0, rotationY:0, translateZ:0, rotationX:0},
			currProps = {left:'0px', top:'0px', opacity:0, rotationY:0, translateZ:0, rotationX:0};
		this.transition = (engine.app.get('overrideTransition') !== 'false') ? engine.app.get('overrideTransition') : this.defaultTransition;
		this.direction = (engine.app.get('overrideDirection') !== 'false') ? engine.app.get('overrideDirection') : this.defaultDirection;
		switch(this.transition) {
			case 'none':
				//no transition
				break;
			case 'fade':
				//fade transition
				break;
			case 'slide-3d':
				// currProps.opacity = 1;
				// prevProps.opacity = 1;
				//no break because we want to do the slide too
				if(this.direction === 'forward') {
					// currProps.left = this.docWidth+(this.docWidth/2)+'px';
					currProps.transformOrigin = '50% 50% ' + (0-this.docWidth);
					currProps.rotationY = 90;
					currProps.translateZ = (0-this.docWidth);
				} else {
					// currProps.left = (0-(this.docWidth/2))+'px';
					currProps.transformOrigin = '50% 50% ' + (0-this.docWidth);
					currProps.rotationY = -90;
					currProps.translateZ = (0-this.docWidth);
				}
				if(this.previousContent.length) {
					if(this.direction === 'forward') {
						// prevProps.left = (0-(this.docWidth/2))+'px';
						prevProps.transformOrigin = '50% 50% ' + (0-this.docWidth);
						prevProps.rotationY = -90;
						prevProps.translateZ = (0-this.docWidth);
					} else {
						// prevProps.left = this.docWidth+(this.docWidth/2)+'px';
						prevProps.transformOrigin = '50% 50% ' + (0-this.docWidth);
						prevProps.rotationY = 90;
						prevProps.translateZ = (0-this.docWidth);
					}
				}
				break;
			case 'slide':
				//slide transition
				if(this.direction === 'forward') {
					currProps.left = (this.docWidth*2)+'px';
				} else {
					currProps.left = (0-this.docWidth)+'px';
				}
				if(this.previousContent.length) {
					if(this.direction === 'forward') {
						prevProps.left = (0-this.docWidth)+'px';
					} else {
						prevProps.left = (this.docWidth*2)+'px';
					}
				}
				break;
			case 'scroll-3d':
				if(this.direction === 'forward') {
					// currProps.left = this.docWidth+(this.docWidth/2)+'px';
					currProps.transformOrigin = '50% 50% ' + (0-this.docHeight);
					currProps.rotationX = -90;
					currProps.translateZ = -100;
				} else {
					// currProps.left = (0-(this.docWidth/2))+'px';
					currProps.transformOrigin = '50% 50% ' + (0-this.docHeight);
					currProps.rotationX = 90;
					currProps.translateZ = -100;
				}
				if(this.previousContent.length) {
					if(this.direction === 'forward') {
						// prevProps.left = (0-(this.docWidth/2))+'px';
						prevProps.transformOrigin = '50% 50% ' + (0-this.docHeight);
						prevProps.rotationX = 90;
						prevProps.translateZ = -100;
					} else {
						// prevProps.left = this.docWidth+(this.docWidth/2)+'px';
						prevProps.transformOrigin = '50% 50% ' + (0-this.docHeight);
						prevProps.rotationX = -90;
						prevProps.translateZ = -100;
					}
				}
				break;
				//no break because we want to do the scroll too.
			case 'scroll':
				//scroll transition
				if(this.direction === 'forward') {
					currProps.top = (this.docHeight)+'px';
				} else {
					currProps.top = (0-this.docHeight)+'px';
				}
				if(this.previousContent.length) {
					if(this.direction === 'forward') {
						prevProps.top = (0-this.docHeight)+'px';
					} else {
						prevProps.top = (this.docHeight)+'px';
					}
				}
				break;
			default:
				//default
		}
		return {prev:prevProps, curr:currProps};
	};
	TransitionManager.prototype.before = function(defaultTransition){
		//before we animate
		this.defaultTransition = defaultTransition;
		this.docHeight = $(document).height();
	  	this.docWidth = $(document).width();
		this.screenHolder = $('#screen-holder');
		this.currentContent = this.screenHolder.find('.content.current');
		this.previousContent = this.screenHolder.find('.content.previous');
		this.currIndex = Number(this.currentContent.attr('data-index'));
		this.prevIndex = Number(this.previousContent.attr('data-index'));

		this.currentId = String(this.currentContent.attr('id')).replace('screen-', '');
		this.previousId = String(this.previousContent.attr('id')).replace('screen-', '');

		// this.forward = (this.currIndex < this.prevIndex) ? false : true;
		this.defaultDirection = (this.currIndex < this.prevIndex) ? 'back' : 'forward';
		this.duration = 1000;
		this.initOffset();
		this.props = this.getProperties();
		window.scrollTo(0,0);
		if(this.previousContent){
			this.previousContent.addClass('animation-started').removeClass('animation-complete');
			TweenMax.set(this.previousContent, {left:'0px', top:'0px', opacity:1, rotationY:0, translateZ:0, rotationX:0});
			// this.previousContent.css({left:'0px', top:'0px', opacity:1, rotationY:0, translateZ:0});
			this.triggerEvent(this.previousContent, 'onHideStart', this.currentId, this.previousId);
		}

		this.currentContent.addClass('animation-started').removeClass('animation-complete');
		TweenMax.set(this.currentContent, this.props.curr);
		// this.currentContent.css(this.props.curr);
		this.triggerEvent(this.currentContent, 'onShowStart', this.currentId, this.previousId);
	};
	TransitionManager.prototype.start = function(duration, easout, easin){
		//start animating
		this.animateProps = this.getProperties();
		$('#footer').removeClass('hidden').removeClass('in');
		if(this.previousContent) {
			TweenMax.to(this.previousContent, 1, this.animateProps.prev);
		}
		$('body').addClass('animating');

		TweenMax.to(this.currentContent, 1, {left:'0px', top:'0px', opacity:1, rotationY:0, translateZ:0, rotationX:0, onCompleteParams:[this], onComplete:this.complete});
	};
	TransitionManager.prototype.complete = function(that){
		//animation has completed
		$('body').removeClass('animating');
		that.currentContent.addClass('animation-complete').removeClass('animation-started');
		that.triggerEvent(that.currentContent, 'onShowComplete', that.currentId, that.previousId);

		if(that.previousContent){
			that.previousContent.addClass('animation-complete').removeClass('animation-started');
			that.triggerEvent(that.previousContent, 'onHideComplete', that.currentId, that.previousId);
		}
		//$('#screen-holder').height($('.content.current').outerHeight() + $('.footer').outerHeight() + 50);
		//$('#footer').removeClass('hide').addClass('in');
		engine.app.set('overrideTransition', 'false');
		engine.app.set('overrideDirection', 'false');
	};
	TransitionManager.prototype.initOffset = function(){
		this.offsets = $('.transition-offset');
		var item;
		for(var f = 0; f < this.offsets.length; f++){
			item = $(this.offsets[f]);
			if(!item.attr('data-marginleft')){
				var mLeft = (item.css('marginLeft') !== 'auto') ? item.css('marginLeft') : 0;
				item.attr('data-marginleft', String(mLeft).replace('px', ''));
			}
            if(!item.attr('data-margintop')){
            	var mTop = (item.css('marginTop') !== 'auto') ? item.css('marginTop') : 0;
            	item.attr('data-margintop', String(mTop).replace('px', ''));
            }
		}
	};
	TransitionManager.prototype.animateOffset = function(screenEl, event, startProps, endProps, clback){
        var offsets = $(screenEl).hasClass('transition-offset') ? $(screenEl) : $(screenEl).find('.transition-offset'),
			startCSS = startProps || {},
			endCSS = endProps || {};

		this.clback = null;
		if(clback){
			this.clback = clback;
		}

        for(var c = 0; c < offsets.length; c++){
            var item =  $(offsets[c]);

            var offset = item.attr('data-offset') ? Number(item.attr('data-offset')) : 0;

            var mtop = Number(item.attr('data-margintop'));
            var mleft = Number(item.attr('data-marginleft'));

            var pos = (this.transition === 'scroll' || this.transition === 'scroll-3d') ? mtop : mleft;

            var amount = (this.direction === 'forward') ? pos+offset : pos+offset;
            var startPos = (event === 'onShowStart') ? amount : pos;
            var endPos = (event === 'onHideStart') ? amount : pos;

            if(this.transition === 'scroll' && this.transition === 'scroll-3d'){
            	startCSS.marginLeft = mleft+'px';
            	startCSS.marginTop = startPos+'px';
            	endCSS.marginTop = endPos+'px';
            }
            if(this.transition === 'slide' && this.transition === 'slide-3d'){
            	startCSS.marginLeft = startPos+'px';
            	startCSS.marginTop = mtop+'px';
            	endCSS.marginLeft = endPos+'px';
            }

            TweenMax.set(item, startCSS);
			// item.css(startCSS);
			// item.animate(endCSS, {duration:this.duration, easing:'linear', complete: this.offsetComplete});
			endCSS.onComplete = this.offsetComplete;
			endCSS.onCompleteParams = [this];
			TweenMax.to(item, 1, endCSS);

        }
	};
	TransitionManager.prototype.offsetComplete = function(that){
		if(that.clback){
			that.clback();
			that.clback = null;
		}
	};
	TransitionManager.prototype.triggerEvent = function(contentEl, evString, currentId, previousId){
		if(contentEl.length > 0){
		  	var newEvent = jQuery.Event( evString );
			newEvent.mode = engine.app.get('mode');
			var screenId = $(contentEl).attr('id').replace('screen-', '');
			var sModel = engine.app.getScreenById(screenId);
			if(sModel){
				newEvent.response = sModel.get('response');
				newEvent.contentData = sModel.get('content');
			}
			newEvent.transition = this.transition;
			newEvent.direction = this.direction;
			newEvent.currentId = currentId;
			newEvent.previousId = previousId;
			var template = contentEl.find('.template');
		  	template.trigger(newEvent);
		  	if(evString === 'onShowStart' || evString === 'onHideStart'){
		  		this.animateOffset(template, evString);
		  	}
	  	}
	};

    return TransitionManager;
})();