
	engine.views.Returning = Backbone.View.extend({
		el: '#bookmark-popup',
		events: {
			'click .close': 'closeClicked',
			'click #btn-new': 'showNewSession',
			'click #btn-return': 'showLastSession'
	  	},
	  	initialize: function(){
			this.render();
	  	},
		render: function(){
			this.$el.modal('show');
			return this;
		},
		hidePopup: function(event) {
			this.$el.modal('hide');
		},
		closeClicked: function() {
			event.preventDefault();
			this.hidePopup();
		},
		showLastSession: function(event) {
			event.preventDefault();
			this.hidePopup();
			engine.tracking.trigger('returnlastSession');
		},
		showNewSession: function(event) {
			event.preventDefault();
			this.hidePopup();
			engine.tracking.trigger('returnCurrentSession');
		}
		
	});