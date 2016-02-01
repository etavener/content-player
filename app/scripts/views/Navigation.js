/* displays menu links, next and back functionality etc. */

	engine.views.Navigation = Backbone.View.extend({
		el: '#main',
		events: {
			'click .pop.internal': 'resourceClicked'
			// 'click #back-btn': 'screenClicked',
			// 'click #next-btn': 'screenClicked'
		},
		initialize: function(){
			this.menus = engine.app.get('menus');
			if(this.menus){
				for(var m = 0; m < this.menus.length; m++){
					this.createLinks('#'+this.menus[m].id, this.menus[m].classes, this.menus[m].transition);
				}
			}
			this.render();
		},
		screenClicked: function(event){
			/* link to another screen is clicked */
			event.preventDefault();
			engine.mainView.trigger('goToScreenId', $(event.currentTarget).attr('data-target'));
		},
		resourceClicked: function(event){
			/* link to an internal pop-up/resource is clicked */
			event.preventDefault();
			engine.mainView.trigger('showResourceId', $(event.currentTarget).attr('data-target'));
		},
		next: function(){
			var nextIndex = engine.app.get('currentIndex')+1;
			if(nextIndex < engine.screens.length) {
				engine.mainView.trigger('goToScreenId', engine.screens.at(nextIndex).get('id'));
			}
		},
		createLinks: function(menuId, classes, transition){
			var menuEl = $(menuId);
			if(menuEl.length > 0){
				menuEl.addClass('hide').addClass('hide-menu');
				menuEl.attr('data-margin', Number($(menuId).css('marginLeft').replace('px', '')));
				var linkStr = '<ul class="link-menu '+ String(classes || '') +'">';
				engine.screens.each(function(model, index) {
					linkStr = linkStr + '<li class="link-item link-'+model.id+'">';
					linkStr = linkStr + '<a href="#'+engine.app.get('courseId')+'/'+model.id+'" class="action-toScreen" title="'+String(model.get('label') || '')+'" data-transiton="'+ String(transition || '') +'" >';
					// console.log('model', model);
					linkStr = linkStr + '<span class="link-label">' + String(model.get('label') || model.id) + '</span>';
					linkStr = linkStr + '</a>';
					linkStr = linkStr + '</li>';
				});
				linkStr = linkStr + '</ul>';
				menuEl.html(linkStr);
			}
		},
		updateLinks: function(menuId, currentScreenId, showlinks){
			if(showlinks && showlinks.length > 0){
				var menu = $(menuId);
				var linkItems = $(menuId+' .link-item');

				linkItems.addClass('hide').removeClass('current');
				for(var l = 0; l < showlinks.length; l++){
					$(menuId+' .link-'+showlinks[l].id).removeClass('hide');
				}
				$(menuId+' .link-'+currentScreenId).addClass('current');

				if($(menuId).hasClass('hide-menu')){
					$(menuId).removeClass('hide').removeClass('hide-menu');
					engine.screenView.transitionManager.animateOffset($(menuId), 'onShowStart', {opacity:0}, {opacity:1});
				}

			}else{
				if(!$(menuId).hasClass('hide-menu')){
					$(menuId).addClass('hide-menu');
					engine.screenView.transitionManager.animateOffset($(menuId), 'onHideStart', {opacity:1}, {opacity:0}, function(){
						$(menuId).addClass('hide');
					});
				}
			}
		},
		render: function(){
			// this.menus = {};
			this.chapterTitle = '';
			this.topicTitle = '';
			this.prevChapter = '';
			this.prevTopic = '';
			//Dynamic links (referenced in the models.)
			var that = this;
			engine.resources.each(function(model, index) {
				var classesString = 'pop';
				if(model.get('opened')){
					classesString = classesString+' opened';
				}
			});
			//update all the menus.
			var currScreen = engine.screens.at(engine.app.get('currentIndex'));
			if(this.menus){
				for(var s = 0; s < this.menus.length; s++){
					this.updateLinks('#'+this.menus[s].id, currScreen.id, currScreen.get(this.menus[s].id));
				}
			}
			//Next and Back buttons
			var backId = engine.screens.at(engine.app.get('currentIndex')).get('backScreenId');
			var nextId = engine.screens.at(engine.app.get('currentIndex')).get('nextScreenId');
			var courseId = engine.app.get('courseId');
			var index = engine.app.get('currentIndex');
			//if back and next not manually set then do automatically
			if(nextId ==='' && index < engine.screens.length-1 ){
				var nextIndex = index+1;
				nextId = engine.screens.at(nextIndex).get('id');
			}
			if(backId ==='' && index > 0 ){
				//if(engine.app.get('previousIndex') ===-1)
				//{
					engine.app.set('previousIndex', index-1);
				//}

				backId = engine.screens.at(engine.app.get('previousIndex')).get('id');
				engine.screens.at(engine.app.get('currentIndex')).set('backScreenId', backId);
			}
			var backBtn = this.$('#back-btn');
			var nextBtn = this.$('#next-btn');
			if(backId !=='' && backId !=='false'){
				backBtn.attr('href', '#'+courseId+'/'+backId);
				backBtn.attr('data-target', backId);
				backBtn.addClass('active').removeClass('disabled');
			}else{
				backBtn.attr('href', '');
				backBtn.attr('data-target', '');
				backBtn.addClass('disabled').removeClass('active');
			}
			if(nextId !=='' && nextId !=='false'){
				nextBtn.attr('href', '#'+courseId+'/'+nextId);
				nextBtn.attr('data-target', nextId);
				nextBtn.addClass('active').removeClass('disabled');
			}else{
				nextBtn.attr('href', '');
				nextBtn.attr('data-target', '');
				nextBtn.addClass('disabled').removeClass('active');
			}

			//listen for the scrollWheel
			if(engine.app.get('scrollWheel') === 'true'){
				$('body').unbind('mousewheel');
				$('body').on('mousewheel', function(event) {
					if(event.deltaY > 0){
						if(backId !== '' && backId !== 'false') {
							engine.mainView.trigger('goToScreenId', backId);
						}
					}else{
						if(nextId !== '' && nextId !== 'false') {
							engine.mainView.trigger('goToScreenId', nextId);
						}
					}
				});
			}
			//keypress
			$(document).unbind('keyup', this.keyPressed);
			$(document).on('keyup', this.keyPressed);
			engine.app.set('previousIndex', engine.app.get('currentIndex'));

			if(engine.progress){
				engine.progress.render();
			}

			var showMenus = $('.show-menu'),
				hideMenus = $('.hide-menu');

			hideMenus.each(function(index, element){
				var menuId = $(this).attr('data-target');
				$(element).hide();
			});
			showMenus.each(function(index, element){
				var menuId = $(this).attr('data-target');
				$('#'+menuId).hide();
				$(element).show();
			});
			showMenus.click(function(event){
				event.preventDefault();
				var menuId = $(this).attr('data-target');
				//show the menu
				$('#'+menuId).show();
				//hide this button
				$(this).hide();
				//show close bten
				$('.hide-menu[data-target="'+menuId+'"]').show();
			});
			hideMenus.click(function(event){
				event.preventDefault();
				var menuId = $(this).attr('data-target');
				//hide the menu
				$('#'+menuId).hide();
				//hide this button
				$(this).hide();
				//show menu bten
				$('.show-menu[data-target="'+menuId+'"]').show();
			});
		},
		keyPressed: function(e){
			var code = e.keycode || e.which;

			var key, s,
				shortcuts = $('.keyboard-shortcut');
			for(s = 0; s < shortcuts.length; s++){
				var shortcut = $(shortcuts[s]);
				key = Number(shortcut.attr('data-keycode'));
				target = shortcut.attr('data-target');

				if(code === key && target){
					var transition = (shortcut.attr('data-transition')) ? shortcut.attr('data-transition') : false;
					if(transition){
						engine.app.set('overrideTransition', transition);
					}else{
						engine.app.set('overrideTransition', 'false');
					}
					engine.mainView.trigger('goToScreenId', target);
				}
			}
		}
	});
