/*
offpacdb.sqlite configuration:
   CREATE VIRTUAL TABLE vbooks USING FTS3(CONTROL_NO VARCHAR, SMD VARCHAR, ITEM_CAT VARCHAR, ISBN_ISSN VARCHAR, CALL_NO VARCHAR, PUBLICATION_INFO VARCHAR, TITLE VARCHAR)
*/
var useScan = 'scandit';//scandit | tibarcode

function returnStatusURL(isbnVar)
{
	//return status of an isbn from the webopac
	Ti.Platform.openURL('http://pustaka.upsi.edu.my:8081/webopac/Search/Results?lookfor='+isbnVar+'&type=ISN');
}

function checkInternetConnection(){
return Ti.Network.online ? true : false;
}

if (Ti.Media.hasCameraPermissions()) {
	var proceed = 'true';
}
else
{
	Ti.Media.requestCameraPermissions(function(e) {
	     if (e.success === true) 
	     {
	    	var proceed = 'true';
	    	var dialogtel = Ti.UI.createAlertDialog({
    			cancel: 0,buttonNames: ['OK'],title: 'Alert',
    			message: 'App permission updated. Please restart for this app to load properly.'    			
  			});
  			dialogtel.addEventListener('click', function(g){
  			if (g.index == 0)
  			{
			     var activity = Titanium.Android.currentActivity;
			     activity.finish();
  			}
  			});
    		dialogtel.show();
	     } 
	     else 
	     {
	         alert("Please grant camera and storage permissions in order for this app to function normally. Please restart.");
	         var proceed = 'notTrue';
	 	 }
	});
}


/*

 -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

* */

//if all permission granted from the start then, the app begins: 

