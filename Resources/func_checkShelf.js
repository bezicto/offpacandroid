exports.checkShelf = function (smd,itemcat,callnumber)
{
	var wordList = [];// Array for word list
	var readFile = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, "offpaclevel.txt"); // Get the wordlist.txt file from the Resources directory 
				 
	if (readFile.exists()){  		
		var text = readFile.read().text.split('\n');// Split the text file by line
				 
		// Add the words, by line, into the wordList array	
		for(var i=0;i<text.length;i++)
		{wordList[i] = text[i];}
	}
	// If the file doesn't exist print "no file found"
	else
	{Ti.API.info("no file found");}	
	
	if (itemcat == "Koleksi Terbuka")
	{
		var parts = callnumber.match(/[a-zA-Z]+|[0-9]+/g);//get call number selected by user
		var isNovelFull = parts[0]+parts[1];
		var isNovelPartial = parts[0];
		
		if (isNovelFull == "PL5134" || isNovelFull == "PL5139")
		{
			return "Level 4 : Novel Collection Area";
		}
		else
		{
			for (var i=0;i<wordList.length;i++)
			{			
				var wordListParts = wordList[i].split(/[ ]+/);;
				
				if (parts[0] === wordListParts[0])
				{
					if (isNovelPartial == "PS" || isNovelPartial == "PR")
					{
						return "If this a novel, look it at Level 4, Novel Collection Area\n\nOr if it is not, try look it at: Level "+wordListParts[3]+" Shelf "+wordListParts[4];
					}
					else
					{
						if (wordListParts[1] === "*")
						{
							return "Level "+wordListParts[3]+" Shelf "+wordListParts[4];
							break;
						}
						else
						{
							if (parseFloat(parts[1])>=parseFloat(wordListParts[1]))	
								{
									if (parseFloat(parts[1])<=parseFloat(wordListParts[2]))
									{
											return " Level "+wordListParts[3]+" Shelf "+wordListParts[4]; 
									}
								}
						}	
					}			
				}
			}
		}
	}
	else if (itemcat == "Koleksi Tesis")
		return "Level 2 Thesis Collection Room";
	else if (itemcat == "Kertas Persidangan/Prosiding")
		return "Level 1";
	else if (itemcat == "Courseware")
		return "Level 4 Media Sources Collection";
	else if (itemcat == "Digital Video Disc")
		return "Level 4 Media Sources Collection";
	else if (itemcat == "Kaset")
		return "Level 4 Media Sources Collection";
	else if (itemcat == "Peta")
		return "Level 4 Media Sources Collection";
	else if (itemcat == "Slaid")
		return "Level 4 Media Sources Collection";
	else if (itemcat == "Koleksi Pendidikan Malaysia")
		return "Level 2 Malaysia Education Collection";
	else
		{
			if (smd == "ACQUISITION PROGRESS")
				return "This item currently in acquisition process";
			else
				return "Refer to collection category";
		}
};