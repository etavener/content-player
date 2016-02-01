
var engine = {
	models: {},
	collections: {},
	views: {}
};

engine.Router = Backbone.Router.extend({
	routes: {
		'':  'defaultRoute',
		':courseId/': 'loadCourse',
		':courseId/:screenId': 'showScreen'
	},
	defaultRoute: function(){
		engine.debug.render('Router::defaultRoute');
		engine.mainView.loadAppData('default');
	},
	loadCourse: function(courseId) {
		engine.debug.render('Router::showCourse ' + courseId);
		engine.mainView.loadAppData(courseId);
	},
	showScreen: function(courseId, screenId) {
		engine.debug.render('Router::showScreen ' + screenId);
		engine.mainView.loadAppData(courseId, screenId);
	},
	showPop: function(screenId, resourceId) {
		// engine.app.set('screenId', screenId);
		// engine.app.set('resourceId', resourceId);
	}
});

// console.log('window.opener.top.API', window.opener.top.API);

/* Starts everything up by initialising the mainview (top level) */
$(function () {
	'use strict';
	$.ajaxSetup({ cache: false });
	engine.mainView = new engine.views.MainView();
	if(!engine.router) {
		engine.router = new engine.Router();
		Backbone.history.start();
		// Backbone.history.start({pushState: true, root: '/', hashchange: false});
	}
});