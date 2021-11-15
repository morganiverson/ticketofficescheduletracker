window.onload = () => {
	url = (new URL(window.location)).searchParams
	if (url.has("eventID")) {
		eventID = url.get("eventID");
		console.log(eventID)

		getEventDetails(eventID)
		.then((event) => {
			if(event) {
				Object.keys(event).forEach((key) => {
					try{
						document.getElementById(key)
					}
				})


			}
			else 
			{
				document.body = "EVENT NOT FOUND"
			}
		})

	}
	else {
		document.body = "EVENT NOT FOUND"
	}
	
}