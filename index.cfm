<!doctype html>
<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
<!--[if gte IE 9]>
	<style type="text/css">
		.gradient {
			 filter: none;
		}
	</style>
<![endif]-->
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<title>inCONTACT</title>
	<meta name="description" content="">

	<meta name="viewport" content="width=device-width">
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	
	<!-- 1140px Grid styles for IE -->
	<!--[if lte IE 9]><link rel="stylesheet" href="css/ie.css" type="text/css" media="screen" /><![endif]-->

	<!-- The 1140px Grid - http://cssgrid.net/ -->
	<link rel="stylesheet" href="css/1140.css" type="text/css" media="screen" />
	
	<!-- Your styles -->
	<link rel="stylesheet" href="css/jquery-ui-1.8.4.invision.css" type="text/css" media="screen" />
	<link rel="stylesheet" href="css/jquery-ui.css" type="text/css" media="screen" />
	<link rel="stylesheet" href="css/styles.css" type="text/css" media="screen" />
	
	<!--css3-mediaqueries-js - http://code.google.com/p/css3-mediaqueries-js/ - Enables media queries in some unsupported browsers-->
	<script type="text/javascript" src="js/css3-mediaqueries.js"></script>
	
	<script src="js/libs/modernizr-2.5.3.min.js"></script>
</head>
<body>
	<header class="sunkenText lightGradient">
		inCONTACT
	</header>
	<div class="container">
		<div class="row">
			<div class="twocol">
				<div class="gutterLeft">

				</div>
			</div>
			<div class="eightcol" last>
				<div id="contacts">
					<div id="search">
						<span>
							<input name="search" value="Enter Search Text">
						</span>
						<span>
							<a href="#" id="newContact">New Contact</a>
						</span>
					</div> 
					<ul id="contact-list">

					</ul>
				</div>
			</div>
		</div>
	</div>
	<footer class="">
		<p>Thank you for the opportunity to be part of something challenging, a bit scary, and very exciting!</p>
	</footer>

	<div id="dialog_form" title="Contact">
		<form>
		<fieldset>
			<div>
				<label for="name">Full Name</label>
				<input type="text" name="fullName" id="fullName" class="ui-corner-all" />
			</div>
			<div>
				<label for="email">Email</label>
				<input type="email" name="email" id="email" value="" class="ui-corner-all" />
			</div>
			<div>
				<label for="password">Phone</label>
				<input type="tel" name="phone" id="phone" value="" class="ui-corner-all" />
			</div>
		</fieldset>
		<input type="hidden" name="id" id="id" value="0" />
		</form>
	</div>

	<div id="dialog_delete" title="Delete Contact">
		<form>
			<div class="ui-widget">
				<div class="ui-state-error ui-corner-all" style="padding: 0 .7em;"> 
					<p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span> 
					Are you sure you want to delete this contact?</p>
				</div>
			</div>
		<input type="hidden" name="id" id="id" value="0" />
		</form>
	</div>

	<script id="view_contact_template" type="text/template">
		<div class="contact">
			<span class="right contact_name">{name}</span>
			<span class="left contact_links"><a href="#" class="contact_details">details</a> | <a href="#" class="contact_edit">edit</a> | <a href="#" class="contact_delete">delete</a>
			<div class="contact_details">
				<p class="contact_details_name">Name: {name}</p>
				<p class="contact_details_email">Email: {email}</p>
				<p class="contact_details_phone">Phone: {phone}</p>
			</div>
		</div>
	</script>

	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.8.10/jquery-ui.min.js"></script>
	<script>window.jQuery || document.write('<script src="js/libs/jquery-1.7.1.min.js"><\/script>'); window.jQuery.ui || document.write('<script src="jquery-ui-1.8.18.custom.min"><\/script>');</script>
	<script type="text/javascript" src="js/libs/jquery.toobject.js"></script>
	<script type="text/javascript" src="js/incontact.app.js"></script>
	<script type="text/javascript" src="js/incontact.controller.js"></script>
	<script type="text/javascript" src="js/incontact.contacts.js"></script>
	<script type="text/javascript">
		var controller = new InContact.ContactsController();
	</script>
</body>
</html>