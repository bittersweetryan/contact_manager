
// Define the Hot Spots Controller Class, make sure undefined is undefined
!(function( InContact, $, undefined ){

	InContact.ContactsController = function( application, apiRoot, bottomOffset ){
		// Invoke super constructor (to create local copies of base properties).
		InContact.Controller.apply( this, [ application, apiRoot ] );
	
		// Get a reference to the object (for event binding).
		var self = this;
		
		// Get the appropriate DOM references.
		this.dom.window = $( window );
		this.dom.contact_list = $("#contact-list")
		
		// view contact template
		this.dom.templateContactInfo = $( "#view_contact_template" );
		
		// --- Event Bindings ------------------------------------------- //
		// -------------------------------------------------------------- //
				
		
		// Bind to the state change so that we can look at the mouse move when we need
		// to update the display and position of the shift-hint.
		this.bind(
			"statechange",
			function( newState, oldState ){

				//the UI for this app will have 3 states: edit, view, and add
				if (newState === "edit"){
			
				}
				else if(newState === "view"){

				}
				else if(newState == "add"){

				}
				else{

				}
			}
		);
			
		// Bind the form submission.
		this.dom.form.submit(
			function( event ){
				// Prevent default.
				event.preventDefault();
				
				// Check to see if we are responding to UI elements.
				if (!self.isResponsive){
					return;
				}
				
				// Save the form.
				self.saveForm();
			}
		);
	};
	
	// --- Class Methods -------------------------------------------- //
	// -------------------------------------------------------------- //
	// Set up the controller prototype.
	InVision.ContactsController.prototype = $.extend(
		{},
		new InVision.Controller(),
		{
			load: function(){
				$.ajax	
			}
		}
	);
	
})( window.InContact || {}, jQuery );