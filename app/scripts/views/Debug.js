	
engine.views.Debug = Backbone.View.extend({
	render: function(msg){
		if((engine.app && engine.app.get('debug') === 'true') || !engine.app){
			if (window.console) { console.log(msg); }
		}
	}
});

