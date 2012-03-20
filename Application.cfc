component {
	//create and init a contact on application start
	public boolean function onApplicationStart()
	output=false hint="I run when the application starts"{
		application.contact = new models.contact.Contact(
				"#getDirectoryFromPath(getCurrentTemplatePath())#data/contacts.json",
				true
		);	

		return true;
	}
}