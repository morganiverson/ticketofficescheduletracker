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
						[...document.getElementsByName(key)][0].value = event[key]
						console.log
					}
					catch(e){
						console.log("Element Not Found!")
					}
				})


			}
			else 
			{
				document.body.innerHTML = "<h1>EVENT NOT FOUND</h1>"
			}
		})

	}
	else {
		document.body.innerHTML = "<h1>EVENT NOT FOUND</h1>"
	}
	
}

//populate selectors
//set id
//parse times