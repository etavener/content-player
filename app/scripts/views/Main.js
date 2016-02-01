/* top level view */

	engine.views.MainView = Backbone.View.extend({
		el: '#main',
		events: {
			'click .pop.internal': 'resourceClicked'
		},
		initialize: function(){
			if(!engine.debug) {
				engine.debug = new engine.views.Debug();
			}
			$(window).on('resize', this.getAppSize);
			this.on('templateLoaded', this.templateLoaded, this);
			this.on('updateProgress', this.updateProgress, this);
			this.on('setNextScreenId', this.setNextScreenId, this);
			this.on('goToScreenId', this.gotoScreenId, this);
			this.on('showResourceId', this.showResourceId, this);
			this.screenLoadedId = '';
		},
		loadAppData: function(courseId, screenId){
			if(!engine.app) {
				engine.app = new engine.models.App();
			}
			var currCourseId = engine.app.get('courseId');
			//set the courseId if it exists....
			if(courseId !== currCourseId) {
				engine.app.set('courseId', courseId);

				engine.app.fetch({
					success: function(model, response){
						//load the screen data
						engine.mainView.loadScreenData();
						engine.debug.render('App.json load success');
						if(screenId) {
							engine.app.set('screenId', screenId);
						}
					},
					error: function(model, response){
						engine.debug.render('App.json load error!');
					}
				});
			} else {
				engine.debug.render('Already got App.json');
				if(screenId) {
					engine.app.set('screenId', screenId);
				}
				engine.mainView.loadingComplete();
			}
		},
		loadScreenData: function(){
			engine.screens = new engine.collections.ScreenList();
			engine.screens.fetch({
				success: function(model, response){
					//load the resources data
					engine.mainView.loadResourceData();
					engine.debug.render('Screens.json load success');
				},
				error: function(model, response){
					engine.debug.render('Screens.json load error!');
				}
			});
		},
		loadResourceData: function(){
			engine.resources = new engine.collections.ResourceList();
			engine.resources.fetch({
				success: function(model, response){
					//all data has loaded
					engine.mainView.loadingComplete();
					engine.debug.render('Resources.json load success');
				},
				error: function(model, response){
					engine.debug.render('Resources.json load error!');
				}
			});
		},
		loadingComplete: function(){
			var interval;
			if($('#main').length === 0) {
				engine.debug.render('Load User Interface (Main.html)');
				//load the app.html file for this course
				var that = this;
				TemplateManager.get('content/' + engine.app.get('courseId') + '/main', function (tmp) {
					var appData = engine.app.attributes;
					$('body').append(tmp(appData));
					that.initTracking();
				});
			}else{
				engine.debug.render('User Interface already loaded (Main.html)');
				this.initTracking();
			}
		},
		initTracking: function(){
			engine.debug.render('initalise Tracking view.');
			/* initiate tracking if not already */
			if(!engine.tracking) {
				engine.tracking = new engine.views.Tracking();
				if(engine.app.get('saveData') === 'true'){
					var data = engine.tracking.getSuspendData();
					if(data && data !== null){
						engine.screens.each(function(screenModel, screenIndex) {
							var id = screenModel.get('id');
							if(data[id]){
								screenModel.set('response', data[id]);
							}
					  	});
					}
				}
			}
			this.startRender();
		},
		startRender: function(){
			var that = this;
			this.interval = setInterval(function(){
				clearInterval(that.interval);
				that.render();
			}, 500);
		},
		render: function(){
			engine.debug.render('Main.js Render');
			//remove any existing focus....
			if (document.activeElement && document.activeElement.nodeName.toLowerCase() !== 'body' ) {
				$(document.activeElement).blur();
			}

			document.title = engine.app.get('title');

			//THIS WAS BOOTSTRAP BUT NOW WE USE MATERIALIZE.
			// if(engine.app.get('popovers') === 'true'){
			// 	$('body').popover({selector: '[data-toggle=popover]', trigger: 'hover', placement:'top'});
			// }
			this.numberOfTemplates = 1;
			this.templatesLoaded = 0;
			if(engine.app.get('resourceId') !== '' && engine.app.get('screenId') !== this.screenLoadedId){
				this.numberOfTemplates = 2;
			}

			/* initiate tracking if not already */
			if(!engine.progress) {
				engine.progress = new engine.views.Progress();
			}
			/* if resource exists hide it*/
			if(engine.resourceView) {
				engine.resourceView.hideResource();
			}
			engine.app.updateScreenId();
			//create views
			if(engine.app.get('screenId') !== this.screenLoadedId){

				engine.screenView = new engine.views.ScreenView({model:engine.screens.at(engine.app.get('currentIndex'))});
				this.screenLoadedId = engine.app.get('screenId');
			}
			//show last location pop-up
			if(engine.tracking.lastLocation !== '' && engine.tracking.lastLocation !== 'null' && engine.tracking.lastLocation !== null && engine.app.get('returningPopId') !== '') {
				engine.returning = new engine.views.Returning();
			}
			// engine.router.navigate(engine.app.get('courseId') + '/' + engine.app.get('screenId'));
			engine.router.navigate(engine.app.get('courseId') + '/' + engine.app.get('screenId'));
			this.$el.scrollTop(0);


		},
		templateLoaded: function(){
			/* a template has been successfully loaded */
			this.templatesLoaded++;
			if(this.templatesLoaded === this.numberOfTemplates) {
				this.screenReady();
			}
		},
		screenReady: function(){
			$('body').addClass('ready');
			/* all tempalates are loaded and ready*/
			this.updateNavigation();

			var that = this;
			$('.internal-popup').click(function(event){
				event.preventDefault();
				that.showResourceId($(this).attr('data-resource') || $(this).attr('href').replace('#', ''));
			});

			var clickElements = $('body').find('.action-toScreen');

			//hide button if data-hide contains screenId
			var hideIds, elem, containsId = false;
			for(var c = 0; c < clickElements.length; c++){
				elem = $(clickElements[c]);
				elem.removeClass('hide');
				if(elem.attr('data-hide')){
					hideIds = String(elem.attr('data-hide')).split(',');
					if(hideIds && hideIds.length > 0){
						containsId = hideIds.indexOf(engine.app.get('screenId'));
						if(containsId > -1) {
							elem.addClass('hide');
						}
					}
				}

				elem.removeClass('current');
				//add class current if data-target is screenId
				if( elem.attr('data-target') && engine.app.get('screenId') === elem.attr('data-target')){
					elem.addClass('current');
				}
			}
			//engine.app.get('screenId')

			clickElements.unbind('click');
			clickElements.click(function(event){
				event.preventDefault();
				if(!$(this).hasClass('disabled')){
					var href = $(this).attr('href').substring(1, $(this).attr('href').length);
					var ids = href.split('/');
					var courseId = ids[0];
					var screenId = ids[1];
					var transition = ($(this).attr('data-transition')) ? $(this).attr('data-transition') : false;
					var direction = ($(this).attr('data-direction')) ? $(this).attr('data-direction') : false;
					if(transition){
						engine.app.set('overrideTransition', transition);
					}
					if(direction){
						engine.app.set('overrideDirection', direction);
					}
					if(engine.app.get('courseId') === courseId){
						engine.mainView.gotoScreenId(screenId, null);
					}else{
						//load the app again......
						//clear the current content.
						$('#main').remove();
						engine.screenView.clearTemplates();
						// console.log(courseId, screenId);
						if(screenId && screenId !== ''){
							engine.mainView.loadAppData(courseId, screenId);
						}else{
							// engine.app.set('screenId', screenId);
							engine.mainView.loadAppData(courseId);
						}

					}
				}
			});

			// $(".button-collapse").sideNav();

			var bgVideo = $('video.bg');
			if(Modernizr.video && bgVideo.length > 0){
				bgVideo.removeClass('hidden');
				bgVideo.get(0).play();
				bgVideo.get(0).volume = 0;
			}else{
				//show background image.
			}
		},
		gotoScreenId: function(screenId, delay){
			if(engine.resourceView){
				engine.resourceView.closeResource();
			}
			engine.app.set('screenId', screenId);
			if(delay){
				var that = this;
				this.delayInt = setInterval(function(){ engine.tracking.setLocation(); that.render(); clearInterval(that.delayInt);}, delay);
			}else{
				if(this.delayInt){
					clearInterval(this.delayInt);
				}
				engine.tracking.setLocation();
				this.render();
			}
			// engine.tracking.setLocation();
			// this.render();
		},
		showResourceId: function(resourceId){
			engine.app.set('resourceId', resourceId);
			engine.resources.each(function(model, index){
				if(model.get('id') === engine.app.get('resourceId')){
					engine.resourceView = new engine.views.ResourceView({model:model});
				}
			});
		},
		setNextScreenId: function(screenId){
			engine.screens.at(engine.app.get('currentIndex')).set('nextScreenId', screenId);
			this.updateNavigation();
		},
		updateNavigation: function(){
			if(!engine.navigation){
				engine.navigation = new engine.views.Navigation();
			}
			//IMPORTANT!!: i've set a delay on this to ensure that this transition happens after the main transition.
			//removing this will bugger up the transition on the menus..
			var interval = setInterval(function(){
				clearInterval(interval);
				engine.navigation.render();
			}, 10);
		}
	});

