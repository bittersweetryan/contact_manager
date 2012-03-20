<cfcomponent>
	<cffunction name="invoke" returntype="any" access="public" output="false" hint="Implementation of cfinvoke to call in scripts" >
		<cfargument name="theObject" type="any" required="true" hint="The target of the invoke" />
		<cfargument name="theMethod" type="string" required="true" hint="The method to invoke" />
		<cfargument name="args" type="struct" required="false" default="#{}#" hint="The arguments to pass to invoke" />	
		<cfset var returnVar = "" />

		<cfinvoke component="#arguments.theObject#" method="#arguments.theMethod#" returnvariable="returnVar" argumentcollection="#arguments.args#" />
		
		<cfif isDefined("returnVar") >
			<cfreturn returnVar />
		</cfif>
	</cffunction>
</cfcomponent>