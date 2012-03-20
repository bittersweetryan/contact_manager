// Create the list controller.
			// var projectListController = new TileListController( $( "ul.tileList" ) );
		
			/*
			var deactivationTimer = null;
			$( "ul.tileList li.tile" ).live("mouseenter",
				function(){
					
					// Remove any active tile
					$( "ul.tileList li" ).removeClass( "activeTile" );
					
					// Now activate this tile
					$( this ).addClass( "activeTile" );

					// Clear any timer.
					clearTimeout( deactivationTimer );
					
				}).live("mouseleave",
				function(){
					var project = $( this );
					
					// Deactivate the tile
					deactivationTimer = setTimeout(
						function(){
							project.removeClass( "activeTile" );
						},
						500
					);
				}
			);
			*/

			function saveProjectSort( thisList ) {
				// Deactivate all the other tiles.
				var projects = thisList.find( "li.tile" ).removeClass( "activeTile" );
				
				var projectIDs = [];
				
				for (var i = 0, len = projects.length; i < len; i++) {
					projectIDs.push($(projects[i]).attr("data-projectid"));
				}
				
				
				// Stop any existing request.
				if (projectSortAjax){
					projectSortAjax.abort();
				}
				
				// Update the project sort.
				projectSortAjax = $.ajax({
					type: "post",
					url: "/api/update_project_sort",
					data: {
						projectIDs: projectIDs.join(",")
					},
					dataType: "json",
					success: function( response ){
						// Clear the AJAX request.
						projectSortAjax = null;
						
						// Alert any errors if there are any.
						if (!response.success){
							// Show errors.
							alert(
								"Please review the following:\n\n- " +
								response.errors.join( "\n- " )
							);
						}
					}
				});			
			}
			
			// A connection object for the sort.
			var projectSortAjax = null;

			// Make the list sortable.
			$( "ul.tileList" ).sortable({
				placeholder: "placeholderTile",
				revert: 100,
				opacity: .8,
				items: ".sortableTile",
				tolerance: "pointer",
				handle: ".dragHandle",
				stop: function( event, ui ){
					saveProjectSort( $(this));
					
				}
			});
			
			$(".dragHandle").live("click", function(e) {
				e.preventDefault();
			})

			
			// I show the delete modal.
			function showDeleteModal( project ){
				
				$( "#deleteModal" ).dialog({
					modal: true,
					width: 500
				});
				
			}
			
			
			// --------------------------------------------------------------------- //
			// --------------------------------------------------------------------- //
			
			
			// Get the add button.
			var addProjectButton = $( "a.addProject" );
			var addProjectForm = $(".addProjectForm");
			
			// Get the add modal.
			var addProjectModal = $( "#addModal" );
			
			var addProjectAJAX = null;
			
			
			addProjectButton.live("click",
				function( event ){
					// Prevent default event.
					event.preventDefault();
					
					// Get the userID of the owner of this project
					var ownerID = $(this).attr("data-ownerid");
					var ownerName = $(this).attr("data-ownername");
					
					if (ownerID == 1813) {
						var addProjectForm = "<form class='addProjectForm'><input type='hidden' name='userID' value='" + ownerID + "' /><strong>New Project</strong><p>Create a new project under my account.</p><input type='text' name='projectName' /><button type='submit' id='createProjectButton'>Create</button><a href='#' class='cancelNewProject'>Cancel</a></form>";
					} else {
						var addProjectForm = "<form class='addProjectForm'><input type='hidden' name='userID' value='" + ownerID + "' /><strong>New Project</strong><p>Create a new project under <span class='strong'>" + ownerName + "'s</span> account.</p><input type='text' name='projectName' /><button type='submit' id='createProjectButton'>Create</button><a href='#' class='cancelNewProject'>Cancel</a></form>";
					}
					
					var thisTile = $(this).closest("li");
					
					thisTile.flip({
						direction:'lr',
						content:addProjectForm,
						color: '#FFFFFF',
						speed: 150,
						onEnd: function(){
							thisTile.find("input[name=projectName]").focus();
						}

					})
					
					

				}
			);
			
			//Revert the flip
			$(".cancelNewProject").live("click", function(e) {
				e.preventDefault();
				$(this).closest("li").revertFlip();
			});
			
			// Bind the cancel button.
			addProjectModal.find( "a.cancel" ).click(
				function( event ){
					event.preventDefault();
					addProjectModal.dialog( "close" );
				}
			);

				
			// Bind the submit.
			addProjectForm.live("submit",
				function( event ){
					
					// Cancel the default event - we will be handling submit manually.
					event.preventDefault();
					
					// If there is an existing request, just stop.
					if (addProjectAJAX){
						return;
					}
					
					// Get the tile
					var thisTile = $(this).closest("li");
					
					// Get the form input.
					var projectName = $(this).find( "input[ name = 'projectName' ]");
					var userID = $(this).find( "input[ name = 'userID' ]");
					
					// Archive project and save request. 
					addProjectAJAX = $.ajax({
						type: "post",
						url: "/api/add_project",
						data: {
							userID: userID.val(),
							name: projectName.val()
						},
						dataType: "json",
						success: function( response ){
							// Check to see if the response is sucecssful.
							if (response.success){
								
								var newTile = $("#projectTileTemplate").html();
								
								// Replace the values.
								newTile = newTile.replace(
									new RegExp( "\\{id\\}", "g" ),
									response.data.projectID
								); 
								
								// Replace the values.
								newTile = newTile.replace(
									new RegExp( "\\{name\\}", "g" ),
									projectName.val()
								);
								
								var thisProject = $(newTile);
								
								// If this project is not authorized...
								if (response.data.isAuthorized == 0) {
									thisProject.addClass("lockedTile");
									thisProject.find(".innerThumbnail").html("<span class='pleaseHold'>Please hold while we email <br /><strong>" + response.data.ownerName + "</strong> for approval.</span>");
								}
								
								// If this is not our project, remove the "archive" button
								if (!thisTile.closest("ul.tileList").is(".myProjectList")) {
									thisProject.find(".archiveProject").remove();
									thisProject.find(".deleteProject").remove();
								}
																
								//Now append it to the list
								thisTile.after(thisProject);
								
								//Now revert the flip
								thisTile.revertFlip();
								
								//And reset the form
								projectName.val("");
								
								var tileCount = $("li.sortableTile").not(".sample, .collaborationProject").length;
								
								// Show the upgrade tile
								
								if ((3 > 0) && (tileCount >= 3)) {
									showUpgradeTile();
								}
								
								
								// Now start monitoring the status
								monitorPendingStatus();
								
								// And Save the project sort 
								saveProjectSort(thisTile.closest("ul.tileList"));
								
							} else {
							
								// Show errors.
								alert(
									"Please review the following:\n\n- " +
									response.errors.join( "\n- " )
								);
								
							}
						// Clear the ajax request.
						addProjectAJAX = null;	
						}
					});
						
				}
			);
			
			// --------------------------------------------------------------------- //
			// --------------------------------------------------------------------- //
			function convertTile(tile) {
				tile.removeClass("lockedTile");
				tile.find(".pleaseHold").remove();
				tile.find(".authorizationContainer").fadeOut(500, function() {
					tile.find(".authorizationOverlay").slideUp(300, function() {
						tile.find(".innerThumbnail").html("");
						
						var thumbnailInner = tile.find("span.thumbnail").html();
						var projectID = tile.attr("data-projectid");
						
						
						tile.find("span.thumbnail").replaceWith("<a href='project/" + projectID + "' class='thumbnail'>" + thumbnailInner + "</a>");
					});
				});
			}
			
			var pendingTimer = null;
			
			// I monitor the pending tile status.
			function monitorPendingStatus(){
				var self = this;
				
				// Check to see if there already is a timer.
				if (pendingTimer){
					return;
				}
				
				// Get the list of pending project.
				var pendingScreens = $("ul.tileList").children( ".lockedTile" );
				
				// Loop over each pending project to see if we need to launch
				// a pending check.
				pendingScreens.each(
					function( index, tileNode ){
						var tile = $( tileNode );
						
						// Check to make sure there is not an existing pending timer.
						if (!tile.data( "pendingTimer" )){

							// Define the delay of the timer.
							var timerDelay = (15 * 1000);

							// Define the timer function.
							var timerFunction = function(){
								var pendingTimerRequest = $.ajax({
									type: "get",
									url: "/api/check_pending_project",
									data: {
										id: tile.attr( "data-projectid" )
									},
									dataType: "json",
									success: function( response ){

										// Check to see if the api was successful.
										if (response.success && (response.data == "active")){
											
											convertTile(tile);
											
											// Clear the timer.
											clearTimeout( tile.data( "pendingTimer" ) );

											// Remove the timer.
											tile.removeData( "pendingTimer" );
											
											
										} else if (response.data == "denied") {
										
											// Remove the tile
											tile.fadeOut(500, function() {
												tile.remove();
											});	
											
										} else {

											// Re-run the timer.
											tile.data( 
												"pendingTimer",
												 setTimeout( timerFunction, timerDelay )
											);

										}
									}
								});
								
								// Store the request.
								tile.data( "pendingTimerRequest", pendingTimerRequest );
							};

							// Set and store the timer.
							tile.data( 
								"pendingTimer",
								 setTimeout( timerFunction, timerDelay )
							);

						}
					}
				); 
			}
			
			monitorPendingStatus();
			
			//When we try and click on a project,...
			$("ul.projectTileList").find("a").live("click", function(e) {
				
				// Don't let locked projects be accessed
				if ($(this).closest("li.tile").is(".lockedTile")) {
					e.preventDefault();
				}
				
			});
			
			// Handle the project delegation controls
			$(".triggerAllowDropdown").click(
				function(e) {
					e.preventDefault();
					
					$(this).closest(".allowContainer").toggleClass("open");
				}
			)
			
			
			
			$(".allowProject").click(
				function(e) {
					e.preventDefault();
					
					var thisTile = $(this).closest("li.tile")
					var projectID = thisTile.attr("data-projectid");
					var userID = $(this).attr("data-userid");
					
					
												
					$.post("/api/allow_project_creation", {
						id: projectID,
						alwaysAllow: false,
						creatorUserID: userID
					}, function(response) {
						if (response.success) {

							// Convert the tile	
							convertTile(thisTile);
							
						} else {

							if (response.errors[0].search(/upgrading/gi) > 0) {
								$("a.upgrade").click();
							} else {
								// Show errors.
								alert(
									"Please review the following:\n\n- " +
									response.errors.join( "\n- " )
								);
							}
						}
						
					})

				}
			);
			
			$(".alwaysAllowProject").click(
				function(e) {
					e.preventDefault();
					
					var thisTile = $(this).closest("li.tile")
					var projectID = thisTile.attr("data-projectid");
					var userID = $(this).attr("data-userid");
										
					$.post("/api/allow_project_creation", {
						id: projectID,
						alwaysAllow: true,
						creatorUserID: userID
					}, function(response) {
						
						if (response.success) {

							// Convert the tile	
							convertTile(thisTile);
							
						} else {
							
							if (response.errors[0].search(/upgrading/gi) > 0) {
								$("a.upgrade").click();
							} else {
								// Show errors.
								alert(
									"Please review the following:\n\n- " +
									response.errors.join( "\n- " )
								);
							}
							
						}
						
					})
				}
			);
			
			$(".denyProject").click(
				function(e) {
					e.preventDefault();
					
					var thisTile = $(this).closest("li.tile")
					var projectID = thisTile.attr("data-projectid");
					var userID = $(this).attr("data-userid");
															
					$.post("/api/deny_project_creation", {
						id: projectID,
						creatorUserID: userID
					}, function(response) {
						
						if (response.success) {
							
							// Remove the tile
							thisTile.fadeOut(500, function() {
								thisTile.remove();
							});
							
						} else {
							// Show errors.
							alert(
								"Please review the following:\n\n- " +
								response.errors.join( "\n- " )
							);
						}
					})
				}
			);
			
			
			
			
			
			// --------------------------------------------------------------------- //
			// --------------------------------------------------------------------- //
			
			
			// Get the archive button.
			var archiveProjectButton = $( "a.archiveProject" );
			
			// Get the archive modal.
			var archiveProjectModal = $( "#archiveModal" );
			
			
			var archiveProjectAJAX = null;
			
			
			archiveProjectButton.live("click",
				function( event ){
					
					// Remove any other modals first
					$(".ui-dialog").remove();
					
					// Get the project id
					var projectID = $(this).closest("li.tile").attr("data-projectid");
					
					// Set the projectID
					archiveProjectModal.find("input[name=id]").val(projectID);
					
					// Open the dialog.
					archiveProjectModal.dialog({
						modal: true,
						width: 475
					});
				}
			);
			
			
			// Bind the cancel button.
			archiveProjectModal.find( "a.cancel" ).click(
				function( event ){
					// Set the projectID
					archiveProjectModal.find("input[name=id]").val(0);
					
					archiveProjectModal.dialog( "close" );
				}
			);
			
			
			// Bind the submit.
			archiveProjectModal.find( "form" ).submit(
				function( event ){
					var form = $( event.target );
					
					// Cancel the default event - we will be handling submit manually.
					event.preventDefault();
					
					// If there is an existing request, just stop.
					if (archiveProjectAJAX){
						return;
					}
					
					// Get the form input.
					var id = form.find( "input[ name = 'id' ]");
					
			
					// Toggle the processing note.
					form.hide();
					archiveProjectModal.find( "div.formBeingProcessed" ).show();
					archiveProjectModal.closest(".ui-dialog").find("a.ui-dialog-titlebar-close").hide();

					// Archive project and save request. 
					archiveProjectAJAX = $.ajax({
						type: "post",
						url: "/api/archive_project",
						data: {
							id: id.val()
						},
						dataType: "json",
						success: function( response ){
							// Check to see if the response is successful.
							if (response.success){
								
								// Push user back to homepage.
								window.location.href = ("/");	
								
							} else {
							
								// Show errors.
								alert(
									"Please review the following:\n\n- " +
									response.errors.join( "\n- " )
								);
								
								// Clear the ajax request.
								archiveProjectAJAX = null;
								
								// Toggle the processing note.
								form.show();
								archiveProjectModal.find( "div.formBeingProcessed" ).hide();
								
							}
						}
					});
						
				}
			);
		
			
			// --------------------------------------------------------------------- //
			// --------------------------------------------------------------------- //
			
			// Get the delete button.
			var deleteProjectButton = $( "a.deleteProject" );
			
			// Get the delete modal.
			var deleteProjectModal = $( "#deleteModal" );
			
			var deleteProjectAJAX = null;
			
			
			deleteProjectButton.live("click",
				function( event ){
					// Prevent default event.
					event.preventDefault();
					
					// Reset the display.
					deleteProjectModal.find( "form:first" ).show()[ 0 ].reset();
					deleteProjectModal.find( "div.formBeingProcessed" ).hide();
					
					// Remove any other modals first
					$(".ui-dialog").remove();
					
					// If this is a sample project
					if ($(this).closest("li.tile").is(".sample")) {
						$("#isSampleProject").show();

					} else {
						$("#isSampleProject").hide();

					}
					
					// Get the project id
					var projectID = $(this).closest("li.tile").attr("data-projectid");
					
					// Set the projectID
					deleteProjectModal.find("input[name=id]").val(projectID);
					
					// Open the dialog.
					deleteProjectModal.dialog({
						modal: true,
						width: 530
					});
				}
			);
			
			
			// Bind the cancel button.
			deleteProjectModal.find( "a.cancel" ).click(
				function( event ){
					// Set the projectID
					deleteProjectModal.find("input[name=id]").val(0);
					
					deleteProjectModal.dialog( "close" );
				}
			);
			
				
			// Bind the submit.
			deleteProjectModal.find( "form:first" ).submit(
				function( event ){
					var form = $( event.target );
					
					// Cancel the default event - we will be handling submit manually.
					event.preventDefault();
					
					// If there is an existing request, just stop.
					if (deleteProjectAJAX){
						return;
					}
					
					// Get the form input.
					var projectID = form.find( "input[ name = 'id' ]");
					var confirm = form.find( "input[ name = 'confirm' ]");
					
					// Toggle the processing note.
					form.hide();
					deleteProjectModal.find( "div.formBeingProcessed" ).show();
					deleteProjectModal.closest(".ui-dialog").find("a.ui-dialog-titlebar-close").hide();
					
					// Archive project and save request. 
					deleteProjectAJAX = $.ajax({
						type: "post",
						url: "/api/delete_project",
						data: {
							id: projectID.val(),
							confirm: confirm.is( ":checked" )
						},
						dataType: "json",
						success: function( response ){
							// Check to see if the response is successful.
							if (response.success){
								
								// Redirect user back to homepage.
								window.location.href = "/";				
								
							} else {
							
								// Show errors.
								alert(
									"Please review the following:\n\n- " +
									response.errors.join( "\n- " )
								);
								
								// Clear the ajax request.
								deleteProjectAJAX = null;
								
								// Toggle the processing note.
								form.show();
								deleteProjectModal.find( "div.formBeingProcessed" ).hide();
								
							}
						}
					});
						
				}
			);
			
			
			// --------------------------------------------------------------------- //
			// --------------------------------------------------------------------- //
			
			

			// Get the share button.
			var shareProjectButton = $( "a.shareProject" );
			
			// Get the share modal.
			var shareProjectModal = $( "#shareModal" );
			
			// Get the result screen.
			var shareProjectResponseDisplay = shareProjectModal.find( "div.shareUrlResponse" );
			
			var shareProjectAJAX = null;
			
			
			// Set the clipboard SWF location.
			ZeroClipboard.setMoviePath( "/linked/zeroclipboard/ZeroClipboard.swf" );
			var clipboard = new ZeroClipboard.Client();
			clipboard.setHandCursor( true );
			

			clipboard.addEventListener( 
				"onComplete", 
				function( client, text ){
					//Highlight the box
					shareProjectModal.find( "div.shareUrl" ).stop().css("background-color", "#FFFF00").animate({"background-color": "#F7F9AA"}, 2000);

				}
			);
			
			shareProjectButton.live("click",
				function( event ){
					// Prevent default event.
					event.preventDefault();
					
					// Get the project id
					var projectID = $(this).closest("li.tile").attr("data-projectid");
					
					// Set the projectID
					shareProjectModal.find("input[name=projectID]").val(projectID);
				
					// Open share model (have it automatically use the homepage).
					openShareModal( 0 );
				}
			);
			
			
			// I open up the share model and get a link for the given screen.
			function openShareModal( screenID ){
				// Get the views.
				var loadingView = shareProjectModal.find( "div.formBeingLoaded" );
				var form = shareProjectModal.find( "form:first" );
				
				// Set the screen id.
				shareProjectModal.find( "input[ name = 'screenID' ]" ).val( screenID );
				
				// Get the display areas.
				var screenName = shareProjectModal.find( "div.shareMetaData div.screenName span.value" );
				var screenCount = shareProjectModal.find( "div.shareMetaData span.screenCount" );
				var projectCount = shareProjectModal.find( "div.shareMetaData span.projectCount" );
				
				// Reset the display.
				loadingView.show();
				form.hide()[ 0 ].reset();
					
				// Open the dialog.
				shareProjectModal.dialog({
					modal: true,
					width: 550,
					close: function() {
						$(".passwordContainer").hide();
					}
				});
			
				// Get the form input.
				var shareID = form.find( "input[ name = 'shareID' ]");
				var projectID = form.find( "input[ name = 'projectID' ]");
				var screenID = form.find( "input[ name = 'screenID' ]");
				var shareUrl = form.find( "input[ name = 'shareUrl' ]" );
				var isCommentingAllowed = form.find( "input[ name = 'isCommentingAllowed' ]");
				var isNavigateAllowed = form.find( "input[ name = 'isNavigateAllowed' ]");
				var isResizeWindow = form.find( "input[ name = 'isResizeWindow' ]");
				var password = form.find("input[name=password]");
				
				// Get the link.
				shareProjectAJAX = $.ajax({
					type: "post",
					url: "/api/share_project",
					data: {
						projectID: projectID.val(),
						screenID: screenID.val(),
						isCommentingAllowed: isCommentingAllowed.is( ":checked" ),
						isNavigateAllowed: isNavigateAllowed.is( ":checked" ),
						isResizeWindow: isResizeWindow.is(":checked"),
						password: password.val()
					},
					dataType: "json",
					success: function( response ){
						// Check to see if the response is successful.
						if (response.success){
							
							// Set the meta data.
							screenName.html( "\"" + response.data.screenName + "\"" );
							screenCount.text( Math.floor( response.data.screenCount ) );
							projectCount.text( Math.floor( response.data.projectCount ) );
							
							// Set the share ID and URL.
							shareID.val( response.data.id );
							shareUrl.val( "http://invis.io/" + response.data.key );
							screenID.val( response.data.screenID );
							
							// Show the form.
							loadingView.hide();
							form.show();	
							
							if (!$( "#copyUrlTrigger embed" ).length){
								$( "#copyUrlTrigger" ).html(
									clipboard.getHTML( 250, 75 )
								);
							}
							
							try {
								clipboard.setText( shareUrl.val() );
							} catch (e){
								// É breaks for no reason É
							}
							
						} else {
						
							// Show errors.
							alert(
								"Please review the following:\n\n- " +
								response.errors.join( "\n- " )
							);
							
							// Close the dialog.
							shareProjectModal.dialog( "close" );
							
						}
						
						// Clear the ajax request.
						shareProjectAJAX = null;
						
					}
				});
			}
			
			function updateShare() {
				// If we selected the password checkbox
				if ($(this).is("input[name=isPassword]")) {
					if ($(this).is(":checked")) {
						$(".passwordContainer").slideDown("fast");
						$(".password").select();
						return;
					} else {
						$(".passwordContainer").slideUp("fast")
						$(".passwordContainer").find(".password").val("");
					}
				}
				
				var loadingView = shareProjectModal.find( "div.formBeingLoaded" );
				
				var form = shareProjectModal.find( "form:first" );
				var shareID = form.find( "input[ name = 'shareID' ]");
				var projectID = form.find( "input[ name = 'projectID' ]");
				var screenID = form.find( "input[ name = 'screenID' ]");
				var shareUrl = form.find( "input[ name = 'shareUrl' ]" );
				var isCommentingAllowed = form.find( "input[ name = 'isCommentingAllowed' ]");
				var isNavigateAllowed = form.find( "input[ name = 'isNavigateAllowed' ]");
				var isResizeWindow = form.find( "input[ name = 'isResizeWindow' ]");
				var password = form.find("input[name=password]");
				
				// Update the share link.
				shareProjectAJAX = $.ajax({
					type: "post",
					url: "/api/update_share_project",
					data: {
						shareID: shareID.val(),
						isCommentingAllowed: isCommentingAllowed.is( ":checked" ),
						isNavigateAllowed: isNavigateAllowed.is( ":checked" ),
						isResizeWindow: isResizeWindow.is( ":checked" ),
						password: password.val()
					},
					dataType: "json",
					success: function( response ){
						// Check to see if the response is successful.
						if (!response.success){
							
							// Show errors.
							alert(
								"Please review the following:\n\n- " +
								response.errors.join( "\n- " )
							);
							
						} else {
							// Set the share ID and URL.
							shareID.val( response.data.id );
							shareUrl.val( "http://invis.io/" + response.data.key );
							//Highlight the box
							$( "div.shareUrl" ).stop().css("background-color", "#FFFF00").animate({"background-color": "#F7F9AA"}, 2000);
							screenID.val( response.data.screenID );
							
							// Show the form.
							loadingView.hide();
							form.show();	
							
							if (!$( "#copyUrlTrigger embed" ).length){
								$( "#copyUrlTrigger" ).html(
									clipboard.getHTML( 345, 35 )
								);
							}
							try {
								clipboard.setText( shareUrl.val() );
							} catch (e){
								// É breaks for no reason É
							}
						}	
						
						// Clear the ajax request.
						shareProjectAJAX = null;
					}
				});
			
			}
			
			
			// Bind to the checkboxes - if they are changed, we need to update the link in real time.
			shareProjectModal.find( ":checkbox" ).click(
				updateShare
			);
			
			// Bind to the save password button
			shareProjectModal.find( ".savePassword" ).click(
				updateShare
			);	
			
			// Bind to the password input
			shareProjectModal.find( "#sharePassword" ).keydown(
				function(e) {
					if (e.keyCode == 13) {
						e.preventDefault();
						shareProjectModal.find( ".savePassword" ).click();
					}
				}
			);			
			
			// Bind the submit to cancel it.
			shareProjectModal.find( "form" ).submit(
				function( event ){
					event.preventDefault();
				}
			);
			
			
			// Bind to the OK to close the modal.
			shareProjectModal.find( "button[ type = 'submit' ]" ).click(
				function( event ){
					// Set the projectID
					shareProjectModal.find("input[name=projectID]").val(0);
					
					shareProjectModal.dialog( "close" );
				}
			);
			
			
			// If someone clicks the "active links" we want to close and open up the new modal.
			shareProjectModal.find( "div.shareMetaData a" ).click(
				function( event ){
					var target = $( this );

					// Preven the default event.
					event.preventDefault();
					
					// Close the current modal.
					shareProjectModal.dialog( "close" );
					
					// Open the new one.
					if (target.is( ".screenLink" )){
					
						// Open the modal and jump to the screen.
						openShareListModal(
							shareProjectModal.find( "input[ name = 'screenID' ]" ).val()
						);
					
					} else {
	
						openShareListModal();
						
					}

				}
			);
			

			// --------------------------------------------------------------------- //
			// --------------------------------------------------------------------- //
			
			
			// Get the duplicate button.
			var duplicateProjectButton = $( "a.duplicateProject" );
			
			// Get the duplicate modal.
			var duplicateProjectModal = $( "#duplicateModal" );
			
			var duplicateProjectAJAX = null;
			
			
			duplicateProjectButton.live("click",
				function( event ){
					event.preventDefault();
					// Get the project id
					var projectID = $(this).closest("li.tile").attr("data-projectid");
					
					// Set the projectID
					duplicateProjectModal.find("input[name=id]").val(projectID);
					
					// Remove any other modals first
					$(".ui-dialog").remove();
										
					// Open the dialog.
					duplicateProjectModal.dialog({
						modal: true,
						width: 475
					});
				}
			);
			
			
			// Bind the cancel button.
			duplicateProjectModal.find( "a.cancel" ).click(
				function( event ){
					// Set the projectID
					duplicateProjectModal.find("input[name=id]").val(0);
					
					duplicateProjectModal.dialog( "close" );
				}
			);
			
			
			// Bind the submit.
			duplicateProjectModal.find( "form" ).submit(
				function( event ){
					var form = $( event.target );
					
					// Cancel the default event - we will be handling submit manually.
					event.preventDefault();
					
					// If there is an existing request, just stop.
					if (duplicateProjectAJAX){
						return;
					}
					
					// Get the form input.
					var id = form.find( "input[ name = 'id' ]");
					
			
					// Toggle the processing note.
					form.hide();
					duplicateProjectModal.find( "div.formBeingProcessed" ).show();
					duplicateProjectModal.closest(".ui-dialog").find("a.ui-dialog-titlebar-close").hide();

					// duplicate project and save request. 
					duplicateProjectAJAX = $.ajax({
						type: "post",
						url: "/api/copy_project",
						data: {
							projectID: id.val(),
							userID: 1813,
							auth: "FFA092562A523E4EF5C61B9388B5446A",
							isSampleProject: "false"
						},
						dataType: "json",
						success: function( response ){
							// Check to see if the response is successful.
							if (response.success){
								
								// Push user back to homepage.
								window.location.href = ("/");	
								
							} else {
							
								// Show errors.
								alert(
									"Please review the following:\n\n- " +
									response.errors.join( "\n- " )
								);
								
								// Clear the ajax request.
								duplicateProjectAJAX = null;
								
								// Toggle the processing note.
								form.show();
								duplicateProjectModal.find( "div.formBeingProcessed" ).hide();
								
							}
						}
					});
						
				}
			);
			// --------------------------------------------------------------------- //
			// --------------------------------------------------------------------- //
			
			
			$("a.tipsyTrigger").tipsy({
				gravity	: 'n',
				html	: true,
				fade	: true,
				delayIn: 500,
				delayOut: 0,
				width : 200,
				live : true
			});
			
			// --------------------------------------------------------------------- //
			/* Handle the renaming of the project */
			// --------------------------------------------------------------------- //
			
			function renameProject(id) {
			var thisProject = $("ul.tileList > li[data-projectid=" + id + "]").find(".tileName > span");
			var input = $("ul.tileList > li[data-projectid=" + id + "]").find("input, .saveEditProject, .cancelEditProject");
			
			if (!input.val().length) {
				return;
			}
			
				$.post("/api/rename_project", {id: id, name: input.val()}, function(d) {
					if (d.data) {
						thisProject.html(input.val()).show();
						input.remove();
					} else {
						thisProject.css("color", "#990000").show();
						input.remove();
					}
				});			
			}					
						
			$(".tileName > span").live("click", function(e) {
				e.preventDefault();
				var thisProject = $(this);
				var thisProjectName = thisProject.text();
				var thisProjectID = thisProject.closest("li").attr("data-projectid");
				
				var input = $("<input type='text' name='projectName' class='editProject' value='" + thisProjectName + "' /><a href='#' class='saveEditProject'>Save</a> <a href='#' class='cancelEditProject'>Cancel</a>");
				
				thisProject.after(input);
				thisProject.hide();
				
				input.select();
				
				// On "enter", save the new name
				input.bind("keydown", function(e) {
					if(e.keyCode == 13) {
						e.preventDefault();

						renameProject(thisProjectID);
					}
				});
				
				
				thisProject.closest("li").find(".saveEditProject").bind("click", function(e) {
					e.preventDefault();
					
					renameProject(thisProjectID);
				});
				
				thisProject.closest("li").find(".cancelEditProject").bind("click", function(e) {
					e.preventDefault();
					
					thisProject.show();
					input.remove();
				});
				
			});
			
			function showUpgradeTile() {
				var upgradeTile = $(".myProjectList").find(".upgradeTile");
				var addProjectTile = $(".myProjectList").find(".dashedOutline:first");
				
				upgradeTile.show();
				addProjectTile.hide();
			};
			
			// If this user has used up all of their projects, show the upgrade tile
												