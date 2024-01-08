export function SetCookie(user:string,type:string){
	const temp = new Date();
	temp.setTime(temp.getTime() + (7*24 * 60 * 60 * 1000));
	const expires = "expires=" + temp.toUTCString();

	document.cookie = type + "=" + user + "; " + expires + "; path=/";
}

export function GetCookie(type:string){
	const cookies = document.cookie.split('; ');
	for (const cookie of cookies) {
		if(cookie.indexOf(`${type}=`)==0){
			return cookie.substring(type.length+1)
		}
	}
	return null;
}