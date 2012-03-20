component {
	
	public booean function validate()
	output=false hint="I validate a contact"{
		return checkEmail() && checkPhone();
	}

	public boolean function checkEmail()
	output=false hint="I check for a valid e-mail address"{
		return true;
	}

	public boolean function checkPhone()
	output=false hint="I check for a valid phone number"{
		return true;
	}
}