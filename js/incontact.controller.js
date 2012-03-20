
// Define the base Controller class.
!(function( InContact, $, undefined ){

	InContact.Controller = function( application, apiRoot ){
		// I am the application which oversees all of the controllers.
		this.application = application;
		
		// I am the state of the current controller. By default, all controllers
		// start in the default state. Possible states depend on the sub-class.
		this.state = "default";
		// I am the collection of elements listening to events being triggers on this controller.
		this.eventListeners = [];
		
		// I am collection of DOM elements to which we want to cache jQuery references.
		this.dom = {};
	};
	
	
	// Set up the controller prototype.
	InVision.Controller.prototype = {
		
		// I bind event listeners to this controller.
		bind: function( eventType, handler ){
			// Add the event listeners.
			this.eventListeners.push(
				{
					eventType: eventType,
					handler: handler
				}
			);
		},
		
		
		// I return the current state.
		getState: function(){
			return( this.state );
		},
		
		
		// I hide this user interface module.
		hide: function(){
			// ... abstract method ...
		},
		
		
		// I set the isResponsive value (typically called by the application).
		setIsResponsive: function( isResponsive ){
			this.isResponsive = isResponsive;
		},
		
		
		// I set the state and announce a state change event.
		setState: function( state ){
			// Store the current state (to be used in our event publication).
			var oldState = this.state;
			
			// Store the new state.
			this.state = state;
			
			// Announce the new state change.
			this.trigger( "statechange", [ state, oldState ] );
		},
		
		
		// I show this user interface module.
		show: function(){
			// ... abstract method ...
		},
		
		
		// I announce the given event on this controller.
		trigger: function( eventType, eventArguments ){
			var self = this;
			eventArguments = eventArguments || [];
			
			// Loop over the event listeners to see if we have any that are subscribing to this
			// event type on this controller.
			$.each(
				this.eventListeners,
				function( index, eventListener ){
					
					// Check for the event type.
					if (eventType == eventListener.eventType){
						
						// Invoke the event listener using THIS object as the context.
						eventListener.handler.apply( self, eventArguments );
						
					}
				
				}
			);
		}
		
	};
	
})( window.InVision || {}, jQuery );