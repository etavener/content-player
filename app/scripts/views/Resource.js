/* displays current internal resource (pop-ups) */

	engine.views.ResourceView = Backbone.View.extend({
		el: '#popup',
		events: {
			'click .close': 'closeClicked'
	  	},
	  	initialize: function(){
			this.render();
	  	},
		render: function(){
			this.model.set('opened', true);
			
			// this.$el.show();
			this.$el.modal('show');
			var view = this;
			this.$el.removeClass('loaded').addClass('loading');
			this.$('.modal-title').text(this.model.get('title'));
			TemplateManager.get('content/' + engine.app.get('courseId') + '/' + this.model.get('template'), function (tmp) {
				var content = view.model.get('content');
				content.courseId = engine.app.get('courseId');
				var html = tmp(content);
				view.$('.modal-body').html(html);
				view.$('.modal-body').attr('data-resource', view.model.get('id'));
				engine.mainView.trigger('templateLoaded');
				//wait a moment and then change status from loading to loaded...
				view.interval = setInterval(function(){
				view.$el.removeClass('loading').addClass('loaded');
				clearInterval(view.interval);
				}, 200);
			});

			return this;
		},
		hideResource: function(){
			this.$el.removeClass('loaded');
			// this.$el.hide();
			this.$el.modal('hide');
			// engine.router.navigate('screen/'+engine.app.get('screenId')); 
			engine.mainView.trigger('resourceClosed');
		},
		closeResource: function(){
			engine.app.set('resourceId', '');
			this.hideResource();
		},
		closeClicked: function(event){
			event.preventDefault();
			this.closeResource();
		}
		
	});
