/* displays the current screen */

	engine.views.ScreenView = Backbone.View.extend({
	  el: '#screen',
	  events: {

	  },
	  initialize: function(){
	  	// this.transitions = ['none', 'fade', 'slide', 'scroll'];
	  	// this.htmlClasses = {
	  	// 	ANIMATION_STARTED: 'animation-started',
	  	// 	ANIMATION_COMPLETE: 'animation-complete',
	  	// 	ANIMATING: 'animating'
	  	// };
	  	this.currentBackground = '';
		this.listenTo(this, 'complete', this.screenCompleted);
		this.listenTo(this, 'lessonComplete', this.lessonCompleted);
		this.on('getResponse', this.getResponse);
		this.on('getAllResponses', this.getAllResponses);
		this.on('setResponse', this.setResponse);
		this.on('setMode', this.setMode);

		var that = this;

		if(!this.transitionManager) {
			this.transitionManager = new Util.TransitionManager();
		}

		this.loadBackgroundImages();
	  },
	  addTransition: function(){
		this.transitionManager.before(this.model.get('transition').type);
	  },

	  getResponse: function(event){
	  	var screenId = event[0];
	  	engine.screens.each(function(model, index) {
	  		if( model.get('id') === screenId ) {
	  			var newEvent = jQuery.Event( 'onResponsesReceived' );
				newEvent.screenId = screenId;
				newEvent.response = model.get('response');
	  			$('.content.current .template').trigger(newEvent);
	  		}
	  	});
	  },
	  getAllResponses: function(event){
  		var screensData = [];
  		engine.screens.each(function(model, index) {
  			var data = {id:model.get('id'), response: model.get('response')};
  			screensData.push(data);
  		});
  		var newEvent = jQuery.Event( 'onAllResponsesReceived' );
  		newEvent.responses = screensData;
  		$('.content.current .template').trigger(newEvent);
	  },
	  setMode: function(event) {
	  	engine.app.set('mode', event);
	  },
	  setResponse: function(event) {
	  	if(engine.app.get('saveData') === 'true'){
			var screenId = event[0];
			var response = event[1];
			var data = {};
			engine.screens.each(function(model, index) {
				if( model.get('id') === screenId ) {
					model.set('response', response);
				}
				var currResponse = model.get('response');
				if(currResponse && currResponse !== ''){
					data[model.get('id')] = model.get('response');
				}
			});

			engine.tracking.setSuspendData(data);
	  	}
	  },
	  startTransition: function(){
	  	var duration = (this.model.get('transition')) ? this.model.get('transition').duration : 1;
	  	this.transitionManager.start(duration, this.model.get('transition').easout, this.model.get('transition').easin);
	  },
	  updateScreenHolderSize: function(){
	  	//set the minheight as the document height
	  	$('#screen-holder').css('min-height', function(){
	  		return $(window).height();
	  	});
	  	//set height as height of the .content.current.
	  	//$('#screen-holder').height($('.content.current').outerHeight() + $('.footer').outerHeight() + 50);
	  },
	 //  removeAllTransitions: function(element){
		// for(var t = 0; t < this.transitions.length; t++) {
		// 	element.removeClass('trans-' + this.transitions[t]);
		// }
	 //  },
	  backgroundImageLoaded: function(event){
	  	var view = event.data;
	  	view.numLoaded++;
		if(view.backgroundImages && view.numLoaded === view.backgroundImages.length) {
			view.backgroundImagesComplete();
		}
	  },
	  loadBackgroundImages: function(callback){
	  	if(!this.backgroundImages){
	  		this.numLoaded = 0;
	  		this.backgroundImages = [];
		  	//create an array of iamges to preload.
		  	var that = this, 
		  		backgroundURL;
		  	engine.screens.each(function(model, index) {
		  		backgroundURL = model.get('background');
		  		if(backgroundURL && backgroundURL !== ''){
		  			var img = $('<img src="' + backgroundURL + '">');
		  			if(that.backgroundImages.indexOf(img) === -1){		
		  				that.backgroundImages.push(img);
		  			}
		  		}
		  	});

		  	//start loading each image.
		  	for(var b = 0; b < this.backgroundImages.length; b++){
		  		var currImg = this.backgroundImages[b];
				currImg.bind('load', this, this.backgroundImageLoaded);
		  		if(currImg.width) { 
		  			currImg.trigger('load');
		  		}
		  	}
		  	if(this.backgroundImages.length === 0){
		  		this.backgroundImagesComplete();
		  	}
		  } else{
		  	this.backgroundImagesComplete();
		  }
	  },
	  backgroundImagesComplete: function(){
		if($('.content').length === 0){
			this.loadStart(0);
		} else {
			this.render();
		}
	  },
	  clearTemplates: function(){
	  	this.$('#screen-holder').empty();
	  },
	  loadStart: function(index){
	  	this.$el.removeClass('loaded').addClass('loading');
	  	engine.debug.render('Start loading index ' + index);
	  	this.loadScreen(engine.screens.at(index), index);
	  },
	  loadScreen: function(screenModel, count){
	  	var screenHolder = this.$('#screen-holder'), 
	  		that = this;

	  	engine.debug.render('Loading screen template ' + count);

	  	var baseUrl = engine.app.get('baseUrl');

		TemplateManager.get('content/' + engine.app.get('courseId') + '/' + screenModel.get('template'), function (tmp) {
			var contentData = screenModel.get('content');
			contentData.id = screenModel.get('id');
			contentData.screenid = screenModel.get('id');
			contentData.courseId = engine.app.get('courseId');
			
			screenHolder.append( '<div id="screen-' + contentData.id + '" data-index="' + count + '" class="content animation-complete"></div>' );
			var screenEl = $('#screen-' + contentData.id);
			screenEl.append('<div class="container"></div>');
			var containerEl = $(screenEl).find('.container');

			// $(templateEl).screenId = contentData.id;
			var templateEl = $(tmp(contentData)).addClass('template').attr('data-id', contentData.id).attr('id', 'template-' + contentData.id);

			// $(templateEl).trigger('onCreation');
			containerEl.append(templateEl);
			// $(templateEl).screenId = contentData.id;
			var newEvent = jQuery.Event( 'onCreation' );
			newEvent.contentData = contentData;
			$(templateEl).trigger(newEvent, contentData.id);

			//any elements in template with this class goes to next screen.
			$(templateEl).find('.action-next').click(function(event){
				event.preventDefault();
				engine.navigation.next();
			});

			that.updateScreenHolderSize();
			$(templateEl).resize(function(event){
				that.updateScreenHolderSize();
			});
			$(window).resize(function(event){
				that.updateScreenHolderSize();
			});

			if(count < (engine.screens.length - 1)){
				var newIndex = count + 1;
				that.loadStart(newIndex);
			} else {
				that.loadingComplete();
			}
		});
	  },
	  loadingComplete: function(){
	  	//all screens are now loaded and ready (but not visible)
		engine.mainView.trigger('templateLoaded');
		this.addTransition();
		//screenEl = screenHolder.find('#screen-'+view.model.get('id'));
		var view = this;
		//wait a moment and then change status from loading to loaded...
		this.interval = setInterval(function(){
			view.$el.removeClass('loading').addClass('loaded');
			clearInterval(view.interval);
			view.render();
		}, 200);

		engine.debug.render('All loading complete');
	  },
	  render: function(){
		engine.app.set('currentId', this.model.get('id'));
		//this.$('#screen-title').text(this.model.get('title'));

		var screenHolder = this.$('#screen-holder');
		var currentContent = screenHolder.find('.content.current');
		var previousContent = screenHolder.find('.content.previous');
		if(previousContent) {
			//this.removeAllTransitions(previousContent)
			previousContent.removeClass('previous');
		}
		if(currentContent) {
			currentContent.removeClass('current').addClass('previous');
		}
		// var view = this;
		//check to see if the screen already exists
		var screenEl = screenHolder.find('#screen-'+this.model.get('id'));
		if(screenEl.length) {
			screenEl.addClass('current');
			engine.mainView.trigger('templateLoaded');
			this.$el.removeClass('loading').addClass('loaded');
			this.addTransition();
			this.startTransition();
		} else {
			engine.debug.render('Screen does not exist.');
		}

		var backgroundURL = this.model.get('background');
		if(backgroundURL && backgroundURL !== this.currentBackground) {
			//set the background of this element.
			this.$el.addClass('background');
			this.$el.css('background-image', 'url(' + backgroundURL + ')');
			this.currentBackground = backgroundURL;
		} else {
			if(!backgroundURL) {
				//set the background of this element.
				this.$el.removeClass('background');
				this.$el.css('background-image', 'none');
			}
		}
		
		// var topicTitle = '';
		// var chapterTitle = '';
		// this.$('#topic-title').text('');
		// this.$('#chapter-title').text('');
		// this.$('#topic-title').hide();
		// this.$('#chapter-title').hide();
		// this.$('.breadcrumb').hide();

		if(this.model.get('hide_title') ==='true') {
			this.$('#course-title').hide();
		}else{
			this.$('#course-title').show();
		}

		if(this.model.get('hide_footer') ==='true') {
			this.$('#nav').animate({opacity:0}, 1000);
		}else{
			this.$('#nav').removeClass('hide').animate({opacity:1}, 1000);
		}



		// if(topicTitle !=='' && chapterTitle !=='') {
		// 	this.$('.breadcrumb').show();
		// }
		
		// this.$('#topic-title').show();
		
		// if(topicTitle !==''){
		// 	this.$('#topic-title').html(topicTitle);
		// }
		// if(chapterTitle !==''){
		// 	this.$('#chapter-title').show();
		// 	this.$('#chapter-title').html(chapterTitle);
		// }
		

		//if auto_complete then set the screen to complete...
		if(this.model.get('auto_complete') ==='true'){
			$('#complete-instruction').show();
			this.screenCompleted();
		}

		return this;
	  },
	  updateGroupTitle: function(titleDivID, groupId){
		// this.$('#'+titleDivID).text('');
		// if(groupId !=='')
		// {
		// 	var group = engine.app.getGroup(groupId);
		// 	this.$('#'+titleDivID).show();
		// 	this.$('#'+titleDivID).text(''+group.get('title'));
		// }else{
		// 	this.$('#'+titleDivID).hide();
		// }
	  },
	  lessonCompleted: function(){
	  	engine.tracking.setLessonComplete();
	  },
	  screenCompleted: function(){
		//if now already comlete then....
		var screenId = engine.app.get('screenId');
		if(!engine.app.checkCompleted(screenId)) {
			engine.app.setCompleted(screenId);
		}
	  }
    });
