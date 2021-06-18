exports.listBookMark = function ()
{
	var book = [];	
	var arrayReadBookMark = othersM.readBookmark().toString().split("\n");
	var htmlReadBookMark = '';
	for(i in arrayReadBookMark) 
	{	
    	if (arrayReadBookMark[i] != '')
    	{
    		var checkBookRS = db.execute("SELECT CONTROL_NO,TITLE,PUBLICATION_INFO,CALL_NO,ISBN_ISSN,SMD,ITEM_CAT FROM vbooks WHERE CALL_NO MATCH '"+arrayReadBookMark[i]+"' LIMIT 1");	
  				var bControlNo = checkBookRS.fieldByName('CONTROL_NO');
  				var bTitle = othersM.toTitleCase(checkBookRS.fieldByName('TITLE'));
  				var bPublish = checkBookRS.fieldByName('PUBLICATION_INFO');
  				var bCallNo = checkBookRS.fieldByName('CALL_NO');
  				var bISBN_ISSN = checkBookRS.fieldByName('ISBN_ISSN');
  				var bSMD = checkBookRS.fieldByName('SMD');  		
  				var bITEM_CAT = checkBookRS.fieldByName('ITEM_CAT');
  			checkBookRS.close();  			
  			
  			if (bISBN_ISSN == '' || bISBN_ISSN == null || bISBN_ISSN == 'null') bISBN_ISSN = 'N/A';
  			if (bSMD == '' || bSMD == null || bSMD == 'null') bSMD = 'N/A';
  			
  			var resultBook = 'Title: '+bTitle+'\n\nPublication Info: '+bPublish+'\n\nCall Number: '+bCallNo+'\n\nISBN/ISSN: '+bISBN_ISSN+'\n\nCategory:\n'+bITEM_CAT;
  			
  			//android only
  			markText = '<font color=cyan>'+bTitle+'</font><br/><font color=yellow>'+arrayReadBookMark[i]+'</font><br/><br/>';
  			
			book[i] = Ti.UI.createLabel({
  				html:markText,
  				resultBook:resultBook,
  				bTitle:bTitle,
  				bControlNo:bControlNo,
  				bCallNo:bCallNo,
  				bSMD:bSMD,
  				bITEM_CAT:bITEM_CAT,
  				bISBN_ISSN:bISBN_ISSN,
  				color:'white',left:0});  		
  			book[i].addEventListener('click',function(e) 
  			{
  				var htmltextDisplay = '<br/><b><font color=yellow>'+checkShelfM.checkShelf(e.source.bSMD,e.source.bITEM_CAT,e.source.bCallNo)+'</font></b>';//for android only
  				var resultBook = e.source.resultBook;  				
  				var htmlLabel = Ti.UI.createLabel({
  							html:htmltextDisplay,//for android
  							color:'yellow',
  							textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
  							width: Ti.UI.SIZE, height: Ti.UI.SIZE}); 
  				var dialogI = Ti.UI.createAlertDialog({
  					buttonNames: ['Close','I Want To..','Remove'],
	   				message: resultBook,
	   				androidView: htmlLabel,
	   				bTitle:e.source.bTitle,
	   				bControlNo:e.source.bControlNo,
	   				bCallNo:e.source.bCallNo,
	   				bISBN_ISSN:e.source.bISBN_ISSN,
	   				title: 'More info'});
	   			dialogI.addEventListener('click', function(e){
					if (e.index == 1) 
					{
						if (checkInternetConnection())
							{
								var opts = {
								  options: ['Status', 'Books On Wheels','Cancel'],
								  cancel: 2,
								  bTitle:e.source.bTitle,
								  bControlNo:e.source.bControlNo,
			   					  bCallNo:e.source.bCallNo,
			   					  bISBN_ISSN:e.source.bISBN_ISSN,
								  title: 'Select Action'
								};
								var dialog2 = Ti.UI.createOptionDialog(opts);
								dialog2.addEventListener('click', function(e) {
									var selectedIndex = e.source.selectedIndex;
								    if (selectedIndex == 0)
								    	{						    		
								    		returnStatusURL(e.source.bISBN_ISSN);
								    	}
								    else if (selectedIndex == 1)
								    	{
								    		//go to google form with it fields prepopulate by values from this function
											var surl="https://docs.google.com/forms/d/e/1FAIpQLSceJGAYFc_qK3u6lAZvNqE-h2wj_75SYe50v_2u_HB0XKKUXA/viewform?usp=pp_url&entry.1286276726=&entry.1183882089=&entry.481763119=&entry.1949356321=&entry.253584895="+e.source.bTitle+"&entry.628182060="+e.source.bCallNo+"&entry.702207976";
						    				Ti.Platform.openURL(surl);
								    	}
								});
								dialog2.show();									
							}
						else
							alert('Sorry, this feature requires internet connection.');
					}
					else if (e.index == 2) {drawer.toggleLeftWindow();othersM.removeBookMark(e.source.bCallNo);}
				});
	   			dialogI.show();
  			});
  			insideleftMenuView.add(book[i]);  
  		}		
	}
};