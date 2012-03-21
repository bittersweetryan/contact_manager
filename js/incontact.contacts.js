
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
		this.dom.dialog_delete = $("dialog_delete");
		
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
					$( this ).dialog( "close" );
				}
			},
			close: function() {
				$(this).find("input").val( "" );
			}
		});

		this.dom.dialog_delete.dialog({
			autoOpen: false,
			height: 400,
			width: 500,
			modal: true,
			buttons: {
				"OK": function() {
					self.deleteContact();
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			}
		});
	};
	
	// --- Class Methods -------------------------------------------- //
	// -------------------------------------------------------------- //
	// Set up the controller prototype.
	// ** Refer to the controller as "self" below **
	InContact.ContactsController.prototype = $.extend(
		{},
		new InContact.Controller(),
		{
			load: function(){
				

				$.ajaxSetup(this.ajax);

				$.ajax({
					data : {
						'method' : 'listAll'
					},
					url: this.ajax.url + '?method=listAll',
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

				$newElement.append(newContact)
					.find("div.contact_details")
					.hide();

				//I don't really advocate storing data in elements, but
				//in this case i think its a good solution
				if('id' in contact){
					$newElement.find(":first-child").data('contact',contact);
				}
				
				self.dom.contact_list.append($newElement);
			},

			filter : function(text){
				var contacts = this.dom.contact_list.find("li"),
					len = contacts.length,
					name = "";

				contacts.each(function(i){
					var $this = $(this);
					name = $this.find(".contact_name").html().toLowerCase();

					if(name.match(new RegExp('\\b' + text.toLowerCase()))){
						if(!$this.is(":visible")){
							$this.show(function(){

							});
						}
					}else{
						$this.hide();
					}

				});
			},

			searchFocus : function(){
				if(this.val() === this.get(0).defaultValue){
					this.val('');
				}
			},

			searchBlur : function(){
				if($.trim(this.val()) === ''){
					this.val(this.get(0).defaultValue);
				}
			},

			edit: function(){
				//when called this points to a contact element
				var contact = this.data('contact');

				self.setState('edit');

				//not sure I like this too much a new version of jqueryui can break this
				$("#ui-dialog-title-dialog_form").html("Edit Contact");

				self.dom.dialog_form.find("#fullName")
				.val(contact.fullName)
					.end()
				.find("#phone")
					.val(contact.phone)
						.end()
				.find("#email")
					.val(contact.email)
						.end()
				.find("#id")
					.val(contact.id)
						.end();

				self.dom.dialog_form.contact = contact;

				self.dom.dialog_form.dialog("open");
			},

			newContact : function(){
				var contact = this.blankContact();

				self.setState('new');

				//not sure I like this too much a new version of jqueryui can break this
				$("#ui-dialog-title-dialog_form").html("New Contact");

				self.dom.dialog_form.contact = contact;

				self.dom.dialog_form.dialog("open");
			},

			blankContact : function(){
				return {
					fullName : "",
					email : "",
					phone : ""
				};
			},

			save: function(){
				$.ajaxSetup(this.ajax);

				$.ajax({
					url: this.ajax.url + '?method=save',
					data : self.dom.dialog_form.find("form").toObject(),
					success : function(data){
						if(typeof data === 'object'){
							self.add(data.contact);
						}

						self.dom.dialog_form.dialog("close");
						
					},
					error : function(){
						console.log("oops");
					}
				});
			}
		}
	);
	
})( window.InContact || {}, jQuery );