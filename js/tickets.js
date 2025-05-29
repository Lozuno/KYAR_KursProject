document.addEventListener("DOMContentLoaded", () => {
	const loadingScreen = document.querySelector(".loading-screen");

	function showLoadingScreen() {
		if (loadingScreen) {
			loadingScreen.classList.remove("hidden");
			document.body.style.overflow = "hidden";
		}
	}

	function hideLoadingScreen() {
		if (loadingScreen) {
			setTimeout(() => {
				loadingScreen.classList.add("hidden");
				setTimeout(() => {
					document.body.style.overflow = "";
				}, 500);
			}, 800);
		}
	}

	initTicketsPage();
	showLoadingScreen();
	loadTicketsFromXML()
		.then(() => {
			hideLoadingScreen();
			handleUrlParams();
		})
		.catch((error) => {
			console.error("Ошибка при загрузке билетов:", error);
			hideLoadingScreen();
		});
});

function initTicketsPage() {
	setupSearchForm();
	setupSelectButtons();
}

function setupSearchForm() {
	const searchForm = document.querySelector(".search-form");
	if (!searchForm) return;

	searchForm.addEventListener("submit", (e) => {
		e.preventDefault();

		const resultsSection = document.querySelector(".search-results");
		if (!resultsSection) return;

		resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
		animateSearchResults(resultsSection);
	});
}

function animateSearchResults(resultsSection) {
	resultsSection.style.opacity = "0.7";

	setTimeout(() => {
		resultsSection.style.opacity = "1";
		animateTicketCards(resultsSection);
	}, 300);
}

function animateTicketCards(resultsSection) {
	const ticketCards = resultsSection.querySelectorAll(".ticket-card");

	ticketCards.forEach((card, index) => {
		card.style.opacity = "0";
		card.style.transform = "translateY(20px)";

		setTimeout(() => {
			card.style.opacity = "1";
			card.style.transform = "translateY(0)";
		}, index * 100);
	});
}

function setupSelectButtons() {
	document.addEventListener("click", (event) => {
		const button = event.target.closest(".select-button");
		if (button) {
			showTicketSelection(button);
		}
	});
}

function showTicketSelection(button) {
	const ticketCard = button.closest(".ticket-card");
	if (!ticketCard) return;

	const ticketInfo = {
		train: ticketCard.querySelector(".train-number")?.textContent,
		from: ticketCard.querySelector(".departure .city")?.textContent,
		to: ticketCard.querySelector(".arrival .city")?.textContent,
		date: ticketCard.querySelector(".departure .date")?.textContent,
		time: ticketCard.querySelector(".departure .time")?.textContent,
		price: button.previousElementSibling?.textContent,
	};

	alert(
		`Билет выбран!\n\nПоезд: ${ticketInfo.train}\nМаршрут: ${ticketInfo.from} - ${ticketInfo.to}\nДата: ${ticketInfo.date} ${ticketInfo.time}\nЦена: ${ticketInfo.price}`
	);
}

function loadTicketsFromXML() {
	return fetch("data/routes.xml")
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			return response.text();
		})
		.then((xmlString) => {
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlString, "text/xml");

			// Проверяем наличие ошибок в XML
			const parseError = xmlDoc.querySelector("parsererror");
			if (parseError) {
				throw new Error("XML parsing error");
			}

			const routeElements = xmlDoc.getElementsByTagName("route");

			if (routeElements.length === 0) {
				console.warn("Предупреждение: XML файл не содержит маршрутов");
			}

			const resultsList = document.querySelector(".results-list");
			if (!resultsList) return;

			resultsList.innerHTML = "";

			Array.from(routeElements).forEach((routeEl) => {
				const ticket = parseRouteToTicket(routeEl);
				const ticketCard = createTicketCard(ticket);
				resultsList.appendChild(ticketCard);
			});

			return true;
		})
		.catch((error) => {
			console.error("Ошибка загрузки XML билетов:", error);
			const resultsList = document.querySelector(".results-list");
			if (resultsList) {
				resultsList.innerHTML =
					'<div class="error-message">К сожалению, не удалось загрузить информацию о билетах. Пожалуйста, попробуйте позже.</div>';
			}
			throw error;
		});
}

