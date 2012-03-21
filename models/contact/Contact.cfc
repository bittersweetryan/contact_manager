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
	//i can manage my own dependencies just fine
	variables.meta = {};
	variables.scriptFunctions = new utilities.ScriptFunctions();
	variables.contactRules =  new models.contact.ContactRules();

	public Contact function init(String fileLocation, boolean reinit = false)
	output=false hint="I'm the constructor for the contact"{

		//if the reinit arg was passed clear existing metadata
		if(arguments.reinit){
			clearMeta();
		}

		//if there is no local metadata get it, since meta lives as long as this component is
		//recompiled I use it as a temporary store to give me "static" like properties
		if(structIsEmpty(variables.meta)){
			getMeta();
		}

		//init the variables to a safe state
		variables.fullName = "";
		variables.email = "";
		variables.phone = "";
		variables.id = 0;
		
		//set the metadata's file location
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
			//get the contacts from the file
			fileContents = fileRead(variables.meta.fileLocation);

			//make sure the file contains json or the app will blow up
			if(!isJSON(fileContents)){	
				throw("File contents is not valid JSON!");
			}
			else{
				//set the local contacts as native coldfusion objects
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
		//create a new contact to set properties of
		var contact = new models.contact.Contact();

		//get the properties that exist for a contact
		var props = variables.meta.properties;

		//loop them and try to set the properties on the contact object
		//from properties in the argument struct
		for(var i = 1; i <= arrayLen(props); i++){

			//make sure that the key exists in the contact structure passed in
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
	output=false hint="Removes any custom properties from the metadata"{
		var meta = getMetaData(this);

		if(structKeyExists(meta,"contacts")){
			structDelete(meta, "contacts");
		}

		if(structKeyExists(meta,"fileLocation")){
			structDelete(meta, "fileLocation");
		}
	}

	remote Struct function save()
	output=false hint="I either update or add a contact" returnFormat="JSON"{

		//set the values of this object with properties coming from the form
		//typically i'd use a front-end controller to encapsulate the form scope
		//and pass that into this function
		if(structKeyExists(form,"email")){
			variables.email = htmlEditFormat(form.email);
		}
		if(structKeyExists(form,"phone")){
			variables.phone = htmlEditFormat(form.phone);
		}
		if(structKeyExists(form,"fullName")){
			variables.fullName = htmlEditFormat(form.fullName);
		}

		try{
			//validate the contact
			if(!variables.contactRules.validate(this)){
				throw("Not valid contact.");
			}

			//if the contact has a valid id then update it
			if(structKeyExists(form,"contactID") && len(form.contactID)){
				variables.id=htmlEditFormat(form.contactID);
				return update();
			}
			//otherwise add it
			else{
				return add();
			}
		}
		catch(Any ex){
			return {"success" = "false", "message" = "#ex.message#"};
		}

	}

	private Struct function update()
	output=false hint="I update a contact's json representation"{
		if(structIsEmpty(variables.meta)){
			getMeta();
		}

		var contact = {};

		//populate the contact with the existing values
		contact = getById(variables.id);

		//now update them with the new vales
		contact.fullName = variables.fullName;
		contact.phone = variables.phone;
		contact.email = variables.email;

		//and save the file
		writeData();

		//everything went ok, set the return json
		return {"success" = "true","contact" = contact};
	}

	private Struct function getById(String id)
	output=false hint="I lookup a contact in the contacts json by ID"{
		var contact = {};

		for(contact in variables.meta.contacts){
			contact = contact.contact;

			if(contact.id == arguments.id){
				return contact;
			}
		}
	}


	private void function writeData()
	output=false hint="I persist data to the filesystem"{
		
		//make sure the location to save this is set and that there is a list of contacts in the metadata
		if(!structKeyExists(variables.meta,"fileLocation") || 
			!structKeyExists(variables.meta,"contacts")){
			throw("filelocation or contacts does not exist in metadata!  Try to reinit this object.");
		}

		//write the file
		fileWrite(variables.meta.fileLocation,serializeJSON(variables.meta.contacts));
	}

	private Struct function add()
	output=false hint="I add a new contact"{

		var contact = {};

		if(structIsEmpty(variables.meta)){
			getMeta();
		}

		variables.id = createUUID();

		//convert the current representation to a struct
		contact["contact"] = this.getMemento();	

		//add it to the contacts list
		arrayAppend(variables.meta.contacts,contact);
		//save it
		writeData();

		//then return the new contact list
		return contact;
	}

	remote Struct function delete()
	output="false" returnFormat="JSON" hint="I remove a contact from the contact list"{

		//make sure there was an id passed in to delete
		if(!structKeyExists(form, "id")){
			throw("No id passed in to delete.");
		}

		if(structIsEmpty(variables.meta)){
			getMeta();
		}

		try{
			//loop through the contacts
			for(var i = 1; i <= arraylen(variables.meta.contacts); i++){
				//look for a matching id
				if(variables.meta.contacts[i].contact.id == form.id){

				//delete the entry
				arrayDeleteAt(variables.meta.contacts, i);

				//save the file
				writeData();

				//and let everyone know that things went OK
				return {"success" = "true"};
				} 
			}
		}
		catch(any ex){
			return {"success" = "false", "message" = ex.message};
		}

	}
}