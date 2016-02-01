	/*TRACKING VIEW - Although it says it is a view it is really just a controller. */

	engine.views.Tracking = Backbone.View.extend({
		
		initialize: function(){
			engine.debug.render('Tracking initialize');
			this.listenTo(this, 'returnlastSession', this.returnToLastSession);
			this.listenTo(this, 'returnCurrentSession', this.returnToCurrentSession);
			
			//CONSTANTS
			this.SCORM_TRACKING = 'scorm';
			this.HTML_TRACKING = 'html';
			this.STATUS_COMPLETE = 'completed';
			this.STATUS_INCOMPLETE = 'incomplete';
			this.STATUS_NONE = '';
			this.STATUS_NOT_ATTEMPTED = 'not attempted'; //should never set this.

			this.trackingMessage = '';
			this.trackingType = engine.app.get('tracking');
			this.lastLocation = '';
			this.connected = false;

			this.first = '';
			this.last = '';
			this.cwid = '';
			
			var connected = this.connect();
			if(connected) {
				engine.debug.render('Tracking connected success');
				this.lesson_status = this.get('cmi.core.lesson_status');
				this.student_id = this.get('cmi.core.student_id');
				this.student_name = this.get('cmi.core.student_name');

				if(this.lesson_status ===this.STATUS_NOT_ATTEMPTED) {
					this.setLessonStatus(this.STATUS_INCOMPLETE);
				}

				this.getLastLocation();
			}

		},
		setSuspendData: function(dataStr){
			engine.debug.render('Tracking setSuspendData');
			var success = true;
			success = this.set('cmi.suspend_data', JSON.stringify(dataStr));
			if(success === true) {
				this.save();
			} else {
				this.trackingMessage = 'set cmi.core.suspend_data failed. success='+success;
			}
			return success;
		},
		getSuspendData: function(){
			engine.debug.render('Tracking getSuspendData');
			this.suspendData = this.get('cmi.suspend_data');
			if(this.suspendData && this.suspendData !== '' && this.suspendData !== null){
				return JSON.parse(this.suspendData);
			} else {
				return null;
			}
		},
		setLessonComplete: function(){
			this.setLessonStatus(this.STATUS_COMPLETE);
		},
		setLessonStatus: function(status){
			engine.debug.render('Tracking setLessonStatus');
			var success = this.set('cmi.core.lesson_status', status);
			if(success) {
				this.save();
			}
		},
		setLocation: function(){
			engine.debug.render('Tracking setLocation ');
			var success = true;
			success = this.set('cmi.core.lesson_location', engine.app.get('screenId'));
			if(success === true) {
				this.save();
			} else {
				this.trackingMessage = 'set cmi.core.lesson_location failed. success='+success;
			}
			return success;
		},
		getLastLocation: function(){
			engine.debug.render('Tracking getLastLocation ');
			this.lastLocation = '';
			if(engine.app.get('bookmarking') === 'true') {
				this.lastLocation = this.get('cmi.core.lesson_location');
				if(this.lastLocation && this.lastLocation !== '' && this.lastLocation !== null && this.lastLocation !== 'null'){
					engine.app.set('lastSessionScreen', this.get('cmi.core.lesson_location'));
					return this.lastLocation;
				}
			}
			return '';
		},
		debugMessage: function(msg, obj, obj2){
			// console.log(msg);
			// if(obj) console.log(obj);
			// if(obj2) console.log(obj2);
		},
		returnToLastSession: function(){
			engine.app.set('screenId', this.lastLocation);
			this.lastLocation = '';
			engine.mainView.render();
		},
		returnToCurrentSession: function(){
			engine.app.set('resourceId', '');
			engine.tracking.setLocation();
			this.lastLocation = '';
			engine.mainView.render();
		},
		render: function(){

		},
		connect: function(){
			var res = '';
			if(this.trackingType ===this.SCORM_TRACKING) {
				pipwerks.SCORM.version = '1.2';
				res = pipwerks.SCORM.init();
			}
			return res;
		},
		save: function(){
			var res = '';
			if(this.trackingType ===this.SCORM_TRACKING) {
				res = pipwerks.SCORM.save();
			}
			return res;
		},
		set: function(param, value){
			// console.log('set', param, 'to', value);
			var res = '';
			if(this.trackingType ===this.SCORM_TRACKING) {
				res = pipwerks.SCORM.set(param, value);
			}
			return res;
		},
		get: function(param){
			// console.log('get', param);
			var res = '';
			if(this.trackingType ===this.SCORM_TRACKING) {
				res = pipwerks.SCORM.get(param);
			}
			return res;
		},
		disconnect: function(){
			var res = '';
			if(this.trackingType ===this.SCORM_TRACKING) {
				res = pipwerks.SCORM.quit();
			}
			return res;
		}
		
	});