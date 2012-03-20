
// Define the Hot Spots Controller Class, make sure undefined is undefined
(function( InVision, $, undefined ){

	InVision.ContactsController = function( application, apiRoot, bottomOffset ){
		// Invoke super constructor (to create local copies of base properties).
		InVision.Controller.apply( this, [ application, apiRoot ] );
	
		// Get a reference to the object (for event binding).
		var self = this;
		
		// Get the appropriate DOM references.
		this.dom.window = $( window );
		this.dom.formContainer = $( "#invision-hotspot-form-container" );
		this.dom.form = $( "#invision-hotspot-form" );
		this.dom.id = this.dom.form.find( ":input[ name = 'id' ]" );
		this.dom.x = this.dom.form.find( ":input[ name = 'x' ]" );
		this.dom.y = this.dom.form.find( ":input[ name = 'y' ]" );
		this.dom.width = this.dom.form.find( ":input[ name = 'width' ]" );
		this.dom.height = this.dom.form.find( ":input[ name = 'height' ]" );
		this.dom.screenID = this.dom.form.find( ":input[ name = 'screenID' ]" );
		this.dom.targetScreenID = this.dom.form.find( ":input[ name = 'targetScreenID' ]" );
		this.dom.isTemplateLink = this.dom.form.find( ":input[ name = 'isTemplateLink' ]" );
		this.dom.templateIDContainer = this.dom.form.find( "#invision-hotspot-form-template-id" );
		this.dom.templateID = this.dom.form.find( ":input[ name = 'templateID' ]" );
		this.dom.triggerTypeID = this.dom.form.find( ":input[ name = 'triggerTypeID' ]" );
		this.dom.isScrollTo = this.dom.form.find( ":input[ name = 'isScrollTo' ]" );
		this.dom.cancel = this.dom.form.find( "a.cancel" );
		this.dom.deleteLink = this.dom.form.find( "a.delete" );
		
		// Template form.
		this.dom.templateFormContainer = $( "#invision-template-toolbar" );
		this.dom.templateForm = $( "#templateForm" );
		this.dom.templateFormID = this.dom.templateForm.find( ":input[ name = 'id' ]" );
		this.dom.templateFormProjectID = this.dom.templateForm.find( ":input[ name = 'projectID' ]" );
		this.dom.templateFormScreenID = this.dom.templateForm.find( ":input[ name = 'screenID' ]" );
		this.dom.templateFormName = this.dom.templateForm.find( ":input[ name = 'name' ]" );
		this.dom.templateFormSave = this.dom.templateForm.find( "#saveNewTemplate" );
		this.dom.templateFormCancel = this.dom.templateForm.find( "#cancelNewTemplate" );
		
		// Template Item template.
		this.dom.templateTemplate = $( $( "script.template-template" ).html() );
		
		//this.dom.saveNewTemplate = $("#saveNewTemplate");
		//this.dom.cancelNewTemplate = $("#cancelNewTemplate");
		
		
		this.dom.pageTemplate = $( "#invision-hotspot-template-form-id" );
		this.dom.selectedTemplate = $( "#selected-template" );
		this.dom.pageTemplateProjectID = this.dom.pageTemplate.attr("rel");
		this.dom.hotSpotsContainer = $( "#screen-container" );
		this.dom.createNewTemplate = $( "#createNewTemplate" );
		// this.dom.editTemplateForm = $("#templateForm");
		
		this.dom.hoverShift = $( "div.hoverShift" );

		// Bulk template link.
		this.dom.bulkTemplateLink = $( "#applyBulkTemplates" );


		// I am the collection of hotspots for this screen. These are indexed by 
		// the ID of the hotspot.
		this.hotSpots = {};
		
		// I am the collection of additional paramters to add to the re-location.
		this.additionalParameters = {};
		
		// I am the AJAX request that will be used to persist hotspots.
		this.ajaxRequest = null;
		
		// I am the currently selected hotspost (used when re-positioning or resizing a hotspot).
		this.selectedMarker = null;
		
		// When the controller is initialized, hide the hotspots.
		this.hide();
		
		// Set a dragging flag
		this.isMouseMove = false;
		
		// --- Event Bindings ------------------------------------------- //
		// -------------------------------------------------------------- //
				
		
		// Bind to the state change so that we can look at the mouse move when we need 
		// to update the display and position of the shift-hint.
		this.bind(
			"statechange",
			function( newState, oldState ){

				// Check to see if we are in the "markers" state. This will be the only one in
				// which we want to track the movement.
				if (newState == "markers"){

					// Show the shift-click hint, but make it opaque.
					self.dom.hoverShift.stop().show().animate( {"opacity": 0}, 0 );
					

					// Start listening to the mousemove of on the hotspot container.
					self.dom.hotSpotsContainer.bind(
						"mousemove.shiftHint",
						function( event ){

							// Get the local mouse position.
							var mousePosition = self.getLocalPosition( event.pageX, event.clientY );
							
							// Update the shift-hint location.
							self.dom.hoverShift.css({
								left: (mousePosition.left-10 + "px"), 
								top: (mousePosition.top+20 + "px")
							});

						}
					);
					
					// Start listening on the hotspots.
					$( "a.hotspot" )
						.live(
							"mouseenter",
							function( event ){

								var hotspot = $( this );
								
								// Some guard logic????
								if (hotspot.is(".pending-hotspot") || self.isMouseMove) {
									return;
								}

								// Get the template ID (if any) that owns the given hotspot.				
								var templateID = (hotspot.attr( "data-template-id" ) || 0);
								
								// Check to see if this hotspot is using a template.
								if (templateID != 0){
				
									// Populate the shift hint.
									self.dom.hoverShift.find( "div.templateHint" )
										.find( "span.name" )
											.text( self.dom.pageTemplate.children( "li[ data-id = '" + templateID + "' ]" ).attr( "data-name" ) )
											.end()
										.show()
									;
				
								} else {
				
									// No template association - hide the hint.
									self.dom.hoverShift.find( "div.templateHint" ).hide();
				
								}
								
								// Get the local mouse position.
								var mousePosition = self.getLocalPosition( event.pageX, event.clientY );
								
								// Update the shift-hint location.
								self.dom.hoverShift.css({
									left: (mousePosition.left-10 + "px"), 
									top: (mousePosition.top+20 + "px")
								});
								
								// Only show the tooltip if we're in build mode
								if ($("#toggle-hot-spots").closest("li").is(".on")) {
									// Show the hint.
									self.dom.hoverShift.stop().animate({"opacity": .9}, 100);
								}
								
							}
						)
						.live(
							"mouseleave mouseout",
							function( event ){

								// Hide the hint.
								self.dom.hoverShift.stop().animate( {"opacity": 0}, 250 );

							}
						)
					;
					
				} else {

					// Tear down the mouse listening on the container.
					self.dom.hotSpotsContainer.unbind( "mousemove.shiftHint" );
					
					// Kill the mouse listening on the hotspots.
					$( "a.hotspot" ).die( "mouseenter mouseleave mouseout" );
					
					// Hide the shift-click hint.
					self.dom.hoverShift.stop().hide();
				
				} 

			}
		);
				
		
		// I am can be used to drag the markers or to draw a new one.
		this.dom.hotSpotsContainer.mousedown(
			function( event ){
				// Check to see if we are responding to UI elements.
				if (!self.isResponsive){
					return;
				}
				
				// Check to see if we are in the markers mode.
				if (self.state == "markers"){
					
					// Get the target of the click.
					var target = $( event.target );
					
					// Check to see if the target is a marker. If it is, then we are going to 
					// be moving the selected marker. If it is not, then we are going to be
					// drawing a new marker.
					if (target.is( ".hotspot" )){
					
						// We are going to be moving the current hotspot or resiging it. The user 
						// is clicking on the marker - prevent the default behavior so the image 
						// is not selected / highlighted.
						event.preventDefault();
					
						// Store the selected marker.
						self.selectedMarker = target;
						
						// Get the local position of the click.
						var clickPosition = self.getLocalPosition( event.pageX, event.clientY );
												
						// Get the current marker position.
						var markerPosition = self.selectedMarker.position();
						
						// Store the initial coordinates.
						self.selectedMarker.data( "startLeft", markerPosition.left );
						self.selectedMarker.data( "startTop", markerPosition.top );
						self.selectedMarker.data( "startpageX", event.pageX );
						self.selectedMarker.data( "startClientY", event.clientY );	
						
						// Check to see if the click is near the outer edge. If so, we are going to move
						// back into a resize, rather than a move.
						if (
							(clickPosition.left >= (markerPosition.left + self.selectedMarker.width() - 10)) &&
							(clickPosition.top >= (markerPosition.top + self.selectedMarker.height() - 10))
							){
							
							// Add the resize class.
							self.selectedMarker.addClass( "resizable-hotspot" );
							
							// Bind the mousemove event on the container to resize.
							self.dom.hotSpotsContainer.mousemove(
								function( event ){
									self.isMouseMove = true;
									return( self.resizeMarkerWithMouse( event ) );
								}
							);		
							
						} else {
							
							// Bind the mousemove event on the container to move.
							self.dom.hotSpotsContainer.mousemove(
								function( event ){
									self.isMouseMove = true;
									return( self.moveMarkerWithMouse( event ) );
								}
							);						
							
						}
					
					// When creating a new marker, only do this when the CTRL key is pressed
					// at the time of the click.
					//
					// NOTE: Removed CTRL key functionality for use with Mac.
					// ... event.ctrlKey ....
					} else {
					
						// We are going to be drawing a new hotspot - Prevent the default behavior so the 
						// image is not selected / highlighted.
						event.preventDefault();
						
						// Get the position of the click.
						var markerPosition = self.getLocalPosition( event.pageX, event.clientY );
						
						// Add a pending markers.
						self.selectedMarker = self.addMarker( 
							"", 
							(markerPosition.left - 2), 
							(markerPosition.top - 2), 
							0, 
							0 
						);
						
						// Store some default data with the hotspot to be used with the resize.
						self.selectedMarker.data( "startLeft", markerPosition.left-2 );
						self.selectedMarker.data( "startTop", markerPosition.top-2 );
						self.selectedMarker.data( "startpageX", event.pageX );
						self.selectedMarker.data( "startClientY", event.clientY );
						
						// Bind the mouse-move event to resize the current hotspot.
						self.dom.hotSpotsContainer.mousemove(
							function( event ){
								self.isMouseMove = true;
								return( self.resizeMarkerWithMouse( event ) );
							}
						);			
						
					}
					
				// Check to see if we are in form mode.				
				} else if (self.state == "form"){
				
					// Get the target marker.
					var marker = $( event.target );
				
					// Check to see if the marker is the target.
					if (!marker.is( ".hotspot" )){
					
						// The user is not clicking on a marker, so just let the click
						// do whatever it would naturally.
						return;					
					
					}
				
					// The user is clicking on the marker - prevent the default behavior
					// so the image is not selected / highlighted.
					event.preventDefault();
				
					// Store the selected marker.
					self.selectedMarker = marker;
					
					// Get the local position of the click.
					var clickPosition = self.getLocalPosition( event.pageX, event.clientY );
					
					// Get the current marker position.
					var markerPosition = self.selectedMarker.position();
					
					// Store the initial coordinates.
					self.selectedMarker.data( "startLeft", markerPosition.left );
					self.selectedMarker.data( "startTop", markerPosition.top );
					self.selectedMarker.data( "startpageX", event.pageX );
					self.selectedMarker.data( "startClientY", event.clientY );	
					
					// Check to see if the click is near the outer edge. If so, we are going to move
					// back into a resize, rather than a move.
					if (
						(clickPosition.left >= (markerPosition.left + self.selectedMarker.width() - 10)) &&
						(clickPosition.top >= (markerPosition.top + self.selectedMarker.height() - 10))
						){
						
						// Add the resize class.
						self.selectedMarker.addClass( "resizable-hotspot" );
						
						// Bind the mousemove event on the container to resize.
						self.dom.hotSpotsContainer.mousemove(
							function( event ){
								self.isMouseMove = true;
								return( self.resizeMarkerWithMouse( event ) );
							}
						);		
						
					} else {
						
						// Bind the mousemove event on the container to move.
						self.dom.hotSpotsContainer.mousemove(
							function( event ){
								self.isMouseMove = true;
								return( self.moveMarkerWithMouse( event ) );
							}
						);						
						
					}
					
				}			
			}
		);
		
		// I am used to end a marker move.
		this.dom.hotSpotsContainer.mouseup(
			function( event ){
				// Check to see if we are responding to UI elements.
				if (!self.isResponsive){
					return;
				}
				
				// Check to see if we are in activated mode. If so, the hot spots need
				// to link through to their target pages.
				if (self.state == "activated"){
				
					// Get the target of the click.
					var target = $( event.target );
					
					// Check to see if the target is a hotspot.
					if (target.is( ".hotspot" )){
						
						// Get the hotspot associated with this marker.
						var hotSpot = self.hotSpots[ target.attr( "rel" ) ];
						
						// Build up any additional paramters.
						var urlParams = [];
						
						// Add the additional parameters.
						$.each(
							self.additionalParameters,
							function( name, value ){
								if (value !== null){
									urlParams.push( name + "=" + value );
								}
							}
						);
						
						// Check for scroll top flag.
						if (hotSpot.isScrollTo){
							urlParams.push( "scrollTop=" + self.dom.window.scrollTop() );
						}
						
						// Relocate to screen.
						// If this is a "back" trigger type, then force that
						if (hotSpot.triggerTypeID == 4) {
							
							// Create a pattern to test for to make sure the referring page is within the console
							var patt=/\/console\/[0-9]+/gi;
							var cleanReferrer = patt.exec(document.referrer);
							
							// If we have a match and a returned value,… take us there
							if (cleanReferrer) {
								window.location.href = (cleanReferrer + "?" + urlParams.join( "&" ));
							}
							
						} else {
							// Else send the person where they're trying to go
							window.location.href = ("/console/" + hotSpot.targetScreenID + "?" + urlParams.join( "&" ));
						}
						
					}	
					
				// Check to see if we are in a form with a selected marker.
				} else if (
					(self.state == "form") &&
					self.selectedMarker					
					){
				
					// Unbind the mouse move event.
					self.dom.hotSpotsContainer.unbind( "mousemove" );
					
					// Remove the resize class.
					self.selectedMarker.removeClass( "resizable-hotspot" );
					
					// Get the selected marker.
					var marker = self.selectedMarker;
					
					// Clear the selected marker.
					self.selectedMarker = null;
					
					// Check to see what kind of marker we have. If it's an existing marker,
					// then save the position. If it's a pending marker then update the form.
					if (marker.is( ".pending-hotspot" )){
					
						// Update the form X,Y coordinates.
						self.dom.x.val( marker.position().left );
						self.dom.y.val( marker.position().top );
						self.dom.width.val( marker.width() );
						self.dom.height.val( marker.height() );
											
					} else {
					
						// Save the marker's position.
						self.saveMarkerPosition( marker );
					
					}
				
				// Check to see if we are in the markers mode and we have a 
				// selected marker. This might be a pending or existing marker.
				} else if ( self.selectedMarker ){
					
					// Unbind the mouse move event.
					self.dom.hotSpotsContainer.unbind( "mousemove" );
					
					// Remove the resize class.
					self.selectedMarker.removeClass( "resizable-hotspot" );
					
					// Get the selected marker.
					var marker = self.selectedMarker;
					
					// Clear the selected marker.
					self.selectedMarker = null;
										
					// Check to see if the SHIFT key is down. If it is, then just follow the click.
					// This is a short-cut so users don't have to de-toggle the hotspot to follow it.
					if (event.shiftKey){
						
						// Get the hotspot associated with this marker.
						var hotSpot = self.hotSpots[ marker.attr( "rel" ) ];

						// Build up any additional paramters.
						var urlParams = [];
						
						// Add the additional parameters.
						$.each(
							self.additionalParameters,
							function( name, value ){
								if (value !== null){
									urlParams.push( name + "=" + value );
								}
							}
						);
						
						// Check for scroll top flag.
						if (hotSpot.isScrollTo){
							urlParams.push( "scrollTop=" + self.dom.window.scrollTop() );
						}
						
						// Add hot spot flag.
						urlParams.push( "showHotSpots=1" );
						
						
						// Relocate to screen.
						// If this is a "back" trigger type, then force that
						if (hotSpot.triggerTypeID == 4) {
							
							// Create a pattern to test for to make sure the referring page is within the console
							var patt=/\/console\/[0-9]+/gi;
							var cleanReferrer = patt.exec(document.referrer);
							
							// If we have a match and a returned value,… take us there
							if (cleanReferrer) {
								window.location.href = (cleanReferrer + "?" + urlParams.join( "&" ));
							}
							
						} else {
							// Else send the person where they're trying to go
							window.location.href = ("/console/" + hotSpot.targetScreenID + "?" + urlParams.join( "&" ));
						}
					}				
					
					// Check to see what kind of marker we have. If it's an existing marker,
					// then save the position. If it's a pending marker, then the user just 
					// finished drawing it
					if (marker.is( ".pending-hotspot" )){
					
						// Update the form X,Y coordinates.
						self.dom.x.val( marker.position().left );
						self.dom.y.val( marker.position().top );
						self.dom.width.val( marker.width() );
						self.dom.height.val( marker.height() );
						
						
						// Show the form for the new marker.
						//hotSpot, id, x, y, width, height, targetScreenID, templateID, isScrollTo, triggerTypeID
						if (marker.width() > 20 && marker.height() > 20) {
							// Only show the form if the hot spot is at least 20x20
							self.showForm(
								"", 
								0, 
								marker.position().left, 
								marker.position().top,
								marker.width(),
								marker.height(),
								0,
								0,
								0,
								1
							);
						} else {
							// If the hot spot isn't at least 20x20, cancel it all together
							self.cancelForm();
						}
						return;					
					} else {
					
						// Save the marker's position.
						self.saveMarkerPosition( marker );
					
					}
				
				}
				
				self.isMouseMove = false;

			}
			
		);
	
		// Bind the double-click on the hotspots container.
		this.dom.hotSpotsContainer.click(
			function( event ){
				// Prevent default.
				event.preventDefault();
				
				if (self.isMouseMove) {
					self.isMouseMove = false;
					return;
				}
				
				// Check to see if we are responding to UI elements.
				if (!self.isResponsive){
					return;
				}
				
				//If the shift key is being held down, don't show the form
				if (event.shiftKey) {
					return;
				}
				
				// Check to see if the current state is the default (all aspects are hidden).
				if (self.state == "default"){
					
					// Ask the application to toggle the notes.
					// self.application.toggleNotes();
				
				// Check to see if the state is markers only (no form yet).
				} else if (self.state == "markers"){
				
					// Get the target of the click, to see if it is an existing marker.
					var target = $( event.target );
					
					// Check to see if this is an existin marker.
					if (target.is( ".hotspot" )){
						
						// We need to edit an existing hotspot. Get the current hotspot based on the marker id.
						var hotSpot = self.hotSpots[ target.attr( "rel" ) ];
						
						// Show the hotspot.
						self.showForm( target.attr("rel"), hotSpot.id, hotSpot.x, hotSpot.y, hotSpot.width, hotSpot.height, hotSpot.targetScreenID, hotSpot.templateID, hotSpot.isScrollTo, hotSpot.triggerTypeID );
					}
				
				// If nothing else, the form is visible. Unless the target of the 
				// click was the pending hotspot (indicating a move / resize action)
				// hide the form.
				} else if (
					(self.state == "form") &&
					!$( event.target ).is( ".pending-hotspot" )
					){
					
					// Close the template list
					self.toggleTemplateList(0)
					
					// Cancel the form.
					self.cancelForm();
					
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
		
		// Bind the cancel link.
		this.dom.cancel.click(
			function( event ){
				// Prevent default.
				event.preventDefault();
				
				// Check to see if we are responding to UI elements.
				if (!self.isResponsive){
					return;
				}
				
				// Cancel the form.
				self.cancelForm();
			}
		);
		
		// Bind the delete link.
		this.dom.deleteLink.click(
			function( event ){
				// Prevent default.
				event.preventDefault();
				
				// Check to see if we are responding to UI elements.
				if (!self.isResponsive){
					return;
				}
				
				// Check to make sure the user wants to delete.
				//if (confirm( "Delete this hot spot?" )){
				
					// Delete the hotspot.
					self.deleteHotSpot( self.dom.id.val() );
				
				//}
			}
		);
		
		// Bind to the change event on the page template select.
		/*this.dom.pageTemplate.change(
			function( event ){
				// Check to see if the value is create new template.
				if (this.value == "createNewTemplate"){
				
					// Create a new template option.
					self.createNewTemplate( self.dom.pageTemplate );
				
				} else {
				
					// Update the global hot spots.
					self.updateTemplateHotSpots();
				
				}
			}
		);*/
		
		this.dom.selectedTemplate.click(
			function( event ){
				event.preventDefault();	
				
				// Check to see if we are responding to UI elements.
				if (!self.isResponsive){
					return;
				}
				
				var currentState = $(this).closest("ul").find("li.hide").length;
				
				self.toggleTemplateList(currentState);
				
			}
		);
				
		//When another template is selected
		this.dom.pageTemplate.find("li.invision-templates > a.templateName").live("click",
			function( event ) {
				event.preventDefault();
				var thisTemplate = $(this).text();
								
				//Set the new template
				$("#selected-template").text(thisTemplate).click();
				
				// Update the global hot spots.
				self.updateTemplateHotSpots();
				
				if (thisTemplate == "-- No Template --") {
					$("#activeTemplateName").text("a");
				} else {
					$("#activeTemplateName").text("\"" + thisTemplate + "\"");
				}
			}
		);
		
		
		//When you click Create New Template
		this.dom.createNewTemplate.click(
			function( event ){
				event.preventDefault();
				
				// Check to see if we are responding to UI elements.
				if (!self.isResponsive){
					return;
				}
				
				self.setState("form");
				
				// Show the template.
				self.showTemplateForm();
			}
		);
		
		
		// When you cancel the template form.
		this.dom.templateFormCancel.click(
			function( event ){
				event.preventDefault();
				
				// Hide the template form.
				self.hideTemplateForm();
			}
		);
		
		
		//When you save the new template name
		this.dom.templateForm.submit(
			function( event ){
				event.preventDefault();
				
				// Check to make sure there is a name. 
				if (!self.dom.templateFormName.val().length){
					
					// If no name is entered, don't respond.
					return;
					
				}
				
				// Save the template form.
				self.saveTemplateForm();
				self.setState("markers");
				return;
				
			}
		);
		
		//When you click to edit a template
		$(".editTemplate").live("click", function(e) {
			
			// Prevent the default click event.
			e.preventDefault();
			
			// Get the current template item.
			var template = $( this ).closest( ".invision-templates" );
			
			// Set the state
			self.setState("form");
			
			// Edit the form.
			self.showTemplateForm( 
				template.attr( "data-id" ),
				template.attr( "data-name" )
			);
			
		});
		
		//When you click to delete a template
		$(".deleteTemplate").live("click", function(e) {
			
			// Prevent the default click event.
			e.preventDefault();
			
			// Confirm the delete of this template.
			if (confirm( "Are you sure you want to delete this template?" )){

				// Get the current template.
				var template = $( this ).closest( "li.invision-templates" );

				// Delete the template.
				self.deleteTemplate( 
					template.attr( "data-id" )
				);

			}
			
		});
		
		//When you click to duplicate a template
		$( "a.duplicateTemplate" ).live(
			"click",
			function( event ) {
			
				// Prevent the default click event.
				event.preventDefault();
				
				// Confirm the duplication of this template.
				if (confirm( "Duplicate this template and all of its hotspots?" )){
	
					// Get the current template.
					var template = $( this ).closest( "li.invision-templates" );
	
					// Duplicate the template.
					self.duplicateTemplate( 
						template.attr( "data-id" )
					);
	
				}
			
			}
		);
		
		// When one of the checkboxes is clicked for template association,
		// update the associations.
		$( "input.toggleTemplateAssociation" ).live( "click", function( event ){

			// Get the current template.
			var template = $( this ).closest( "li.invision-templates" );

			// Check to see if we are adding or removing the template association.
			if (this.checked){

				// Association the selected template.
				self.addTemplateAssociation( template.attr( "data-id" ) );
			
			} else {
			
				// Diassociate the selected template.
				self.removeTemplateAssociation( template.attr( "data-id" ) );
				
			}
			
		});
		
		// Bind to the changes in template association (since other modules
		// can announce this change).
		$( document ).bind(
			"templateassociated templatedisassociated",
			function( event ){

				// Make sure that this event is not originating from
				// this module and that the screen is the primary screen.
				if (
					(event.module === self) ||
					(event.screenID != self.dom.templateFormScreenID.val())
					){
					
					// Break the recursion.
					return;
					
				}
				
				// Find the right checkbox for the template association.
				var template = $( "li.invision-templates[ data-id = '" + event.templateID + "' ]" )
					.find( "input.toggleTemplateAssociation" ) 
				; 
				
				// Update the checked status of the checkbox.
				if (event.type === "templateassociated"){ 
					
					template.attr( "checked", "checked" );
					
				} else { 
				
					template.removeAttr( "checked" );
				
				}
				
				// Update the count.
				self.updateTemplateCount();
				
			}
		); 

		
		$("#learnMoreHotSpots").click(
			function(e) {
				e.preventDefault();
				$("#selected-template").click();
				self.openTemplateHelpModal();
			}
		);
		
		//When changing the target screen
		this.dom.targetScreenID.change(function() {
			var thisVal = $(this).val();

			if (thisVal != 0) {
				$("#invision-hotspot-form-save").removeAttr("disabled").removeClass("disabled");
			} else {
				$("#invision-hotspot-form-save").attr("disabled", "disabled").addClass("disabled");
			}
		});
		
		$("#invision-hotspot-form-scroll-info").click(function(e) {
			e.preventDefault();
			var thisMessage = $("#invision-hotspot-form-scroll-info-message");
			
			if (thisMessage.is(":hidden")) {
				thisMessage.show();
			} else {
				thisMessage.hide();
			}
			self.resizeForm(false);
		});
		
		// If the user clicks the template link checkbox, we need to toggle the templateID container.
		this.dom.isTemplateLink.click(
			function( event ){

				// Check to see if the box is checked.
				if (this.checked){
				
					// Show the templateID dropdown.
					self.dom.templateIDContainer.show();
					
					// Pre-select the first template that is applied to this page
					// if the first element is the one selected.
					if (self.dom.templateID[ 0 ].selectedIndex === 0){
					
						// Get the templates associated with the page.
						var associatedTemplates = self.getAssociatedTemplates();
						
						// Check to see if there are any templates.
						if (associatedTemplates.length){

							// Pre-select the first element.
							self.dom.templateID.find( "option[ value = '" + associatedTemplates[ 0 ].id + "' ]" ).attr(
								"selected",
								"selected"
							);

						}
						
					}
				
				} else {
				
					// Hide the templateID dropdown.
					self.dom.templateIDContainer.hide();
				
				}
				
				// Resise the form.
				self.resizeForm( false );

			}
		);
		
		// Close the template help
		$("#closeTemplateHelp").click(
			function(e) {
				e.preventDefault();
				
				$("#templateHelpModal").dialog("close");
			}
		);
		
		// I simply announce the bulk template request.
		this.dom.bulkTemplateLink.click(
			function( event ){
				
				// This is not a real link.
				event.preventDefault();
				
				// Announce bulk templates.
				$( document ).trigger( "bulktemplates" );
				
			}
		);

	}
	
	
	// --- Class Methods -------------------------------------------- //
	// -------------------------------------------------------------- //	
	
	// Set up the controller prototype.
	InVision.HotSpotsController.prototype = $.extend( 
		{}, 
		new InVision.Controller(), 
		{
			
			//I will adjust the size of the form tooltip to fit the form
			resizeForm: function(animate){
				var currHeight = $("#invision-hotspot-form-container-inner").outerHeight(true);
				
				if(animate) {
					this.dom.formContainer.animate({height: currHeight});
				} else {
					this.dom.formContainer.height(currHeight);
				}
			},
			
			// I activate the hot spots by turning them on, but keeping them invisible.
			activateHotSpots: function(){
				// Hide everything.
				this.hide();
			
				// Show the hotspots.
				this.showHotSpots();
				
				// Make them see-through.
				this.dom.hotSpotsContainer.addClass( "active-hotspots" );
				
				// Set the current state.
				this.setState( "activated" );
			},
		
			
			// I add additional link parameters.
			addAdditionalParameter: function( name, value ){
				this.additionalParameters[ name ] = value;
			},
					
		
			// I add a hotspot to the system.
			addHotSpot: function( id, x, y, width, height, targetScreenID, templateID, isScrollTo, triggerTypeID ){
				// Pass onto save.
				this.saveHotSpot( id, x, y, width, height, targetScreenID, templateID, isScrollTo, triggerTypeID );
			},
			
			
			// I add a hotspot marker at the given coordinates.
			addMarker: function( id, x, y, width, height ){
				
				// Create a new hotspot elements.
				var hotSpot = $( "<a rel='" + id + "' class='hotspot'><br /></a>" );
				
				// Set the CSS position.
				hotSpot.css({
					left: (x + "px"),
					top: (y + "px"),
					width: (width + "px"),
					height: (height + "px")
				});
				
				// Check to see if the ID has a length. If not, then this will be a "pending"
				// hotspot form.
				if (!id){
					
					// Set as pending.
					hotSpot.addClass( "pending-hotspot" );
					
				}
				
				// Add the hotspot.
				this.dom.hotSpotsContainer.append( hotSpot );
				
				// Return the new hotspot.
				return( hotSpot );
			},
			
			
			// I add the given template to the UI.
			addTemplate: function( id, name ){

				// Add to the project templates and the hotspot form.
				this.addTemplateToProjectTemplates( id, name );
				this.addTemplateToHotspotForm( id, name );

			},
			
			
			// I add the new template to the hotspot form.
			addTemplateToHotspotForm: function( id, name ){

				// Create a new option for our template.
				var template = $( "<option>" )
					.val( id )
					.text( name )
				;
				
				// Get teh current templates.
				var options = this.dom.templateID.children();
				
				// Loop over the options in the current template drop down.
				for (var i = 1 ; i < options.length ; i++){

					// Get teh current template.
					var thisItem = $( options[ i ] );
					
					// Check to see if the current item is greater than the new one.
					if (thisItem.text() > name ){
						
						// Insert the new item.
						return( template.insertBefore( thisItem ) );
						
					}

				}
				
				// If we made it this far, add the option to the bottom of the list.
				return( template.appendTo( this.dom.templateID ) );

			},
			
			
			// I add the new template to the main dropdown.
			addTemplateToProjectTemplates: function( id, name ){
				
				// Create a new template.
				var template = this.dom.templateTemplate.clone();
				
				// Add the data elements.
				template
					.attr( "data-id", id )
					.attr( "data-name", name )
				;
				
				// Set the name value.
				template.find( "label.templateName" ).text( name );
				
				// Add the template to the list. To do this, we have to get the
				// list of current template items.
				var items = this.dom.pageTemplate.children( ".invision-templates" );
				
				// Check to see if this template should be hidden (use the last item as the example).
				if (items.last().hasClass( "hide" )){

					// This will be hidden when added.
					template.addClass( "hide" );

				}
				
				// Check to see if there are any actual template items.
				// NOTE: The last item is always the "info" item.
				if (items.length == 1){

					// Just add this before the info item.
					return( template.insertBefore( items[ 0 ] ) );

				} else {
					
					// We need to insert the item in order.
					for (var i = 0 ; i < (items.length - 1) ; i++){

						// Check to see if the current item is "smaller" than the new template.
						// If so, we need to insert it.
						var thisItem = $( items[ i ] );
						
						if (thisItem.attr( "data-name" ) > name){

							// Insert the template.
							return( template.insertBefore( thisItem ) );

						}

					}
					
					// If we made it this far, insert it at the end (before the info).
					return( template.insertBefore( items.last() ) );
						
				}
				
			},
			
			
			// I associate the given template with the current screen.
			addTemplateAssociation: function( id ){

				var self = this;
				
				// Post the AJAX request. Don't store this AJAX response since the
				// user might be updating a few checkboxes in a row - we don't want
				// to put any roadblocks in the way of the activity.
				$.ajax({
					type: "post",
					url: (this.apiRoot + "add_template_association"),
					data: {
						screenID: this.dom.templateFormScreenID.val(),
						templateID: id
					},
					dataType: "json",
					success: function( response ){
	
						// Check to see if there were any errors.
						if (response.success){

							// Add the given hotspots.
							$.each(
								response.data,
								function( index, hotspot ){
									self.addHotSpot( hotspot.id, hotspot.x, hotspot.y, hotspot.width, hotspot.height, hotspot.targetScreenID, hotspot.templateID, hotspot.isScrollTo, hotspot.triggerTypeID );
								}
							);
						
						} else {
						
							// Alert errors.
							alert( "Please review the following:\n" + response.errors.join( "\n- \n" ) );
						
						}

					}
				});
				
				// Update the count.
				this.updateTemplateCount();
				
				// Announce the change. We are including the MODULE since this module will
				// bind to the same event - we don't want the trigger to cause a recursive
				// cycle of invocation.
				$( document ).trigger({
					type: "templateassociated",
					module: this,
					screenID: this.dom.templateFormScreenID.val(),
					templateID: id
				});
				
			},
			
			
			// I cancel the form.
			cancelForm: function(){
				this.resizeForm(false);
					
				// There is no dirtiness... just close the form.
				this.hideForm();
			},
					
			
			// I deactivate the hot spots.
			deactivateHotSpots: function(){
				// Make them visible.
				this.dom.hotSpotsContainer.removeClass( "active-hotspots" );
				
				// Set the current state.
				this.setState( "default" );
			},
			
			
			// I delete the given hotspot.
			deleteHotSpot: function( id ){
				var self = this;
				
				// Check to see if there is an existing ajax request.
				if (this.ajaxRequest){
					
					// Return out - let the current request finish.
					return;
					
				}
			
				// Post the AJAX request.
				this.ajaxRequest = $.ajax({
					type: "post",
					url: (this.apiRoot + "delete_hot_spot"),
					data: {
						id: id
					},
					dataType: "json",
					success: function(){
						// Remove the hotspot from the system.
						self.removeHotSpot( id );
						
						// Close the form.
						self.hideForm();					
					},
					complete: function(){
						// Remove the current AJAX request.
						self.ajaxRequest = null;
					}
				});
			},		
			
			
			// I delete the given template.
			deleteTemplate: function( id ){

				var self = this;
				
				// Check to see if there is an existing ajax request.
				if (this.ajaxRequest){
					
					// Return out - let the current request finish.
					return;
					
				}
			
				// Post the AJAX request.
				this.ajaxRequest = $.ajax({
					type: "post",
					url: (this.apiRoot + "delete_template"),
					data: {
						id: id
					},
					dataType: "json",
					success: function(){
						// Remove the template from the list (and any associated hotspots).
						self.removeTemplate( id );	
						
						// Announce deletiong.
						$( document ).trigger({
							type: "templatedeleted",
							templateID: id
						});				
					},
					complete: function(){
						// Remove the current AJAX request.
						self.ajaxRequest = null;
					}
				});

			},
			
			
			// I duplicate the given template.
			duplicateTemplate: function( id ){

				var self = this;
				
				// Check to see if there is an existing ajax request.
				if (this.ajaxRequest){
					
					// Return out - let the current request finish.
					return;
					
				}
			
				// Post the AJAX request.
				this.ajaxRequest = $.ajax({
					type: "post",
					url: (this.apiRoot + "duplicate_template"),
					data: {
						id: id
					},
					dataType: "json",
					success: function( response ){

						// Make sure the response was successful.
						if (response.success){

							// Add the new template (duplicate) to the UI.
							self.addTemplate(
								response.data.id,
								response.data.name
							);
							
							// Announce creation.
							$( document ).trigger({
								type: "templatecreated",
								templateID: response.data.id,
								templateName: response.data.name
							});		

						} else {

							// Alert errors.
							alert( "Please review the following:\n" + response.errors.join( "\n- \n" ) );

						}
						
					},
					complete: function(){
						// Remove the current AJAX request.
						self.ajaxRequest = null;
					}
				});

			},
			
			
			// I get a collection of associated templates (based on the current markup).
			getAssociatedTemplates: function(){

				// Create an array to hold the associated templates.
				var associatedTemplates = this.dom.pageTemplate.children( ".invision-templates" ).map(
					function( index, node ){

						// Get a reference to the current template.
						var template = $( node );

						// Check to see if this template is associated.
						if (template.find( "input[ name = 'templateID' ]" ).is( ":checked" )){

							// Return an object with id and name.
							return({
								id: template.attr( "data-id" ),
								name: template.attr( "data-name" )
							});

						}
						
						// Template not associated - return NULL so this item is not mapped.
						return( null );

					}
				);

				// Return the associated templates.
				return( associatedTemplates );

			},
			
			
			// I get the coordinates of the user's click as relative to the container.
			getLocalPosition: function( clickX, clickY ){
				// Get the container offset (that will contain the hot spots).
				var containerOffset = this.dom.hotSpotsContainer.offset();
					
				// Get the coordinates in the context container.
				var markerX = Math.floor( clickX - containerOffset.left );
				var markerY = Math.floor( clickY - containerOffset.top + this.dom.window.scrollTop() );
			
				// Return the new coordinates.
				return({
					left: markerX,
					top: markerY
				});	
			},
			
		
			// I hide the hot spots and the form.
			hide: function(){
				// Hide the hotspots.
				this.hideHotSpots();
				
				// Hide the form.
				this.hideForm();
				this.dom.templateFormContainer.hide();
				
				// Hide the menu.
				this.toggleTemplateList( 0 );
				
				// Hide the template form.
				this.hideTemplateForm();
				
				// Set the new state.
				this.setState( "default" );
			},
			
			
			// I hide the form.
			hideForm: function(){
				
				//Hide any alerts
				$("#invision-hotspot-form-scroll-info-message").hide();
				$("#invision-hotspot-form-add-link-message").hide();
				
				//Resize the form
				this.resizeForm(false);
				
				// Hide the form container.
				this.dom.formContainer.hide();
				
				// Clear the form values.
				this.dom.id.val( 0 );
				this.dom.x.val( "" );
				this.dom.y.val( "" );
				this.dom.width.val( "" );
				this.dom.height.val( "" );
				this.dom.targetScreenID[ 0 ].selectedIndex = 0;
				this.dom.triggerTypeID[ 0 ].selectedIndex = 0;
				/* this.dom.template[ 0 ].selectedIndex = 0; */
				this.dom.isScrollTo.removeAttr( "checked" );
								
				// Remove any pending hotspots.
				this.removePendingHotSpots();
				
				// Set the new state.
				this.setState( "markers" );
			},
			
			
			// I hide the hotspots.
			hideHotSpots: function(){
				//Remove build mode class
				$("body").removeClass("buildMode");
				
				// Deactivate hotspots.
				this.deactivateHotSpots();
			
				// Add the "hide" class from the hotspots container.
				this.dom.hotSpotsContainer.addClass( "hide-hotspots" );
			},		
			
			
			// I hide the template form.
			hideTemplateForm: function(){

				// Hide the template form and set the default values.
				this.dom.templateForm.closest( "li" ).addClass( "hide" );
				
				// Show the "new" template button.
				this.dom.createNewTemplate.closest( "li" ).removeClass( "hide" );
				
				// Show the list of page templates.
				this.dom.pageTemplate.closest( "li" ).removeClass( "hide" );

			},
			
		
			// I move the currently selected marker based on the given mouse move event.
			moveMarkerWithMouse: function( event ){
				// Get the delta in mouse positions.
				var deltaLeft = (event.pageX - this.selectedMarker.data( "startpageX" ));
				var deltaTop = (event.clientY - this.selectedMarker.data( "startClientY" ));
			
				// Update the position of the marker.
				this.selectedMarker.css( "left", ((this.selectedMarker.data( "startLeft" ) + deltaLeft) + "px") );
				this.selectedMarker.css( "top", ((this.selectedMarker.data( "startTop" ) + deltaTop) + "px") );
				
				var hotspotPosition = this.selectedMarker.offset();				
				
				// Since we're going to try and place the hotspot form to the right of the hotspot, let's determine where the right most pixel will be
				// This is basically calculated by finding the offset of the hotspot, adding the width, and then adding the width of the form.
				var hotspotFormRightPos = hotspotPosition.left + this.selectedMarker.width() + 400;
				
				// Now if the right most pixel doesn't overlap the document's width, display like normal
				if ($(document).width() > hotspotFormRightPos) {
					
					//Now position the form container next to it.
					this.dom.formContainer.css({
						top: hotspotPosition.top - 8,
						left: hotspotPosition.left + this.selectedMarker.width() + 20
					});
					
					// Position the tip
					this.dom.formContainer.find(".tool-tip").removeClass("right");
					
				} else {
					
					// We need to position the form the left now
					this.dom.formContainer.css({
						top: hotspotPosition.top - 8,
						left: hotspotPosition.left - 388
					});
					
					// Reposition the tooltip
					this.dom.formContainer.find(".tool-tip").addClass("right");
				}
				
			},
			
			
			// I remove an additional link parameters.
			removeAdditionalParameter: function( name, value ){
				this.additionalParameters[ name ] = null;
			},
			
			
			// I remove the given hotspot and it's related marker.
			removeHotSpot: function( id ){
				// Remove the hotspot.
				this.hotSpots[ id ] = null;
				
				// Remove the associated marker.
				this.removeMarker( id );
			},
			
			
			// I remove the given marker.
			removeMarker: function( hotSpotID ){
				this.dom.hotSpotsContainer.find( "a.hotspot[ rel = '" + hotSpotID + "' ]" ).remove();
			},
			
			
			// I remove any pending hot spots from the page.
			removePendingHotSpots: function(){
				this.dom.hotSpotsContainer.find( "a.hotspot.pending-hotspot" ).remove();
			},
			
			
			// I remove the template from the list and any of the hotspots that are associated with it.
			removeTemplate: function( id ){
				
				var self = this;

				// Remove the template from the primary drown down and hotspot form.
				this.removeTemplateFromProjectTemplates( id );
				this.removeTemplateFromHotspotForm( id );
				
				// Remove the associated hotspots.
				this.dom.hotSpotsContainer.find( "a.hotspot[ data-template-id = '" + id + "' ]" ).each(
					function( index, node ){

						self.removeHotSpot( $( this ).attr( "rel" ) );

					}
				);
				
			},
			
			
			// I remove the screen association to the given template.
			removeTemplateAssociation: function( id ){
				
				// Delete the association.
				$.ajax({
					type: "post",
					url: (this.apiRoot + "remove_template_association"),
					data: {
						screenID: this.dom.templateFormScreenID.val(),
						templateID: id
					},
					dataType: "json",
					success: function( response ){
	
						// Check to see if there were any errors.
						if (!response.success){
						
							// Alert errors.
							alert( "Please review the following:\n" + response.errors.join( "\n- \n" ) );
						
						}

					}
				});
				
				// Remove any hotspots associated with this template.
				this.dom.hotSpotsContainer.find( "a.hotspot[ data-template-id = '" + id + "' ]" ).remove();
				
				// Update the count.
				this.updateTemplateCount();
				
				// Announce the change. We are including the MODULE since this module will
				// bind to the same event - we don't want the trigger to cause a recursive
				// cycle of invocation.
				$( document ).trigger({
					type: "templatedisassociated",
					module: this,
					screenID: this.dom.templateFormScreenID.val(),
					templateID: id
				});
		
			},
			

			// I remove the given template from the hotspot form.
			removeTemplateFromHotspotForm: function( id ){

				// Remove it from the options list.
				this.dom.templateID.children( "[ value = '" + id + "' ]" ).remove();
				
			},
			
			
			// I remove the given template from the main dropdown.
			removeTemplateFromProjectTemplates: function( id, name ){
				
				// Remove the template item.
				this.dom.pageTemplate.children( "li[ data-id = '" + id + "' ]" ).remove();
				
				// Update the count.
				this.updateTemplateCount();

			},
			

			// I resize the marker based on the current mouse position.
			resizeMarkerWithMouse: function( event ){
				// Get the local mouse position.
				var mousePosition = this.getLocalPosition( event.pageX, event.clientY );
				
				// Get the marker position.
				var markerPosition = this.selectedMarker.position();
				
				// Default the top/left values
				var setMarkerTop = markerPosition.top;
				var setMarkerLeft = markerPosition.left;
				
				// Get the delta width and height.
				var deltaWidth = (mousePosition.left - this.selectedMarker.data("startLeft"));
				var deltaHeight = (mousePosition.top - this.selectedMarker.data("startTop"));
				
				// Take the max of the width and height between the delta and the minumum dimensions.
				var rawWidth = deltaWidth;				
				var rawHeight = deltaHeight;
				
				// Get the positive difference of the two points
				var width = Math.abs(deltaWidth);
				var height = Math.abs(deltaHeight);
				
				// Resize the selected marker.
				this.selectedMarker.width( width );
				this.selectedMarker.height( height );	
				
				// If the raw height is less than 0, we're drawing "up" so we'll need to adjust the "top" value for this marker
				if (rawHeight < 0) {
					setMarkerTop = mousePosition.top;
				}	
				
				// Drawing left
				if (rawWidth < 0) {
					setMarkerLeft = mousePosition.left;
				}
				
				// Now render the new position
				this.selectedMarker.css({
					"top": setMarkerTop,
					"left": setMarkerLeft
				});				
				
				var hotspotPosition = this.selectedMarker.offset();				
				
				//Now position the form container next to it.
				this.dom.formContainer.css({
					top: hotspotPosition.top - 8,
					left: hotspotPosition.left + this.selectedMarker.width() + 20
				});		
				
				this.selectedMarker.css({"line-height": height + "px"});
			},
			
			
			// I save the hotspot (persisting it to the database).
			saveForm: function(){
				var self = this;
				
				// Check to see if there is an existing ajax request.
				if (this.ajaxRequest){
					
					alert( "Request still processing." );
					return;
					
				}
				
				// Check to make sure a target is selected.
				if (!this.dom.targetScreenID.val()){
					
					alert( "Please select a target screen." );
					return;
					
				}
				
				$("#invision-hotspot-form-save").addClass("wait");
				
				/*
				var thisMessage = $("#invision-hotspot-form-add-link-message");
				
				// Check to make sure we've selected a template if we're linking this hot spot to it
				if (this.dom.isTemplateLink.is(":checked") && this.dom.template.html() == '-- No Template --') {
					thisMessage.show();
					self.resizeForm(false);
					
					return;
				} else {
					thisMessage.hide();
					self.resizeForm(false);
					
				}
				*/
				
				// Check to see if the template link is checked. If not, we'll override the 
				// templateID to be zero (regardless of the current value).
				if (!this.dom.isTemplateLink.is( ":checked" )){

					// Override the tempalate ID.
					this.dom.templateID.val( 0 );

				}
				
				// Check to see the value of the trigger type
				var triggerType = this.dom.triggerTypeID.val();
				
				
				// If we're selecting the navigate to previous screen, override the trigger type 
				if (this.dom.targetScreenID.find("option:selected").attr("rel") == "back") {
					triggerType = 4; 
				}
			
				// Get the post data.
				var formData = {
					id: this.dom.id.val(),
					x: this.dom.x.val(),
					y: this.dom.y.val(),
					width: this.dom.width.val(),
					height: this.dom.height.val(),
					screenID: this.dom.screenID.val(),
					targetScreenID: this.dom.targetScreenID.val(),
					templateID: this.dom.templateID.val(),
					isScrollTo: this.dom.isScrollTo.is( ":checked" ),
					triggerTypeID: triggerType
				};
				
				// Post the AJAX request.
				this.ajaxRequest = $.ajax({
					type: "post",
					url: (this.apiRoot + "save_hot_spot"),
					data: formData,
					dataType: "json",
					success: function( newID ){
						// Add the hotspot to the system.
						self.saveHotSpot( newID, formData.x, formData.y, formData.width, formData.height, formData.targetScreenID, formData.templateID, formData.isScrollTo, formData.triggerTypeID );
					
						// Close the form.
						self.hideForm();					
					},
					complete: function(){
						// Remove the current AJAX request.
						self.ajaxRequest = null;
						
						$("#invision-hotspot-form-save").removeClass("wait");
					}
				});
			},
			
			
			// I save the given hotspot and add a marker if necessary.
			saveHotSpot: function( id, x, y, width, height, targetScreenID, templateID, isScrollTo, triggerTypeID ){
				// Cache the hotspot.
				this.hotSpots[ id ] = {
					id: id,
					x: x,
					y: y,
					width: width,
					height: height,
					targetScreenID: targetScreenID,
					templateID: templateID,
					isScrollTo: isScrollTo,
					triggerTypeID: triggerTypeID
				};
				
				// Get the associated marker, if it exists.
				var marker = this.dom.hotSpotsContainer.find( "a.hotspot[ rel = '" + id + "' ]" );
				
				// Check to see if we have an associated marker.
				if (!marker.size()){
				
					// No marker yet, so add the marker.
					marker = this.addMarker( id, x, y, width, height );
					
				}
				
				// If the hotspot is a template, hot spot, add the template class.
				if (templateID != 0){
				
					// Add the template class and ID reference.
					marker
						.addClass( "template-hotspot" )
						.attr( "data-template-id", templateID )
					;
				
				} else {
				
					// Remove the template class.
					marker.removeClass( "template-hotspot" );
				
				}
			},
			
			// I save the position of a marker after it has been moved.
			saveMarkerPosition: function( marker ){
				// Get the current position.
				var currentPosition = marker.position();
				
				// Get the marker data.
				var markerData = marker.data();
				
				// Get the current hotSpot.
				var hotSpot = this.hotSpots[ marker.attr( "rel" ) ];
				
				// Check to make sure the position changed enough or the marker has
				// been resized.
				if (
					(Math.abs( currentPosition.left - markerData.startLeft ) > 1) || 
					(Math.abs( currentPosition.top - markerData.startTop ) > 1) ||
					(marker.width() != hotSpot.width) ||
					(marker.height() != hotSpot.height)
					){
				
					// Store the new position of the marker in the cached data.
					hotSpot.x = currentPosition.left;
					hotSpot.y = currentPosition.top;
					hotSpot.width = marker.width();
					hotSpot.height = marker.height();
										
					// Save the hot spot (with the new position) back to the server.
					$.ajax({
						type: "post",
						url: (this.apiRoot + "save_hot_spot"),
						data: {
							id: hotSpot.id,
							x: hotSpot.x,
							y: hotSpot.y,
							width: hotSpot.width,
							height: hotSpot.height,
							screenID: this.dom.screenID.val(),
							targetScreenID: hotSpot.targetScreenID,
							templateID: hotSpot.templateID,
							isScrollTo: hotSpot.isScrollTo,
							triggerTypeID: hotSpot.triggerTypeID
						},
						dataType: "json"
					});
					
				}
			},
			
			
			// Save the template form.
			saveTemplateForm: function(){
	
				var self = this;
				
				// Check to see if there is an existing ajax request.
				if (this.ajaxRequest){
					
					return( alert( "Request still processing." ) );
					
				}
				
				// Build up the form data.
				var formData = {
					id: this.dom.templateFormID.val(),
					name: this.dom.templateFormName.val(),
					projectID: this.dom.templateFormProjectID.val()
				};

				// Post the AJAX request.
				this.ajaxRequest = $.ajax({
					type: "post",
					url: (this.apiRoot + "save_template"),
					data: formData,
					dataType: "json",
					success: function( response ){
						
						// Check to see if this is a new ID.
						if (formData.id == response.data){

							// Update the template.
							self.updateTemplate( formData.id, formData.name );
							
							// Announce rename.
							$( document ).trigger({
								type: "templaterenamed",
								templateID: formData.id,
								templateName: formData.name
							});

						} else {

							// Add the new template.
							self.addTemplate( response.data, formData.name );
							
							// Announce creation.
							$( document ).trigger({
								type: "templatecreated",
								templateID: response.data,
								templateName: formData.name
							});

						}
						
						// Close the form.
						self.hideTemplateForm();
											
					},
					complete: function(){
						
						// Remove the current AJAX request.
						self.ajaxRequest = null;
						
					}
				});
			
			},
			
			
			// I show the hotspots on the page.
			show: function(){				
				if (!window.inVision.isHotSpotPreview) {
					// Show the template form.
					this.dom.templateFormContainer.show();
				}
				
				// Show the hot spots.
				this.showHotSpots();
				
				// Set the new state.
				this.setState( "markers" );
			},
				
			
			
			// id, x, y, width, height, targetScreenID, templateID, isScrollTo, triggerTypeID
			
			// I show the hotspots form.
			showForm: function( hotSpot, id, x, y, width, height, targetScreenID, templateID, isScrollTo, triggerTypeID ){
				
				// Set the form values.
				this.dom.id.val( id );
				this.dom.x.val( x );
				this.dom.y.val( y );
				this.dom.width.val( width );
				this.dom.height.val( height );
				
				// If this is a previous link, we want to select the option that uses rel="back".
				// Otherwise, we'll just select the option with the target screen ID. 
				if (triggerTypeID == 4) {

					// Select the "Prev Screen" option.
					this.dom.targetScreenID.find( "option[ rel = 'back' ]" ).attr( "selected", true );

				} else {

					// Select the target screen. In order to create a fail-through for the 
					// "history.go(-1)" approach, we need to give the "prev" screen a default
					// value of the same screen. As such, we'll have to select the target screen that
					// is NOT the "back" link.
					this.dom.targetScreenID.find( "option[ value = '" + targetScreenID + "' ]" )
						.filter( ":not( [ rel = 'back' ] )" )
							.attr( "selected", true )
					;
					
				}
				this.dom.templateID.find( "option[ value = '" + templateID + "' ]" ).attr( "selected", true );
				this.dom.triggerTypeID.find( "option[ value = '" + triggerTypeID + "' ]" ).attr( "selected", true );

				/* this.dom.template.find( "option[ value = '" + template + "' ]" ).attr( "selected", true ); */
				if (isScrollTo){
					this.dom.isScrollTo.attr( "checked", true );
				} else {
					this.dom.isScrollTo.removeAttr( "checked" );
				}
				
				// Check for template ID to see if we should show the template dropdown.
				if (templateID != 0) {

					// Check the template box.
					this.dom.isTemplateLink.attr( "checked", "checked" );
					
					// Show the drop down.
					this.dom.templateIDContainer.show();

				} else {

					// Uncheck the template box.
					this.dom.isTemplateLink.removeAttr( "checked" );
					
					// Hide the template drop down.
					this.dom.templateIDContainer.hide();

				}
				
				// Check to see if this is an add or edit (we'll want to remove the Delete
				// link if this is an add form).
				if (id){
					
					// Show the delete link.
					this.dom.deleteLink.show();
					
				} else {
				
					// Hide the delete link.
					this.dom.deleteLink.hide();
					
				}
				
				//Let's either enable or disable the form
				if (this.dom.targetScreenID.val() != 0) {
					$("#invision-hotspot-form-save").removeAttr("disabled").removeClass("disabled");
				} else {
					$("#invision-hotspot-form-save").attr("disabled", "disabled").addClass("disabled");
				}
				
				//Get the position of the hot spot
				var thisHotspot = $(".hotspot[rel=" + hotSpot + "]");
				var hotspotPosition = thisHotspot.offset();				
				
				// Since we're going to try and place the hotspot form to the right of the hotspot, let's determine where the right most pixel will be
				// This is basically calculated by finding the offset of the hotspot, adding the width, and then adding the width of the form.
				var hotspotFormRightPos = hotspotPosition.left + thisHotspot.width() + 400;
				
				// Now if the right most pixel doesn't overlap the document's width, display like normal
				if ($(document).width() > hotspotFormRightPos) {
					
					//Now position the form container next to it.
					this.dom.formContainer.css({
						top: hotspotPosition.top - 8,
						left: hotspotPosition.left + thisHotspot.width() + 20
					});
					
					// Position the tip
					this.dom.formContainer.find(".tool-tip").removeClass("right");
					
				} else {
					
					// We need to position the form the left now
					this.dom.formContainer.css({
						top: hotspotPosition.top - 8,
						left: hotspotPosition.left - 388
					});
					
					// Reposition the tooltip
					this.dom.formContainer.find(".tool-tip").addClass("right");
				}
				
				//Show the selected template name in this window
				if (this.dom.selectedTemplate.text() == "-- No Template --") {
					$("#activeTemplateName").text("a");
				} else {
					$("#activeTemplateName").text("\"" + this.dom.selectedTemplate.text() + "\"");
				}
						
				// Show the form.		
				this.dom.formContainer.show();
				
				//Resize the form
				this.resizeForm(false);
				
				// Focus the target screen field.
				this.dom.targetScreenID.focus();
				
				// Set the new state.
				this.setState( "form" );				
			
			},
			
			
			// I show the hotspots.
			showHotSpots: function(){
				// Deactivate hot spots.
				this.deactivateHotSpots();
			
				// Remove the "hide" class from the hotspots container.
				this.dom.hotSpotsContainer.removeClass( "hide-hotspots" );
			},
			
			
			// I show the template form with the given values.
			showTemplateForm: function( id, name ){

				// Set default values for properties.
				id = (id || 0);
				name = (name || "");
				
				// Hide the "new" template button.
				this.dom.createNewTemplate.closest( "li" ).addClass( "hide" );
				
				// Hide the list of page templates.
				this.dom.pageTemplate.closest( "li" ).addClass( "hide" );
				
				// Show the template form and set the default values.
				this.dom.templateForm.closest( "li" ).removeClass( "hide" );
				this.dom.templateFormID.val( id );
				this.dom.templateFormName.val( name ).focus();

			},
			
			
			toggleTemplateList: function(currentState){
				
				var thisList = this.dom.selectedTemplate.closest("ul");
				
				//If the dropdown is closed
				if (currentState >= 1){
					//Show the "open" styling
					thisList.addClass("open");
					
					//Now let's show the sub items
					thisList.find("li.hide").removeClass("hide");

					this.setState("form");
				} 
				//If the dropdown is open
				else {
					//Remove the styling that shows the list open
					thisList.removeClass("open");
					
					//Hide the sub items					
					thisList.find("li").addClass("hide");
					thisList.find("li:first").removeClass("hide");
					
					this.setState("markers");
				}
			},
			
			
			// I update the name of the given template in the current list.
			updateTemplate: function( id, name ){

				// Find the template.
				var template = this.dom.pageTemplate.children( "[ data-id = '" + id + "' ]" );
				
				// Update the name and display.
				template
					.attr( "data-name", name )
					.find( "label.templateName" )
						.text( name )
				;

			},
			
			
			// I update the count of template in the drop-down menu.
			updateTemplateCount: function(){

				// Count the number of check elements.
				var templateCount = this.dom.pageTemplate.find( "input.toggleTemplateAssociation:checked" ).length;
				
				// Update the display.
				if (templateCount){

					// Set the count-based output.
					this.dom.selectedTemplate.text( templateCount + " Template" + (templateCount > 1 ? "s" : "") + " Applied" );
						
				} else {
					
					// Set teh generic output.
					this.dom.selectedTemplate.text( "Select Your Templates" );	
					
				}

			},
			
			
			// I update the hot spots on the page based on the current selection.
			updateTemplateHotSpots: function(){
				var self = this;
				
				// Check to see if there is an existing ajax request.
				if (this.ajaxRequest){
					
					alert( "Request still processing." );
					return;
					
				}
				
				// First, remove all of the current template hot spots.
				var hotSpots = this.dom.hotSpotsContainer.find( "a.template-hotspot" );
				
				// Remove them from the page.
				hotSpots.each(
					function( index ){
						self.removeHotSpot( $( this ).attr( "rel" ) );
					}
				);
				
				// Get the new template name.
				var templateName = this.dom.selectedTemplate.text();
				
				//If the template name is "No Template", make the name empty;
				if (templateName == "-- No Template --") {
					var templateName = "";
				}	
				
				// Remove the last option from the template select if appropriate.
				/* this.dom.template.children( ":gt(0)" ).remove(); */
				
				// Save the template associated with this screen.
				this.ajaxRequest = $.ajax({
					type: "post",
					url: (this.apiRoot + "save_screen_template"),
					data: {
						id: this.dom.screenID.val(),
						projectID: this.dom.pageTemplateProjectID,
						template: templateName
					},
					dataType: "json",
					success: function(){
						// Make sure we have a template name.
						if (templateName){

							// Get the new hot spots based on the given selection.
							self.ajaxRequest = $.ajax({
								type: "post",
								url: (self.apiRoot + "get_hot_spots"),
								data: {
									projectID: self.dom.pageTemplateProjectID,
									template: templateName
								},
								dataType: "json",
								success: function( hotSpots ){
									// Add the hot spots.
									$.each(
										hotSpots,
										function( index, hotSpot ){
											self.addHotSpot( hotSpot.ID, hotSpot.X, hotSpot.Y, hotSpot.WIDTH, hotSpot.HEIGHT, hotSpot.TARGETSCREENID, hotSpot.TRIGGERTYPEID, hotSpot.TEMPLATE, hotSpot.ISSCROLLTO, hotSpot.ISTEMPLATELINK );
										}
									);
								},
								complete: function(){
									// Clear the AJAX response.
									self.ajaxRequest = null;
								}
							});
							
							// Add it to the select.
							/*
							self.dom.template.append( 
								"<option value='" + templateName + "'>" + templateName + "</option>" 
							);
							*/
						
						} else {
						
							// Clear the AJAX response.
							self.ajaxRequest = null;
						
						}
					}
				});
			},
			
			// I open up the template modal
			openTemplateHelpModal: function(){
				// Open the dialog.
				$("#templateHelpModal").dialog({
					modal: true,
					zIndex: 6000,
					position: [ "center", "center" ],
					width: 800
				});
			}
		
		}
	);
	
})( window.InVision || {}, jQuery );