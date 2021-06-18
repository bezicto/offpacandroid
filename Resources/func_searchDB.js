exports.searchDB = function (searchText,selectedSearch)
{
   var searchText = searchText.replace(/'/g, "");
   var searchText = searchText.replace(/"/g, "");
   
   buttonGo.setTitle('Searching...');
   buttonGo.touchEnabled = false;
   for (z=0;z<result.length;z++)
   {
   	resultCard.remove(result[z]);//clear the resultCard elements
   }
   resultCard.remove(navigationBar);
   
   if (searchText != '')
   {	  		
   		appendcheckRS = " AND vbooks MATCH '"+searchText+"'";
   		
   		if (selectedSearch == 'In Thesis')		
   			appendcheckRS = appendcheckRS + " AND ITEM_CAT LIKE 'Koleksi Tesis' ";
   		else if (selectedSearch == 'In Multimedia')		
   			appendcheckRS = appendcheckRS + " AND ITEM_CAT LIKE 'Koleksi Sumber Media' ";
   		else if (selectedSearch == 'In Book')		
   			appendcheckRS = appendcheckRS + " AND SMD LIKE 'Buku' ";
   		   		   		
   		var firstLimit = initial - 10;
   		
   		var  checkRS = db.execute('SELECT rowid,CONTROL_NO,TITLE,PUBLICATION_INFO,CALL_NO,ISBN_ISSN,SMD,ITEM_CAT FROM vbooks WHERE TITLE IS NOT NULL '+appendcheckRS+' LIMIT '+firstLimit+','+limit);
   																																							   
   		var  checkTotalRS = db.execute('SELECT COUNT(*) AS jumlah FROM vbooks WHERE TITLE IS NOT NULL '+appendcheckRS);
   											
   			 var TotalRS = checkTotalRS.fieldByName('jumlah');
   		
   		i=0;
   		numbering = firstLimit + 1;
   		while (checkRS.isValidRow())
   		{  			
  			var crowid = checkRS.fieldByName('rowid');
  			var cTitle = othersM.toTitleCase(checkRS.fieldByName('TITLE'));
  			var cPublish = checkRS.fieldByName('PUBLICATION_INFO');
  			var cCallNo = checkRS.fieldByName('CALL_NO');
  			var cISBN_ISSN = checkRS.fieldByName('ISBN_ISSN');
  			var cSMD = checkRS.fieldByName('SMD');
  			var cITEM_CAT = checkRS.fieldByName('ITEM_CAT');
  			var cControlNo = checkRS.fieldByName('CONTROL_NO');
  			
  			if (cPublish == null)
  				var tcPublish = 'Publication Info N/A';
  			else
  				tcPublish = cPublish;
  			if (cCallNo == null)
  				var tcCallNo = 'Call Number N/A';
  			else
  				tcCallNo = cCallNo;
  			
  			if (selectedA.indexOf(numbering) == -1)
  				resultText = '<b>' + numbering +'.</b> '+ cTitle + '<br/><font color=lightgrey><i>' + tcPublish + '</i></font><br/><font color=yellow>' + tcCallNo + '</font><br/><br/>';
  			else
  				resultText = '<font color=grey><b>' + numbering +'.</b> '+ cTitle + '<br/><i>' + tcPublish + '</i><br/>' +tcCallNo + '</font><br/><br/>';
  			
  			resultTextRead = '<font color=grey><b>' + numbering +'.</b> '+ cTitle + '<br/><i>' + tcPublish + '</i><br/>' + tcCallNo + '</font><br/><br/>';
  			  			
  			if (cISBN_ISSN == '' || cISBN_ISSN == null || cISBN_ISSN == 'null') cISBN_ISSN = 'N/A';
  			if (cSMD == '' || cSMD == null || cSMD == 'null') cSMD = 'N/A';
  			
  			alertText = 'Title: '+cTitle+'\n\nPublication Info: '+cPublish+'\n\nCall Number: '+cCallNo+'\n\nISBN/ISSN: '+cISBN_ISSN+'\n\nCategory:\n'+cITEM_CAT;
  			 			 			
  			result[i] = Ti.UI.createLabel({
  				html:resultText,
  				htmlRead:resultTextRead,
  				numberRead:numbering,
  				alertText:alertText,
  				cTitle:cTitle,
  				cControlNo:cControlNo,  				
  				cCallNo:cCallNo,
  				cSMD:cSMD,
  				cISBN_ISSN:cISBN_ISSN,
  				cITEM_CAT:cITEM_CAT,
  				color:'white',left:0,font:{fontSize:14}});
  			result[i].addEventListener('longpress', function(e){					
					Ti.UI.Clipboard.clearText();
					Ti.UI.Clipboard.setText(e.source.alertText);
					var toastSCl = Ti.UI.createNotification({message:e.source.cCallNo+' copied to clipboard.',duration: Ti.UI.NOTIFICATION_DURATION_SHORT});
						toastSCl.show();
				});
  			result[i].addEventListener('click',function(e) {  				
  				e.source.html = e.source.htmlRead;
  				selectedA.push(e.source.numberRead);
  				Ti.API.info(selectedA);
  				
  				var htmltextDisplay = '<br/><b><font color=yellow>'+checkShelfM.checkShelf(e.source.cSMD,e.source.cITEM_CAT,e.source.cCallNo)+'</font></b>';//for android only
  				var alertText = e.source.alertText;
  				var htmlLabel = Ti.UI.createLabel({
  							html:htmltextDisplay,//for android
  							color:'yellow',
  							textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
  							width: Ti.UI.SIZE, height: Ti.UI.SIZE});  			
  				var dialog = Ti.UI.createAlertDialog(
  					{
  						buttonNames: ['Close','I Want To..','Status'],
	   					androidView: htmlLabel,
	   					message: alertText,
	   					cTitle:e.source.cTitle,
	   					cControlNo:e.source.cControlNo,
	   					cCallNo:e.source.cCallNo,
	   					cISBN_ISSN:e.source.cISBN_ISSN,
	   					title: 'More info'});
	   			dialog.addEventListener('click', function(e){
					if (e.index == 2) 
					{
						if (checkInternetConnection())
							returnStatusURL(e.source.cISBN_ISSN);
						else
							alert('Sorry, this feature requires internet connection.');
					} 
					if (e.index == 1) 
					{
						var opts = {
						  options: ['Books On Wheels', 'Bookmark','Cancel'],
						  cancel: 2,
						  cTitle:e.source.cTitle,
						  cControlNo:e.source.cControlNo,
	   					  cCallNo:e.source.cCallNo,
	   					  cISBN_ISSN:e.source.cISBN_ISSN,
						  title: 'Select Action'
						};
						var dialog2 = Ti.UI.createOptionDialog(opts);
						dialog2.addEventListener('click', function(e) {
							var selectedIndex = e.source.selectedIndex;
						    if (selectedIndex == 0)
						    	{						    		
						    		//go to google form with it fields prepopulated from this function
									var surl="https://docs.google.com/forms/d/e/1FAIpQLSceJGAYFc_qK3u6lAZvNqE-h2wj_75SYe50v_2u_HB0XKKUXA/viewform?usp=pp_url&entry.1286276726=&entry.1183882089=&entry.481763119=&entry.1949356321=&entry.253584895="+e.source.cTitle+"&entry.628182060="+e.source.cCallNo+"&entry.702207976";
						    		Ti.Platform.openURL(surl);
						    	}
						    if (selectedIndex == 1)
						    	{
						    		othersM.saveBookmark(e.source.cCallNo);
									Ti.API.info(othersM.readBookmark());
									var toastSB = Ti.UI.createNotification({message:e.source.cCallNo+' bookmarked.',duration: Ti.UI.NOTIFICATION_DURATION_SHORT});
									toastSB.show();
						    	}
						});
						dialog2.show();					
					}
				});
	   			dialog.show();
  				});
  			resultCard.add(result[i]);
  			checkRS.next();
  			i=i+1;
  			numbering = numbering +1;
		}	
		checkRS.close();
		
		if (TotalRS >= 1)
			{
				resultCard.add(navigationBar);
				if (initial == 10 && totalRecordInfoFlag == true)
				{
					var toast2 = Ti.UI.createNotification({message:TotalRS+" record(s) found.\nTap on result for more info.",duration: Ti.UI.NOTIFICATION_DURATION_SHORT});
					toast2.show();
				}				
			}
		else	
			{
				var toast = Ti.UI.createNotification({message:"No record(s) found.",duration: Ti.UI.NOTIFICATION_DURATION_SHORT});
				toast.show();
			}
		
		if (initial == 10)
			Prev.enabled = false;
		else
			Prev.enabled = true;
		if (initial < TotalRS)
			Next.enabled = true;
		else
			Next.enabled = false;
		
		if (TotalRS <= 10)
			resultCard.remove(navigationBar);
	}
	else
		alert('Please insert a search term');
		
	buttonGo.setTitle('Search 🔎');
	buttonGo.touchEnabled = true;
};