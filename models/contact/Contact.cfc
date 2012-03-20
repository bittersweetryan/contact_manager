/**
* @accessors true
*/
component extends="models.Bean" hint="I encapsulate the functionality of a Contact"{

	/**
	* @getters true
	* @setters true
	* @type String
	*/
	property fullName;

	/**
	* @getters true
	* @setters true
	* @type String
	*/
	property email;

	/**
	* @getters true
	* @setters true
	* @type String
	*/
	property phone;

	/**
	* @getters false
	* @setters true
	* @type Array
	*/
	property contacts;

	//normally I'd use coldspring as a IOC container, but in an app this small
	//i can manage my own dependencies

	variables.meta = {};
	variables.scriptFunctions = new utilities.ScriptFunctions();
	variables.contactRules =  new models.contact.ContactRules();

	public Contact function init(String fileLocation, boolean reinit = false)
	output=false hint="I'm the constructor for the contact"{

		if(arguments.reinit){
			clearMeta();
		}

		if(structIsEmpty(variables.meta)){
			getMeta();
		}

		variables.fullName = "";
		variables.email = "";
		variables.phone = "";
		
		if(structKeyExists(arguments, "fileLocation") && len(arguments.fileLocation)){
			variables.meta.fileLocation = arguments.fileLocation;	
		}		
		
		return this;
	}

	remote Array function listAll()
	output=false returnFormat="JSON" hint="I get a list of all contacts"{
		
		if(structIsEmpty(variables.meta)){
			getMeta();
		}
		//first check the metadata for a list of contacts, I sometimes use
		//metadata as a psudo-static like methods
		if(!structKeyExists(variables.meta,"contacts")){
			variables.meta.contacts = loadContactsFromFile();
		}

		return variables.meta.contacts;
	}

	private Array function loadContactsFromFile()
	output=false hint="I read the contents of a file and load the contacts from it"{
		var fileContents = "";
		var contacts = [];
		//i like to check a string for a length rather than for an empty value, to me
		//it is a bit more expressive
		if(!len(variables.meta.fileLocation)){
			throw("I don't know where to load the file from!");
		}
		else{
			fileContents = fileRead(variables.meta.fileLocation);

			if(!isJSON(fileContents)){
				throw("File contents is not valid JSON!");
			}
			else{
				contacts = deserializeJSON(fileContents);

				for(var i = 1; i <= arrayLen(contacts); i++){
					createContactFromStruct(contacts[i].contact);
				}
			}
		}

		return contacts;
	}

	private Contact function createContactFromStruct(Struct contactStruct)
	output=false hint="I take a struct and create a contact object from it"{
		var contact = new models.contact.Contact();

		var props = variables.meta.properties;
		for(var i = 1; i <= arrayLen(props); i++){
			if(structKeyExists(arguments.contactStruct,props[i].name)){
				variables.scriptFunctions.invoke(contact,
						"set#props[i].name#",
						{"#props[i].name#" = arguments.contactStruct["#props[i].name#"]});
			}	
		}

		return contact;
	}

	private void function getMeta()
	output=false hint="I store the metadata for this component in the variables scope"{
		variables.meta = getMetaData(this);
	}

	private void function clearMeta()
	output=false hint=""{
		var meta = getMetaData(this);

		if(structKeyExists(meta,"contacts")){
			structDelete(meta, "contacts");
		}

		if(structKeyExists(meta,"fileLocation")){
			structDelete(meta, "fileLocation");
		}
	}
}