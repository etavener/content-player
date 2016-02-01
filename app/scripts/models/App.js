
	engine.models.App = Backbone.Model.extend({
		url: function(){
			return 'content/' + this.get('courseId') + '/data/app.json';
		},
		defaults: {
			baseUrl: 'http://localhost:9000/',
			courseId: '',
			title: '',
			debug: 'false',
			mode: 'interact',
			screenId: '',
			resourceId: '',
			currentIndex: 0,
			previousIndex: -1,
			currentComplete: 0,
			maxComplete: 0,
			total_indicator: '0',
			indicator_seperator: ' of ',
			lastSessionScreen: '',
			popovers: 'false',
			overrideTransition: 'false',
			overrideDirection: 'false',
			buttons: [
				{'id': 'next', 'label': 'Next', 'keycode': '40'},
				{'id': 'back', 'label': 'Back', 'keycode': '38'}
			],
			groups: []
		},
		updateScreenId: function(){
			var that = this;
			if(this.get('screenId') !== '') {
				 engine.screens.each(function(model, index) {
					if(model.get('id') === that.get('screenId')) {
						that.set('currentIndex', index);
					}
				});
			}else{
				this.set('screenId', engine.screens.at(this.get('currentIndex')).get('id'));
			}
			return this.get('screenId');
		},
		setCompleted: function(screenId){
			var that = this;
			engine.screens.each(function(model, index) {
				if(model.get('id') === screenId) {
					model.set('completed', true);
				}
			});
		},
		checkCompleted: function(screenId){
			var that  = this, completed = false;
			engine.screens.each(function(model, index) {	
				if(model.get('id') === screenId) {
					completed = model.get('completed');
				}
			});
			return completed;
		},
		getScreenById: function(screenId){
			var that = this, screenModel;
			engine.screens.each(function(model, index) {
				if(model.get('id') === screenId) {
					screenModel = model;
				}
			});
			return screenModel;
		},
		getGroup: function(groupId){
			if(!engine.groups)
			{
				engine.groups = new engine.collections.GroupList(this.get('groups'));
			}
			var grp;
			engine.groups.each(function(model, index) {
				if(model.get('id') === groupId) {
					grp = model;
				}
			});
			return grp;
		}
    });
