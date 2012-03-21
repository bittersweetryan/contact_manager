component hint="I am the base bean for this application."{

	public Bean function init()
	output=false hint="Constructor"{
		return this;
	}
	
	package Array function getProperties(Struct getPropsFor)
	output=false hint="I return an array of property names"{
		var metaData = {};
		var props = [];
		var i = 0;

		metaData = (!structKeyExists(arguments,"getPropsFor")) ? getMetaData(this) : getPropsFor;			

		if(structKeyExists(metaData,"properties")){
			var arr = createObject("java","java.util.Arrays").asList(metaData.properties);
			props.addAll(arr);
		}

		if(structKeyExists(metaData,"extends")){
			props.addAll(getProperties(metaData.extends));
		}

		return props;
	}

	public Struct function getMemento(any target = this)
	output=false hint="I get a snapshot of this components state, properties only"{
		var key = "";
		var memento = {};
		var props = [];

		props = getProperties();

		if(structKeyExists(arguments.target,"super")){
			props = props & getMemento(arguments.target.super);
		}

		for(var i = 1; i <= arrayLen(props); i++){
			var key = props[i].name;

			if(structKeyExists(variables,key) && !isNull(variables[key])){
				if(structKeyExists(props[i],"getters") && props[i].getters && !isCustomFunction(variables[key]) && !structKeyExists(props[i],"ignore")){
					
					if(!isObject(variables[key]) && !isArray(variables[key])){
						memento[key] = variables[key];		
					}
					else if(isArray(variables[key])){
						memento[key] = [];

						for(var x = 1; x <= arrayLen(variables[key]); x++){
							memento[key][x] = variables[key][x].getMemento();
						}
					}
					else{
						memento[key] = variables[key].getMemento();
					}
				}				
			}
		}
		return memento;
	}
}