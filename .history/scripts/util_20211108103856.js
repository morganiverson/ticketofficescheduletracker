function getJSON(path) {
	return $.get(
		"../r/getJSON?data=" + path,
		(data) => {
			return data
		})
}


function getUserData(eid, attribute) {
	return $.get(
		"../r/getJSON?data=data/workers.json",
		(data) => {
			return data
		})
		.then((data) => {
			return data.find(worker => worker.eid == eid)[attribute]
		})
}
function writeJSON(path, data) {
	console.log(Object.keys(data))
	keys = Object.keys(data).slice(1)
	keys.forEach(key => {
		getUserData(data.eid, key).then((json) => {
			console.log(json)
		})
	})
}

function writeAvailability(data, errorMessage) {
	console.log(Object.keys(data))
	keys = Object.keys(data).slice(1)

	return getJSON("data/workers.json").then((workerData) => {
		worker = workerData.find(worker => worker.eid == data["eid"])
		worker["eventsAvailable"] = data["eventsAvailable"]
		console.log("Modified workers.json", workerData)
		return workerData
	})
		.then((modifiedWorkerData) => {
			return write(modifiedWorkerData, "data/workers.json", "There was a problem updating your availability")
		})
}

function removeWorker(eid){
	getJSON("data/workers.json").then((workers) => {
		where = workers.findIndex(worker => worker.eid == eid)
		workers.splice(where)
		return workers
	})
	.then ((workers) => {

	})
}
function modifyWorkerDataInDB(formData) {
	return getJSON("data/workers.json").then((workers) => {
		worker = workers.findIndex(worker => worker.eid == formData["eid"]);
		workers[] = formData;
		console.log("Modified workers.json", workers);
		return workers;
	})
		.then((modifiedWorkerData) => {
			return write(modifiedWorkerData, "data/workers.json", "There was a problem updating this user.");
		})
}

function addNewUser(newWorker) {
	return getJSON("data/workers.json")
		.then((workers) => {
			if (newWorker.has("eid") && newWorker.has("firstname") && newWorker.has("role")) {
				workers.push(newWorker)
				return workers
			}
			else {
				return null
			}
		})
		.then((modifiedWorkerList) => {
			return write(modifiedWorkerList, "data/workers.json", "There was a problem adding this user.")
		})
}

function setSessionStorageItem(sessionStorage, key, value) {
	sessionStorage.setItem(key, toJSON(value))
}

function getSessionStorageItem(sessionStorage, key) {
	value = sessionStorage.getItem(key);

	try {
		value = JSON.parse(value);
	}
	catch (e) {
	}
	console.log("Getting Session Storage:", key, "=>", value);
	return value
}

function getTicketOfficeEvents() {
	return getJSON("data/events.json").then((res) => {
		return res
	})
}
function toJSON(data) {
	return (typeof data != "string") ? JSON.stringify(data, null, 4) : data;
}

function getCurrentlyLoggedInUser() {
	return $.post("/currentUser",
		(eid) => {
			return eid
		})
}

function getEventDetails(eventID) {
	return getJSON("data/events.json").then((events) => {
		return events.find(event => event.id == eventID)
	})

}

function getWorkersAvailableForEvent(eventID) {
	return getJSON("data/workers.json")
		.then((workers) => {
			workersAvailable = []

			workers.forEach((worker) => {
				if (worker.eventsAvailable.includes(eventID)) {
					workersAvailable.push(worker.lastname + ", " + worker.firstname)
				}
			})

			return workersAvailable
		})
}

function appendCurrentURL(add) {
	currentURL = window.location.href.split('/');

	currentURL.shift() //remove href:
	currentURL.shift() //remove ''
	currentURL.shift() //remove localhost:8000


	currentURL.pop()
	currentURL.push(add)
	console.log("/" + currentURL.join("/"))
	return "/" + currentURL.join("/")
}

function write(fileContents, fileName, errorMessage){
	return $.post("../w", 
		{
			"fileContents": toJSON(fileContents), 
			"fileName": fileName, 
			"errorMessage": errorMessage
		}, 
		(res) => {
			return res
		})
}