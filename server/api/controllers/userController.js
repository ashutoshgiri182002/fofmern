const allDetails = require("../models/AllDetails");

//Function for Validation of Search Friend Hash String
const validateHashString = (hashString) => {
	//Validation of hashString => 2007#2008#Kendriya Vidyalaya 12 Dwarka#idsxd8dsf9sd9f8
	const array = hashString.split("#");
	for (let i = 0; i < array.length; i++) {
		if (array[i].trim().length === 0) {
			return false;
		}
	}
	return true;
}

//All Details Route -> POST Method  --> /auth/allDetails
exports.allDetailsController = async (req, res) => {
	console.log("📑 All Details Page Data (After Validation): \n", req.data);

	//Fetch From Database or JWT Token
	const username = req.user.username;
	console.log("🙋Username: ", username);

	const { fullName, imageURL, instagram, bio, gender, state, city, schoolDetails } = req.data;

	//Saving All Details to Database
	const all_details = new allDetails({ username, fullName, imageURL, instagram, bio, gender, state, city, schoolDetails });

	all_details
		.save()
		.then((data) => {
			console.log("✅ All Details Saved to Database Successfully! \n", data);
			res
				.status(200)
				.json({ message: "✅ All Details Saved to Database Successfully!", redirect: "/" });
		})

		.catch((err) => {
			console.log("😥 Error in Saving All Details to Database: \n", err);
			res.status(500).json({ message: "😥 Error in Saving All Details to Database!" });
		});
};


//Search Friends by Class Details Route -> POST Method  --> /user/searchFriends
exports.searchFriendsController = async (req, res) => {
	/*Input Form Data: -->
	  {
		  className:"LKG",
		  hashString: "2010#2011#Kendriya Vidyalaya Sector 12 Dwarka#ChIJAQAAQMUaDTkR2Rh9YCDDYCs"
	  }
	*/

	console.log("📑 Search Friends Page Data: \n", req.body);

	//Validation of Search Friends Form Data ====>
	let { className, hashString } = req.body;

	//Handling all False Value: undefined / null / 0 / -0 / NaN / "" / false
	if (!className) className = "";
	if (!hashString) hashString = "";

	//Trimming hashString
	hashString = hashString.trim();

	//Validation of className => UKG, LKG, I, II, III, IV, V, VI, VII, VIII, IX, X, XI, XII
	const validClassNames = ["UKG", "LKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

	if (!validClassNames.includes(className)) {
		return res.status(400).json({ classNameError: "Invalid Class Name!" });
	}

	//Validation of hashString => 2010#2011#Kendriya Vidyalaya Sector 12 Dwarka#ChIJAQAAQMUaDTkR2Rh9YCDDYCs
	if (validateHashString(hashString)) {
		//Searching Friends in Database
		const friends = await allDetails.find({
			[`schoolDetails.${className}`]: hashString,
		});

		// console.log("👫 Friends Found: \n", friends);
		return res.status(200).json({ "friends": friends });
	}

	else {
		return res.status(200).json({ message: "Invalid Hash String!", friends: [] });
	}

};

//User Information Route -> GET Method  --> /user/userInformation
exports.userInformationController = async (req, res) => {
	const username = req.user.username;
	console.log("🙋Username: ", username);

	let userInfo;
	//Fetching User Information from Database
	try {
		userInfo = await allDetails.findOne({ username: username });
		// console.log("👤 User Information: \n", userInfo);
		return res.status(200).json({ "userInfo": userInfo });
	}
	catch (err) {
		console.log("😥 Error in Fetching User Information from Database: \n", err);
		return res.status(500).json({ message: "😥 Error in Fetching User Information from Database!" });
	}
}
