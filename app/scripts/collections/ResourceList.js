	engine.collections.ResourceList = Backbone.Collection.extend({
		url: function(){
			return 'content/' + engine.app.get('courseId') + '/data/resources.json';
		},
	  	model: engine.models.Resource
    });