function parseRouteToTicket(routeEl) {
	return {
		id: getElementContent(routeEl, "id"),
		train: {
			number: getElementContent(routeEl, "trainNumber"),
			type: getElementContent(routeEl, "trainType"),
		},
		route: {
			from: getElementContent(routeEl, "from"),
			to: getElementContent(routeEl, "to"),
			departure: {
				date: "15.07.2024",
				time: getElementContent(routeEl, "departureTime"),
			},
			arrival: {
				date: "15.07.2024",
				time: getElementContent(routeEl, "arrivalTime"),
			},
			duration: getElementContent(routeEl, "duration"),
			distance: getElementContent(routeEl, "distance"),
		},
		options: Array.from(routeEl.querySelectorAll("seatTypes seatType")).map(
			(option) => ({
				type: getElementContent(option, "type"),
				seats: getElementContent(option, "available"),
				price: getElementContent(option, "price"),
				currency: "BYN",
			})
		),
		features: Array.from(routeEl.querySelectorAll("features feature")).map(
			(feature) => feature.textContent.trim()
		),
	};
}

function getElementContent(element, path) {
	const pathParts = path.split(" ");
	let currentElement = element;

	for (const part of pathParts) {
		const found = currentElement.getElementsByTagName(part);
		if (found.length === 0) return "";
		currentElement = found[0];
	}

	return currentElement.textContent.trim();
}

function createTicketCard(ticket) {
	const ticketCard = document.createElement("div");
	ticketCard.className = "ticket-card";

	let optionsHTML = "";
	ticket.options.forEach((option) => {
		optionsHTML += `
            <div class="ticket-option">
                <div class="option-type">${option.type}</div>
                <div class="option-details">
                    <span class="seats">${option.seats} мест</span>
                    <span class="price">${option.price} ${option.currency}</span>
                </div>
                <button class="select-button pulse-effect">Выбрать</button>
            </div>
        `;
	});

	let featuresHTML = "";
	ticket.features.forEach((feature) => {
		let featureClass = "";
		if (feature.toLowerCase().includes("wi-fi")) featureClass = "wifi";
		else if (feature.toLowerCase().includes("питание"))
			featureClass = "food";
		else if (feature.toLowerCase().includes("розетк"))
			featureClass = "power";
		else if (feature.toLowerCase().includes("велосипед"))
			featureClass = "bike";

		featuresHTML += `<span class="feature ${featureClass}">${feature}</span>`;
	});

	ticketCard.innerHTML = `
        <div class="ticket-header">
            <div class="train-info">
                <span class="train-number">№ ${ticket.train.number}</span>
                <span class="train-type">${ticket.train.type}</span>
            </div>
            <div class="train-time">
                <div class="departure">
                    <span class="time">${ticket.route.departure.time}</span>
                    <span class="date">${ticket.route.departure.date}</span>
                    <span class="city">${ticket.route.from}</span>
                </div>
                <div class="duration">
                    <span class="time">${ticket.route.duration}</span>
                    <div class="duration-line"></div>
                </div>
                <div class="arrival">
                    <span class="time">${ticket.route.arrival.time}</span>
                    <span class="date">${ticket.route.arrival.date}</span>
                    <span class="city">${ticket.route.to}</span>
                </div>
            </div>
        </div>
        <div class="ticket-body">
            <div class="ticket-options">
                ${optionsHTML}
            </div>
        </div>
        <div class="ticket-footer">
            <div class="train-features">
                ${featuresHTML}
            </div>
        </div>
    `;

	return ticketCard;
}

function handleUrlParams() {
	const urlParams = new URLSearchParams(window.location.search);
	const fromCity = urlParams.get("from");
	const toCity = urlParams.get("to");

	if (fromCity || toCity) {
		const fromSelect = document.getElementById("from-city");
		const toSelect = document.getElementById("to-city");

		if (fromCity && fromSelect) {
			const fromOption = Array.from(fromSelect.options).find(
				(option) =>
					option.text === fromCity ||
					option.value === fromCity.toLowerCase()
			);

			if (fromOption) {
				fromSelect.value = fromOption.value;
			}
		}

		if (toCity && toSelect) {
			const toOption = Array.from(toSelect.options).find(
				(option) =>
					option.text === toCity ||
					option.value === toCity.toLowerCase()
			);

			if (toOption) {
				toSelect.value = toOption.value;
			}
		}

		const departureDate = document.getElementById("departure-date");
		if (departureDate) {
			const today = new Date();
			const formattedDate = today.toISOString().split("T")[0];
			departureDate.value = formattedDate;
			departureDate.focus();
		}

		const searchButton = document.querySelector(".search-button");
		if (searchButton) {
			searchButton.click();
		}
	}
}
