component extends="mxunit.framework.TestCase"{
	
	public void function setUp(){
		variables.contact = 
			new models.contact.Contact(
				"#getDirectoryFromPath(getCurrentTemplatePath())#../../../data/contacts.json",
				true
			);	
	}

	public void function testCreation(){
		
		assertIsTypeOf(variables.contact,"models.contact.Contact");		 
	}

	public void function testShouldRespondToName(){
		var expected = "Homer Simpson";
		var actual = ""; 
		
		variables.contact.setFullName("Homer Simpson");
		actual = variables.contact.getFullName();

		assertEquals(expected, actual, "Should respond to name.");
	}

	public void function testShouldRespondToEmail(){
		var expected = "homer.simpson@gmail.com";
		var actual = ""; 
		
		variables.contact.setEmail("homer.simpson@gmail.com");
		actual = variables.contact.getEmail();

		assertEquals(expected,actual,"Should respond to email");
	}

	public void function testShouldRespondToPhone(){
		var expected = "555-555-5555";
		var actual = ""; 
		
		variables.contact.setPhone("555-555-5555");
		actual = variables.contact.getPhone();

		assertEquals(expected, actual, "Should respond to phone number.");
	}

	public void function testShouldRespondToListAll(){
		var contacts = variables.contact.listAll();

		assertIsArray(contacts);
	}
}