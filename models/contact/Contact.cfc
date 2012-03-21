/**
* @accessors true
*/
component extends="models.Bean" hint="I encapsulate the functionality of a Contact"{

	/**
	* @getters true
	* @setters true
	* @type String
	*/
	property id;

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
	* @ignore true
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
		variables.id = 0;
		
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

	public void function clearMeta()
	output=false hint=""{
		var meta = getMetaData(this);

		if(structKeyExists(meta,"contacts")){
			structDelete(meta, "contacts");
		}

		if(structKeyExists(meta,"fileLocation")){
			structDelete(meta, "fileLocation");
		}
	}

	public Struct function save()
	output=false hint="I either update or add a contact" returnFormat="JSON"{

		if(structKeyExists(form,"email")){
			variables.email = form.email;
		}
		if(structKeyExists(form,"phone")){
			variables.phone = form.phone;
		}
		if(structKeyExists(form,"fullName")){
			variables.fullName = form.fullName;
		}

		try{

			if(structKeyExists(form,"id") && form.id){
				variables.id=form.id;
				update();

				return {"success" = "true"};
			}
			else{
				return add();
			}
		}
		catch(Any ex){
			return {"success" = "false", "message" = "#ex.message#"};
		}

	}

	private void function update()
	output=false hint="I update a contact"{
		if(structIsEmpty(variables.meta)){
			getMeta();
		}

		for(contact in variables.meta.contacts){
			contact = contact.contact;

			if(contact.id == variables.id){
				contact.fullName = variables.fullName;
				contact.phone = variables.phone;
				contact.email = variables.email;

				writeData();

				break;
			}
		}
	}

	private void function writeData()
	output=false hint="I persist data to the filesystem"{
		if(!structKeyExists(variables.meta,"fileLocation") || 
			!structKeyExists(variables.meta,"contacts")){
			throw("filelocation or contacts does not exist in metadata!  Try to reinit this object.");
		}

		fileWrite(variables.meta.fileLocation,serializeJSON(variables.meta.contacts));
	}

	private Struct function add()
	output=false hint="I add a new contact"{

		var contact = {};

		if(structIsEmpty(variables.meta)){
			getMeta();
		}

		variables.id = createUUID();

		contact["contact"] = this.getMemento();

		arrayAppend(variables.meta.contacts,contact);

		writeData();

		return contact;
	}
}