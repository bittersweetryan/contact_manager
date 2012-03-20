
// Define the Hot Spots Controller Class, make sure undefined is undefined
!(function( InContact, $, undefined ){

	InContact.ContactsController = function( application, apiRoot, bottomOffset ){
		// Invoke super constructor (to create local copies of base properties).
		InContact.Controller.apply( this, [ application, apiRoot ] );
	
		// Get a reference to the object (for event binding).
		var self = this;
		
		// Get the appropriate DOM references.
		this.dom.window = $( window );
		this.dom.container = $("#contacts"); //overall wrapper for contacts app
		this.dom.search = this.dom.container.find("#search");  //search div
		this.dom.contact_list = this.dom.container.find("#contact-list"); //contact list ul
		this.dom.contact_template_view = $("#view_contact_template"); //template for a contact
		
		this.contacts = [];

		this.ajax = $.extend(
			{},
			InContact.ajaxDefaults,
			{
				url : "models/contact/Contact.cfc"
			}
		);

		//load the contacts
		this.load();

		// --- Event Bindings ------------------------------------------- //
		// -------------------------------------------------------------- //
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

		console.log(this.dom.contact_list);
		
		//listen for a contact details click
		this.dom.contact_list.on(
			"click",
			"a.contact_details",
			function(){
				self.showDetails.call($(this).parent().find("div.contact_details"));
			}
		);
	};
	
	// --- Class Methods -------------------------------------------- //
	// -------------------------------------------------------------- //
	// Set up the controller prototype.
	InContact.ContactsController.prototype = $.extend(
		{},
		new InContact.Controller(),
		{
			load: function(){
				this.ajax.url += '?method=listAll';

				$.ajaxSetup(this.ajax);

				$.ajax({
					data : {
						'method' : 'listAll'
					},
					success : self.showAll,
					error : function(){
						console.log("oops");
					}

				});
			},

			showDetails: function(){

				if(!this.is(":visible")){
					this.slideDown('slow') ;
				}
				else{
					this.slideUp('slow');
				}
			},

			showAll: function(data,textStatus,jqXHR){
				if(typeof data === 'object'){
					var len = data.length;

					for(var i = 0; i < len; i++){
						var contact = data[i];

						if('contact' in contact){
							self.add(data[i].contact);
						}
						else{
							console.log('error');
						}
					}
				}
				else{
					console.log("error");
				}
			},

			add : function(contact){
				var newContact = self.dom.contact_template_view.html();
				var $newElement = $("<li/>");

				if('email' in contact){
					newContact = newContact.replace(/\{email\}/g,contact.email);
				}

				if('fullName' in contact){
					newContact = newContact.replace(/\{name\}/g,contact.fullName);
				}

				if('phone' in contact){
					newContact = newContact.replace(/\{phone\}/g,contact.phone);
				}

				$newElement.append(newContact).find("div.contact_details").hide();

				self.dom.contact_list.append($newElement);
			}
		}
	);
	
})( window.InContact || {}, jQuery );