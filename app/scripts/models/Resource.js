	engine.models.Resource = Backbone.Model.extend({
      defaults: {
		id: '',
        title: '',
		menuId: '',
		template: '',
		opened: false,
		type: 'internal',
		keyboardShortcut:'',
		url: '',
		content: {}
      }
    });