if (proceed == 'true')
{
	global.db = Ti.Database.open('offpacdb');
	db.remove();
	global.db = Ti.Database.install('/offpacdb.sqlite', 'offpacdb');
	
	//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	//checkShelf,searchDB,listBookMark module
	
	global.checkShelfM = require('func_checkShelf');
	var searchDBM = require('func_searchDB');
	var listBookMarkM = require('func_listBookMark');
	global.othersM = require('func_others');	
	
	//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	//create bookmark and main window
	
	var leftMenuView = Ti.UI.createView({width: Ti.UI.FILL,height: Ti.UI.FILL,layout:'vertical',backgroundColor: '#003333'});
	var win = Ti.UI.createView({width: Ti.UI.FILL,height: Ti.UI.FILL,layout: 'vertical',backgroundColor:'black',backgroundImage:'images/bg.png'});
	global.insideleftMenuView = Ti.UI.createScrollView({width: Ti.UI.FILL,backgroundColor: '#003333',height: '80%',layout: 'vertical'});
	
	win.addEventListener('android:back', function()
		{
	        db.close();
	        win.close();
	     	var activity = Titanium.Android.currentActivity;
	     	activity.finish();
	    });  
	
	var NappDrawerModule = require('dk.napp.drawer');
	global.drawer = NappDrawerModule.createDrawer({
		fullscreen:false, 
		leftWindow: leftMenuView,
		centerWindow: win,
		fading: 0.9, // 0-1
		parallaxAmount: 1, //0-1
		shadowWidth:"0dp", //40dp
		leftDrawerWidth: "290dp",//250dp
		animationMode: NappDrawerModule.ANIMATION_NONE,
		closeDrawerGestureMode: NappDrawerModule.CLOSE_MODE_MARGIN,
		openDrawerGestureMode: NappDrawerModule.OPEN_MODE_ALL,
		orientationModes: [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
	});		
	
	drawer.addEventListener("windowDidOpen", function(e){
		Ti.UI.Android.hideSoftKeyboard();
	  	var topLeftTitleText = Ti.UI.createLabel({text:'Bookmarks:',font:{fontSize:16},color:'white',height:'10%'});
		leftMenuView.add(topLeftTitleText);
		
		listBookMarkM.listBookMark();
		leftMenuView.add(insideleftMenuView);
			
		if (othersM.readBookmark() != '')
		{		
			var leftMenuViewInside = Titanium.UI.createScrollView({width: Titanium.UI.FILL,layout: 'horizontal',height:'10%',});
			
			var clearBMButton = Titanium.UI.createButton({title: 'Clear all', width: '100%',backgroundColor:"transparent"});
			clearBMButton.addEventListener('click',function(e){othersM.clearBookmark();drawer.toggleLeftWindow();});
						
			leftMenuViewInside.add(clearBMButton);
			leftMenuView.add(leftMenuViewInside);
		}		
		else
		{}
		insideleftMenuView.scrollTo(0,0);
	});
	
	drawer.addEventListener("windowDidClose", function(e){leftMenuView.removeAllChildren();insideleftMenuView.removeAllChildren();});
	
	drawer.addEventListener('open', onNavDrawerWinOpen);
	function onNavDrawerWinOpen(evt) {
	    this.removeEventListener('open', onNavDrawerWinOpen);
	    if(this.getActivity()) {
	        var actionBarAndroid = this.getActivity().getActionBar();
	        if (actionBarAndroid) {
	            actionBarAndroid.setTitle('OffPAC '+othersM.getDatabaseDate(Titanium.App.version));
	            actionBarAndroid.setDisplayHomeAsUp(true);
	            actionBarAndroid.setOnHomeIconItemSelected(function() {
	                drawer.toggleLeftWindow();
	           });
	        }
	    }  
	}
	
	drawer.open();
	
	
	//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	var convertISBNM = require('func_convertISBN');
	
	//scandit
	var scanditsdk = require("com.mirasense.scanditsdk");
	var picker;
	var closeButton;
	var scanISBNISSNtext;
	
	var win4full = Titanium.UI.createWindow({ 
	        navBarHidden:true,
	        fullscreen:true
	}); 
	
	var closeButton = Titanium.UI.createButton({title: 'Close',bottom:'20'});
			closeButton.addEventListener('click',function(e)
			{closeScanner();});
	var scanISBNISSNtext = Ti.UI.createLabel({text:'Scan ISBN barcode',font:{fontSize:10},color:'white',bottom:'5'});
	
	var openScanner = function() {
	       	picker = scanditsdk.createView({
	        width:"100%",
	        height:"100%"
			});
	  
	var closeScanner = function() {
	    if (picker != null) {
	        picker.stopScanning();        
	        win4full.remove(closeButton);
			win4full.remove(scanISBNISSNtext);
			win4full.remove(picker);
	    }
	    win4full.close();
	};
   
	picker.init("4RR54Hj8EeOTug7hmcTpPvxw+t2u8AsF2TR+naxg61o", 0);
    
	picker.setSuccessCallback(function(e) {
        var strToCheck = e.barcode;
		var res = strToCheck.substring(4,0);
        setTimeout(function() {
            picker.stopScanning();
            win4full.close();
            win4full.remove(picker);
            textField.value = e.barcode;
            closeScanner();
            selectedSearch = 'In All';
            pickerType.setSelectedRow(0,0,false);
            buttonGo.fireEvent('click');
        }, 1);         
	});
		
	win4full.add(picker);
	
	closeButton = Titanium.UI.createButton({title: 'Close',bottom:'15'});
					closeButton.addEventListener('click',function(e)
					{closeScanner();});
	scanISBNISSNtext = Ti.UI.createLabel({text:'Scan ISBN barcode',font:{fontSize:10},color:'white',bottom:'5'});
	
	win4full.add(closeButton);
	win4full.add(scanISBNISSNtext);
    
	win4full.addEventListener('open', function(e) {
		picker.setOrientation(win4full.orientation);      
        picker.setSize(Ti.Platform.displayCaps.platformWidth,Ti.Platform.displayCaps.platformHeight);
        picker.startScanning(); 
	});
    
	win4full.open();
	};
	
	Ti.Gesture.addEventListener('orientationchange', function(e) {
	    win4full.orientationModes = [Titanium.UI.PORTRAIT, Titanium.UI.UPSIDE_PORTRAIT, 
	                   Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];
	    if (picker != null) {
	        picker.setOrientation(e.orientation);
	        picker.setSize(Ti.Platform.displayCaps.platformWidth, 
	                Ti.Platform.displayCaps.platformHeight);
	    }
	});
	
	//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	//layout
	
	global.result = [];
	global.selectedA = [];
	global.initial = 10;
	global.limit = 10;
	global.numbering = 0;
	global.totalRecordInfoFlag = true;
	global.controlNumPass3 = '';//to be used in func_showItemStatus.js
	global.selectedSearch = 'In All';//global variable to be use in searchDB function and picker change event
	
	var actionBar = Titanium.UI.createView({top:'15dp',height:70,backgroundColor:'transparent'});
	var leftToolbarBtn = Titanium.UI.createView({
	   borderRadius: 150,
	   backgroundColor:'#003333',
	   width:"100dp",
	   height:"40dp",
	   left:'-20dp'
	});
		var labelLeftBtn = Ti.UI.createLabel({
		  color: 'white',
		  font: { fontSize:24 },
		  text: '≡',
		  textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
		  width: Ti.UI.SIZE, height: Ti.UI.SIZE
		});
	leftToolbarBtn.add(labelLeftBtn);
	leftToolbarBtn.addEventListener("click", function(){
		drawer.toggleLeftWindow();
	});	
	
	var centerToolbarBtn = Titanium.UI.createView({
	   borderRadius: 150,
	   backgroundColor:'transparent',
	   width:Ti.UI.FILL,
	   height:"40dp",
	   layout:'vertical'
	});
	var labelCenterBtn = Ti.UI.createLabel({
		  color: 'white',
		  font: { fontSize:16 },
		  textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		  text: 'OffPAC\nDatabase'+ othersM.getDatabaseDate(Titanium.App.version),
		});
	centerToolbarBtn.add(labelCenterBtn);
	
	var rightToolbarBtn = Titanium.UI.createView({
	   borderRadius: 150,
	   backgroundColor:'#003366',
	   width:"100dp",
	   height:"40dp",
	   right:'-15dp'
	});
		var labelRightBtn = Ti.UI.createLabel({
		  color: 'white',
		  font: { fontSize:14 },
		  text: 'ISBN Scan',
		  textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
		  width: Ti.UI.SIZE, height: Ti.UI.SIZE
		});
	rightToolbarBtn.add(labelRightBtn);
	rightToolbarBtn.addEventListener("click", function(){
		if (useScan == 'scandit')
	   {
	   		Ti.UI.Android.hideSoftKeyboard();
   			openScanner(); 
	   }
	   else if (useScan == 'tibarcode')
	   {
		   Ti.UI.Android.hideSoftKeyboard();
		   reset();
		   Barcode.capture({
		        animate: true,
		        overlay: overlay,
		        showCancel: false,
		        showRectangle: true,
		        keepOpen: false
		    });  
	   }
	});	
	rightToolbarBtn.addEventListener("touchstart", function(){
		rightToolbarBtn.backgroundColor = 'grey';
	});	
	rightToolbarBtn.addEventListener("touchend", function(){
		rightToolbarBtn.backgroundColor = '#003366';
	});	
		
	actionBar.add(centerToolbarBtn);
	actionBar.add(leftToolbarBtn);
	actionBar.add(rightToolbarBtn);	
	    
	var textFieldColor = 'white';	
	var textField = Ti.UI.createTextField({borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,color:textFieldColor,top: 5, width: "70%", height: 60});
	textField.hintText = 'Enter your term';
	
	global.pickerType = Ti.UI.createPicker({width:'30%'});
	var dataType = [];
	dataType[0]=Ti.UI.createPickerRow({title:'In All'});
	dataType[1]=Ti.UI.createPickerRow({title:'In Thesis'});
	dataType[2]=Ti.UI.createPickerRow({title:'In Multimedia'});
	dataType[3]=Ti.UI.createPickerRow({title:'In Book'});
	
	pickerType.add(dataType);
	pickerType.selectionIndicator = true;
	pickerType.addEventListener('change',function(e){selectedSearch = e.row.title;});
	
	var inputBar = Titanium.UI.createView({layout: 'horizontal',top:0,height:60});
	inputBar.add(textField);
	inputBar.add(pickerType);
	
	var searchBar = Titanium.UI.createView({layout: 'horizontal',height:45,});
	
	global.buttonGo = Titanium.UI.createButton({title: 'Search 🔎', width: '100%', height: 45});
	buttonGo.addEventListener('click',function(e)
	{
	  Ti.UI.Android.hideSoftKeyboard();
	  initial = 10;
	  totalRecordInfoFlag = true;
	  selectedA = [];
	  searchDBM.searchDB(textField.value,selectedSearch);   
	});	
	
	searchBar.add(buttonGo);	
	
	global.resultCard = Titanium.UI.createScrollView({width: Titanium.UI.FILL,layout: 'vertical',top:10});
	
	global.navigationBar = Titanium.UI.createView({layout: 'horizontal',top:5,height:140});
	global.Next = Titanium.UI.createButton({title: 'Next >', width: '50%', height: 60, backgroundColor:"transparent"});
		Next.addEventListener('click',function(e) {initial=initial+10;searchDBM.searchDB(textField.value,selectedSearch);totalRecordInfoFlag = false;});
	global.Prev = Titanium.UI.createButton({title: '< Prev', width: '50%', height: 60, backgroundColor:"transparent"});
		Prev.addEventListener('click',function(e) {initial=initial-10;searchDBM.searchDB(textField.value,selectedSearch);totalRecordInfoFlag = false;});
	navigationBar.add(Prev);
	navigationBar.add(Next);
	
	win.add(actionBar);
	win.add(inputBar);
	win.add(searchBar);
	win.add(resultCard);
}