component {
	
	this.basePath = getDirectoryFromPath(getCurrentTemplatePath());

	this.mappings['/mxunit'] = this.basePath & 'resources/mxunit';
	this.mappings['/models'] = this.basePath & '../models';
	this.mappings['/utilities'] = this.basePath & '../utilities';

	this.name = "inCONTACT Test Suite";
	
	private String function getHostName()
	output=false hint="Returns the hostname of the current server"{
		var inet = createObject("java","java.net.InetAddress");
		return inet.getLocalHost().getHostName();
	}
}