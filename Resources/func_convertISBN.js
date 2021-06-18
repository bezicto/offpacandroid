exports.convertISBN = function (form)
{
	// Set default variables and cleanup ISBN
	var form = form.replace(/[-\s]/g,"").toUpperCase();
	var isbnnum = form;
	var isbn10exp = /^\d{9}[0-9X]$/;
	var isbn13exp = /^\d{13}$/;
	var isbnlen = isbnnum.length;
	var total = 0;

   	if (!(isbn10exp.test(isbnnum)) && !(isbn13exp.test(isbnnum))) {
		if ((isbnlen != 10) && (isbnlen != 13)) {
 			alert("This ISBN is invalid." + "\n" + "It contains " + isbnlen + " characters.");
		}
		else {
 			alert("This ISBN is invalid." + "\n" + "It contains invalid characters.");			
		}
          	return false;
    	}

	// Validate & convert a 10-digit ISBN
	if (isbnlen == 10) {
		// Test for 10-digit ISBNs:
		// Formulated number must be divisible by 11
		// 0234567899 is a valid number
		for (var x=0; x<9; x++) { 
			total = total+(isbnnum.charAt(x)*(10-x)); 
		}

		// check digit
		z = isbnnum.charAt(9);
		if (z == "X") { z = 10; }

		// validate ISBN
		if ((total+z*1) % 11 != 0) {   // modulo function gives remainder
			z = (11 - (total % 11)) % 11;
			if (z == 10) { z = "X"; }
			alert("This 10-digit ISBN is invalid." + "\n" +
			      "The check digit should be " + z + ".");
			return false;
		}
		else {
			// convert the 10-digit ISBN to a 13-digit ISBN
			isbnnum = "978"+isbnnum.substring(0,9);
			total = 0;
			for (var x=0; x<12; x++) {
				if ((x % 2) == 0) { y = 1; }
				else { y = 3; }
				total = total+(isbnnum.charAt(x)*y);
			}		
			z = (10 - (total % 10)) % 10;
		}		
	}

	// Validate & convert a 13-digit ISBN
	else { 
		// Test for 13-digit ISBNs
		// 9780234567890 is a valid number
		for (var x=0; x<12; x++) {
			if ((x % 2) == 0) { y = 1; }
			else { y = 3; }
			total = total+(isbnnum.charAt(x)*y);
		}

		// check digit
		z = isbnnum.charAt(12);

		// validate ISBN		
		if ((10 - (total % 10)) % 10 != z) {   // modulo function gives remainder
			z = (10 - (total % 10)) % 10; 
			alert("This 13-digit ISBN is invalid." + "\n" +
			      "The check digit should be " + z + ".");
			return false;
		}
		else {
			// convert the 13-digit ISBN to a 10-digit ISBN
			if ((isbnnum.substring(0,3) != "978")) {
				alert("This 13-digit ISBN does not begin with \"978\"" + "\n" +
				      "It cannot be converted to a 10-digit ISBN.");
				return false;
			}
			else {
				isbnnum = isbnnum.substring(3,12);
				total = 0;
				for (var x=0; x<9; x++) {
					total = total+(isbnnum.charAt(x)*(10-x));
				}
				z = (11 - (total % 11)) % 11;
				if (z == 10) { z = "X"; } 
			}
		}
	}

	var convertedISBN = isbnnum+z; 
	return convertedISBN;

};//convertISBN(form)
