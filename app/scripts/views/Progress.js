/*progress view */

	engine.views.Progress = Backbone.View.extend({
		el: '#module-progress',
		initialize: function(){
			engine.maximum = 0;
			engine.screens.each(function(model, index) {
				if(model.get('track_progress') === 'true') {
					engine.maximum++;
				}
			});
			this.render();
	  	},
		render: function(){

			engine.count = 0;
			engine.position = 0;
			engine.screens.each(function(model, index) {

				if(model.get('track_progress') === 'true') {
					if(model.get('completed')) {
						engine.count++;
					}
				}
			});

			var m = 100/engine.maximum;
			var c = Math.round(engine.count*m);

			// this.$('.progress-bar').html('<div class="fill complete"></div><div class="fill incomplete"></div>');
			// this.$('.fill.complete').css({width: c+'%'});
			// this.$('.fill.incomplete').css({width: i+'%'});
			// this.$('.percentNumber').text(Math.round(c));

			this.$('.progress-bar').css({width: c+'%'});
			
			
	
			return this;
		}
	});
