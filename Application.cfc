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

	<cffunction name="onRequestStart" returntype="boolean" access="public" output="false">
		<cfargument name="targetPage" type="string" required="true">
		<cfif structKeyExists(url,"reset")>
			<cfset application.contact.clearMeta() />
			<cfset	application.contact = new models.contact.Contact(
				"#getDirectoryFromPath(getCurrentTemplatePath())#data/contacts.json",
				true
		) />	
		</cfif>
		<cfreturn true />
	</cffunction>


	<cffunction name="onCFCRequest" returntype="void" access="public" output="true" hint="I run when a cfc is called directly">
		<cfargument name="component" type="string" required="true"/>
 		<cfargument name="methodName" type="string" required="true"/>
		<cfargument name="args" type="struct" required="true" />

		<cfset var resp = '' />

		<cfif !structKeyExists(url,"debug")>
			<cfheader name="Content-Type" value="application/json">
		</cfif>

		<cfinvoke
			component = "#arguments.component#"
			method = "#arguments.methodName#"
			argumentcollection = "#arguments.args#"
			returnVariable = "resp" />

		<cfif !isNull(resp)>
			<cfoutput>#serializeJSON(resp)#</cfoutput>
		</cfif>

		<cfreturn />
	</cffunction>
</cfcomponent>