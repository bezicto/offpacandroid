exports.clearBookmark = function ()
{
	var myFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,'bookmark.txt');
    myFile.write('',false);
};

exports.removeBookMark = function (callNoToRemove)
{
	var arrayReadBookMark = othersM.readBookmark().toString().split("\n");	
	
	othersM.clearBookmark();
	for(i in arrayReadBookMark) 
	{	
    	if (arrayReadBookMark[i] != callNoToRemove)
    	{
    		othersM.saveBookmark(arrayReadBookMark[i]);
    	}
   	}
};

exports.saveBookmark = function (callnumber)
{
	var myFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,'bookmark.txt');
	myFile.write(callnumber+'\n',true);
};

	
exports.readBookmark = function ()
{
	var readContents;
	var myFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,'bookmark.txt');        
	readContents = myFile.read(); 		
	return readContents.text;
};

exports.toTitleCase = function (str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

exports.getDatabaseDate = function (str)
{
	//0123456789 10 11 12 13
	//x.x.x.yyyy m  m  d  d
	var year = str.substring(6,10);
	var month = str.substring(10,12);
	var day = str.substring(12,14);
	return ": "+day+"/"+month+"/"+year;
};