engine.collections.ScreenList = Backbone.Collection.extend({
      url: function(){
      	return 'content/' + engine.app.get('courseId') + '/data/screens.json';
      },
	  model: engine.models.Screen
    });