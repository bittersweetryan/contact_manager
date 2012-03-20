<cfcomponent>
	<cfscript>
		this.basePath = getDirectoryFromPath(getCurrentTemplatePath());
		this.mappings['/models'] = this.basePath & 'models';
	</cfscript>

	<cffunction name="onApplicationStart" returnType="boolean" access="public" output="false" hint="I run when the app starts">
		<cfset	application.contact = new models.contact.Contact(
				"#getDirectoryFromPath(getCurrentTemplatePath())#data/contacts.json",
				true
		) />	

		<cfreturn true />
	</cffunction>

	<cffunction name="onCFCRequest" returntype="void" access="public" output="true" hint="I run when a cfc is called directly">
		<cfargument name="component" type="string" required="true"/>
 		<cfargument name="methodName" type="string" required="true"/>
		<cfargument name="args" type="struct" required="true" />

		<cfheader name="Content-Type" value="application/json">

		<cfinvoke
			component = "#arguments.component#"
			method = "#arguments.methodName#"
			argumentcollection = "#arguments.args#"
			returnVariable = "resp" />

		<cfoutput>#serializeJSON(resp)#</cfoutput>

		<cfreturn />
	</cffunction>
</cfcomponent>