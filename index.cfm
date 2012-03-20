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
	<link rel="stylesheet" href="css/styles.css" type="text/css" media="screen" />
	
	<!--css3-mediaqueries-js - http://code.google.com/p/css3-mediaqueries-js/ - Enables media queries in some unsupported browsers-->
	<script type="text/javascript" src="js/css3-mediaqueries.js"></script>
	
	<script src="js/libs/modernizr-2.5.3.min.js"></script>
</head>
<body>
	<header>
		inCONTACT
	</header>
	<div class="container">
		<div class="row">
			<div class="threecol">
				<div class="gutterLeft">

				</div>
			</div>
			<div class="threecol">
				<div id="contacts">
					<div id="search">
						<input name="search">
					</div> 
					<ul id="contact-list">
						<li>
							<div id="contact">
								<span class="right">Homer Simpson</span>
								<span class="left"><a href="#" id="show_details">details</a> | <a href="#" id="edit_contact">edit</a> | <a href="#" id="delete_contact">delete</a>
								<div id="details">
									123 Fake St.
								</div>
							</li>
					</ul>
				</div>
			</div>
			<div class="threecol">
				<div class="gutterRight">
				</div>
			</div>
		</div>
	</div>
	<footer>
		Thank you for the opportunity to be part of something challenging, a bit scary, and very exciting!
	</footer>

	<script id="view_contact_template" type="text/template">
		<div id="contact">
			<span class="right" id="name"></span>
			<span class="left"><a href="#" id="show_details">details</a> | <a href="#" id="edit_contact">edit</a> | <a href="#" id="delete_contact">delete</a>
			<div id="details">
				<span id="name">{name}</span>
				<span id="email">{email}</span>
				<span id="phone">{phone}</span>
			</div>
		</div>
	</script>

	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.8.10/jquery-ui.min.js"></script>
	<script>window.jQuery || document.write('<script src="js/libs/jquery-1.7.1.min.js"><\/script>'); window.jQuery.ui || document.write('<script src="jquery-ui-1.8.18.custom.min"><\/script>';</script>
	<script type="text/javascript" src="js/incontact.app.js"></script>
	<script type="text/javascript" src="js/incontact.controller.js"></script>
	<script type="text/javascript" src="js/incontact.contacts.js"></script>
</body>
</html>