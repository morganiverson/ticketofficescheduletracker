window.onload = () => {
	url = (new URL(window.location)).searchParams
	if (url.has("eventID")) {
		eventID = url.get("eventID");
		console.log(eventID)

		getEventDetails(eventID)
		.then((event) => {
			if(event) {


			}
			else 
			{document.body = "EVENT NOT FOUND"}
		})

	}
	else {
		document.body = "EVENT NOT FOUND"
	}
	
}