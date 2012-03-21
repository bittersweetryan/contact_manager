component {
	
	public any function validate(models.contact.Contact contact)
	output=false hint="I validate a contact"{
		return checkEmail(contact) && checkPhone(contact);
	}

	public boolean function checkEmail(models.contact.Contact contact)
	output=false hint="I check for a valid e-mail address"{

		return contact.getEmail() != "" && reFindNoCase('\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b',contact.getEmail()) == true;
	}

	public boolean function checkPhone(models.contact.Contact contact)
	output=false hint="I check for a valid phone number"{

		return contact.getPhone() != "" == true;
	}
}