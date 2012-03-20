<cfscript>
	testSuite = new mxunit.framework.TestSuite();

	testSuite.addAll("models.contact.ContactTest");

	results = testSuite.run();
</cfscript>
<cfoutput>
	#results.getResultsOutput("html")#
</cfoutput>