	engine.models.Screen = Backbone.Model.extend({
      defaults: {
		id: '',
        title: '',
        hide_title: false,
        hide_footer: false,
		template: 'text_image',
		menuId: '',
		transition: {
			type: 'fade',
			duration: 1,
			easein: 'linear',
			easeout: 'linear'
		},
		response: {},
        completed: false,
		complete_status: '',
		auto_complete: false,
		track_progress: true,
		backScreenId: '',
		nextScreenId: '',
		screen_indicator: 'auto',
		keyboardShortcut:'',
		groupId: '',
		content: {
			title:''	
		}
      }
    });