document.addEventListener("DOMContentLoaded", function () {
	const searchInput = document.getElementById("route-search");
	const routesList = document.querySelector(".routes-list");
	const departureSelect = document.getElementById("departure");
	const arrivalSelect = document.getElementById("arrival");
	const filterButton = document.querySelector(".filter-button");
	const loadingScreen = document.querySelector(".loading-screen");

	let allRoutes = [];
	let displayedRoutes = [];

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

	function loadRoutesFromXML() {
		showLoadingScreen();

		fetch("data/routes.xml")
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.text();
			})
			.then((xmlString) => {
				const parser = new DOMParser();
				const xmlDoc = parser.parseFromString(xmlString, "text/xml");

				const parseError = xmlDoc.querySelector("parsererror");
				if (parseError) {
					throw new Error("XML parsing error");
				}

				const routeElements = xmlDoc.getElementsByTagName("route");

				if (routeElements.length === 0) {
					console.warn(
						"Предупреждение: XML файл не содержит маршрутов"
					);
				}

				allRoutes = Array.from(routeElements).map((routeEl) => {
					return {
						id: getElementValue(routeEl, "id"),
						from: getElementValue(routeEl, "from"),
						to: getElementValue(routeEl, "to"),
						duration: getElementValue(routeEl, "duration"),
						distance: getElementValue(routeEl, "distance"),
						price: getElementValue(routeEl, "price"),
						trainNumber: getElementValue(routeEl, "trainNumber"),
						trainType: getElementValue(routeEl, "trainType"),
						departureTime: getElementValue(
							routeEl,
							"departureTime"
						),
						arrivalTime: getElementValue(routeEl, "arrivalTime"),
					};
				});

				displayedRoutes = allRoutes;
				renderRoutes(displayedRoutes);
				populateCitySelects();

				hideLoadingScreen();
			})
			.catch((error) => {
				console.error("Ошибка загрузки XML:", error);

				// Используем существующие маршруты в DOM, если XML не загрузился
				if (routesList && routesList.children.length > 0) {
					displayedRoutes = Array.from(routesList.children);
					console.log("Используются статические маршруты из DOM");
				} else {
					if (routesList) {
						const errorMessage = document.createElement("div");
						errorMessage.className = "no-results";
						errorMessage.textContent =
							"Не удалось загрузить маршруты. Пожалуйста, проверьте соединение.";
						routesList.appendChild(errorMessage);
					}
				}

				hideLoadingScreen();
			});
	}

	function getElementValue(parentEl, tagName) {
		const element = parentEl.getElementsByTagName(tagName)[0];
		return element ? element.textContent : "";
	}

	function populateCitySelects() {
		if (!departureSelect || !arrivalSelect) return;

		const cities = [
			...new Set([
				...allRoutes.map((route) => route.from),
				...allRoutes.map((route) => route.to),
			]),
		].sort();

		const departureValue = departureSelect.value;
		const arrivalValue = arrivalSelect.value;

		while (departureSelect.options.length > 1) {
			departureSelect.remove(1);
		}

		while (arrivalSelect.options.length > 1) {
			arrivalSelect.remove(1);
		}

		// Добавляем города в списки
		cities.forEach((city) => {
			const departureOption = new Option(city, city);
			const arrivalOption = new Option(city, city);

			departureSelect.add(departureOption);
			arrivalSelect.add(arrivalOption);
		});

		// Восстанавливаем выбранные
		if (departureValue) departureSelect.value = departureValue;
		if (arrivalValue) arrivalSelect.value = arrivalValue;
	}

	function renderRoutes(routes) {
		if (!routesList) return;

		routesList.innerHTML = "";

		routes.forEach((route, index) => {
			// Если route уже DOM элемент, просто добавляем его
			if (route instanceof HTMLElement) {
				routesList.appendChild(route);
				return;
			}

			// Иначе создаем новый элемент из объекта данных
			const routeCard = document.createElement("div");
			routeCard.className = "route-card";
			routeCard.style.opacity = "0";
			routeCard.style.transform = "translateY(30px)";
			routeCard.style.transition = "opacity 0.5s, transform 0.5s";

			const fromInitial = route.from.charAt(0);
			const toInitial = route.to.charAt(0);
			const routeInitials = `${fromInitial}-${toInitial}`;

			setTimeout(() => {
				routeCard.style.opacity = "1";
				routeCard.style.transform = "translateY(0)";
			}, index * 100);

			routeCard.innerHTML = `
                <div class="route-image">
                    <div class="route-initials">${routeInitials}</div>
                    <div class="route-decorative-line"></div>
                    <div class="route-overlay"></div>
                </div>
                <div class="route-info">
                    <div class="route-cities">
                        <h3>${route.from} - ${route.to}</h3>
                        <div class="route-details-badge">
                            <span>${route.duration}</span>
                            <span class="route-dash"></span>
                            <span>${route.distance} км</span>
                        </div>
                    </div>
                    <div class="route-price-group">
                        <p class="route-price">от <span>${route.price}</span> BYN</p>
                        <a href="tickets.html?from=${route.from}&to=${route.to}" class="route-button pulse-effect">Выбрать</a>
                    </div>
                </div>
                <div class="route-bookmark"></div>
            `;

			routesList.appendChild(routeCard);
		});

		if (routes.length === 0) {
			const noResults = document.createElement("div");
			noResults.className = "no-results";
			noResults.textContent =
				"Маршруты не найдены. Пожалуйста, измените параметры поиска.";
			routesList.appendChild(noResults);
		}
        
        setupRouteBookmarks();
	}

	function searchRoutes() {
		if (!searchInput || !routesList) return;

		const searchTerm = searchInput.value.toLowerCase().trim();
		let filteredRoutes;

		// Если маршруты загружены из XML
		if (allRoutes.length > 0) {
			filteredRoutes = allRoutes.filter((route) => {
				const routeTitle = `${route.from} - ${route.to}`.toLowerCase();
				return routeTitle.includes(searchTerm);
			});

			renderRoutes(filteredRoutes);
		}
		// Если используем статику
		else if (
			displayedRoutes.length > 0 &&
			displayedRoutes[0] instanceof HTMLElement
		) {
			displayedRoutes.forEach((card) => {
				const titleElement = card.querySelector(".route-cities h3");
				if (!titleElement) return;

				const title = titleElement.textContent.toLowerCase();
				card.style.display = title.includes(searchTerm) ? "" : "none";
			});
		}
	}

	function filterRoutes() {
		if (!departureSelect || !arrivalSelect || !routesList) return;

		const departure = departureSelect.value;
		const arrival = arrivalSelect.value;

		let filteredRoutes;

		// Если маршруты загружены из XML
		if (allRoutes.length > 0) {
			filteredRoutes = allRoutes.filter((route) => {
				const matchDeparture = !departure || route.from === departure;
				const matchArrival = !arrival || route.to === arrival;
				return matchDeparture && matchArrival;
			});

			renderRoutes(filteredRoutes);
		}
		// Если используем статику
		else if (
			displayedRoutes.length > 0 &&
			displayedRoutes[0] instanceof HTMLElement
		) {
			displayedRoutes.forEach((card) => {
				const titleElement = card.querySelector(".route-cities h3");
				if (!titleElement) return;

				const title = titleElement.textContent;
				const [from, to] = title.split(" - ");

				const matchDeparture = !departure || from === departure;
				const matchArrival = !arrival || to === arrival;

				card.style.display =
					matchDeparture && matchArrival ? "" : "none";
			});
		}
	}

    function setupRouteBookmarks() {
        const bookmarks = document.querySelectorAll(".route-bookmark");
        
        bookmarks.forEach((bookmark) => {
            bookmark.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                bookmark.classList.toggle("active");
            });
        });
    }

	loadRoutesFromXML();

	if (searchInput) {
		searchInput.addEventListener("input", searchRoutes);
	}

	if (filterButton) {
		filterButton.addEventListener("click", function (e) {
			e.preventDefault();
			filterRoutes();
		});
	}
    setupRouteBookmarks();
});
