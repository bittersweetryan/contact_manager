/*****************
TODO:
	* set states properly
	* messaging
	* look for more caching
	* make sure that the initialize code is in $();
*****************/

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
		this.dom.new_contact_link = this.dom.container.find("a#newContact");
		this.dom.dialog_form = $("#dialog_form");
		this.dom.dialog_delete = $("#dialog_delete");

		this.contacts = [];

		this.ajaxDefaults = $.extend(
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

		//listen for a contact details click
		this.dom.contact_list.on(
			"click",
			"a.contact_details",
			function(){
				self.showDetails.call($(this).parent().find("div.contact_details"));
			}
		)
		.on(
			"click",
			"a.contact_edit",
			function(){
				self.edit.call($(this).parent().parent());
			}
		)
		.on(
			"click",
			"a.contact_delete",
			function(){
				if(confirm("Are you sure you want to delete this contact?")){
					self.processDelete.call($(this).parent().parent());
				}
			}
		);

		this.dom.search.on(
			"keyup",
			"input",
			function(){
				self.filter($(this).val());
			}
		);

		this.dom.search.find("input").on('focus',function(){
				self.searchFocus.call($(this));
			})
			.on('blur',function(){
				self.searchBlur.call($(this));
		});

		this.dom.new_contact_link.on("click",function(){
			self.newContact();
		});

		$("#editForm").validate();

//move this!
		this.dom.dialog_form.dialog({
			autoOpen: false,
			height: 400,
			width: 500,
			modal: true,
			buttons: {
				"Save": function() {
					self.save();
				},
				Cancel: function() {
					$(this).dialog( "close" );
				}
			},
			close: function(){
				$(this).find("input").val("");

				//when the dialog is closed we are always in view state
				self.setState('view');
			}
		});
	};

	// --- Class Methods -------------------------------------------- //
	// -------------------------------------------------------------- //
	// ** Always refer to the controller's scope as "self" below **
	InContact.ContactsController.prototype = $.extend(
		{},
		new InContact.Controller(),
		{
			//get a list of contacts from the server
			load: function(){
				
				$.ajaxSetup(self.ajaxDefaults);

				$.ajax({
					data : {
						'method' : 'listAll'
					},
					url: self.ajaxDefaults.url + '?method=listAll',
					success : self.showAll,
					error : function(){
						console.log("oops");
					}

				});
			},

			//shows & hides the details div
			showDetails: function(){

				if(!this.is(":visible")){
					this.slideDown('slow') ;
				}
				else{
					this.slideUp('slow');
				}
			},

			//shows all the contacts, used as a callback for the load's ajax method
			showAll: function(data,textStatus,jqXHR){
				//make sure that we have a json object
				if(typeof data === 'object'){
					//cache the length of the array
					var len = data.length;

					for(var i = 0; i < len; i++){
						//cache the current loop item
						var contact = data[i];

						//make sure the current item is a valid contact
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

			//adds a new contact to the list
			add : function(contact){
				//get the contact template
				var newContact = self.dom.contact_template_view.html();
				//create a li to append to the list
				var $newElement = $("<li/>");

				//populate the template
				if('email' in contact){
					newContact = newContact.replace(/\{email\}/g,contact.email);
				}

				if('fullName' in contact){
					newContact = newContact.replace(/\{name\}/g,contact.fullName);
				}

				if('phone' in contact){
					newContact = newContact.replace(/\{phone\}/g,contact.phone);
				}

				//add the template to the new li
				$newElement.append(newContact)
					.find("div.contact_details")
					.hide();

				//store the contact object within this element for later use
				//i don't usually advocate this sort of thing but givin the time constraint
				//this solution works
				if('id' in contact){
					$newElement.find(":first-child").data('contact',contact);
				}
				
				//add the new item to the DOM
				self.dom.contact_list.append($newElement);
			},

			filter : function(text){
				//get all the contact elements
				var contacts = this.dom.contact_list.find("li .contact"),
					len = contacts.length,
					contact;

				//loop through each item and look for a match
				contacts.each(function(i){
					var $this = $(this);
					//use each elements contact item
					contact = $this.data('contact');

					//check for a match, show any hidden elements that now match
					if(contact && contact.fullName.toLowerCase().match(new RegExp('\\b' + text.toLowerCase()))){
						if(!$this.is(":visible")){
							$this.parent().show();
						}
					}else{
						//doesn't match, hide the contact element
						$this.parent().hide();
					}

				});
			},

			//hide the default text when search gets focus
			searchFocus : function(){
				if(this.val() === this.get(0).defaultValue){
					this.val('');
				}
			},

			//reset the default text when search gets focus
			searchBlur : function(){
				if($.trim(this.val()) === ''){
					this.val(this.get(0).defaultValue);
				}
			},

			//initialize the edit form
			edit: function(){
				//when called this points to a contact element
				var contact = this.data('contact');

				//update the controllers state
				self.setState('edit');

				//not sure I like this too much a new version of jqueryui can break this
				$("#ui-dialog-title-dialog_form").html("Edit Contact");

				//update the form fields with the current contact's information,
				//not sure i like how much indenting is going on here
				self.dom.dialog_form.find("#fullName")
					.val(contact.fullName)
						.end()
							.find("#phone")
								.val(contact.phone)
									.end()
										.find("#email")
											.val(contact.email)
												.end()
													.find("#contactID")
														.val(contact.id);
				//show the dialog											
				self.dom.dialog_form.dialog("open");
			},

			processDelete : function(){
				var contact = this.data('contact');

				//setup the ajax request
				$.ajaxSetup(self.ajaxDefaults);

				//send the request to the server
				$.ajax({
					url: self.ajaxajaxDefaults.url + '?method=delete',
					data : {id : contact.id},
					success : function(data){
						if(typeof data === 'object' && 'success' in data){
							if(data.success){
								//remove the contact form the dom on success
								self.removeContact(contact.id);
							}
						}
						else{
							console.log("oops");
						}
					},
					error : function(){
						console.log("oops");
					}
				});
			},

			//removes a contact entry from the dom
			removeContact : function(contactID){
				//get a list of contacts
				var contacts = self.dom.contact_list.find("li div.contact"),
					len = contacts.length;

				//loop through the contacts to find a match
				contacts.each(function(i){
					var $this = $(this),
						contact = $this.data('contact');

					//if the id matches the contact we are trying to delete, remove it
					if(contact.id === contactID){
						//fade out the content
						$this.fadeOut(function(){
							//then remove the li from the dom
							$this.parent().remove();
						});
					}
				});
			},

			//initializes the contact form for a new contact
			newContact : function(){
				//create a new contact object
				var contact = self.blankContact();

				//set the state of the controller
				self.setState('new');

				//update the title of the form
				//not sure I like this too much a new version of jqueryui can break this
				$("#ui-dialog-title-dialog_form").html("New Contact");

				//show the dialog
				self.dom.dialog_form.dialog("open");
			},

			//create a new blank contact object
			blankContact : function(){
				return {
					fullName : "",
					email : "",
					phone : ""
				};
			},

			//updates the contact list items on successful save
			updateOnSave : function(contact){

				//get a list of the contact elements
				var contacts = self.dom.contact_list.find("li div.contact"),
					len = contacts.length;

				//loop through the contacts and look for a match
				contacts.each(function(i){
					//cache $(this)
					var $this = $(this),
						currentContact = $this.data('contact');  //get the contact from the element

					if(contact.id === currentContact.id){

						//update the display
						$this.find(".contact_name").html(contact.fullName)
							.end()
								.find(".contact_details_name span").html(contact.fullName)
									.end()
										.find(".contact_details_email span").html(contact.email)
											.end()
												.find(".contact_details_phone span").html(contact.phone);
						//update this items contact object
						$this.data('contact',contact);
					}
				});
			},

			//i save a contact on the server, the server is smart enough to know weather
			//to add a new item or update an existing one
			save: function(){
				//validate the form
				if(self.dom.dialog_form.find("form").valid()){
					
					//setup the ajax request
					$.ajaxSetup(self.ajaxDefaults);

					//call the server's save method
					$.ajax({
						url: self.ajaxDefaults.url + '?method=save',
						data : self.dom.dialog_form.find("form").toObject(),
						success : function(data){

							//if the server updates a contact it will return a success boolean and
							//a updated contact object
							if(typeof data === 'object' && 'contact' in data && 'success' in data){
								self.updateOnSave(data.contact);
							}
							//if the server just returns a contact object it added a new contact
							else if(typeof data === 'object' && 'contact' in data){
								self.add(data.contact);
							}
							else{
								//something unexpected happened
								console.log("error");
							}

							//close the dialog
							self.dom.dialog_form.dialog("close");
							
						},
						error : function(){
							console.log("oops");
						}
					});
				}
		
			}
		}
	);
	
})( window.InContact || {}, jQuery );