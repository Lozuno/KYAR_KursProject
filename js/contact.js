document.addEventListener("DOMContentLoaded", () => {
	setupContactForm();
	setupBenefitCards();
	setupFaqAccordion();

function setupContactForm() {
	const contactForm = document.getElementById("contact-form");

	if (!contactForm) return;

	contactForm.addEventListener("submit", function (e) {
		e.preventDefault();

		const nameInput = document.getElementById("name");
		const emailInput = document.getElementById("email");
		const messageInput = document.getElementById("message");
		const topicSelect = document.getElementById("topic");
		const agreementCheckbox = document.getElementById("agreement");

		if (
			validateForm(
				nameInput,
				emailInput,
				messageInput,
				topicSelect,
				agreementCheckbox
			)
		) {
			showFormMessage("Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.", "success");
			contactForm.reset();
		} else {
			showFormMessage("Пожалуйста, заполните все обязательные поля формы.", "error");
		}
	});
}

function validateForm(
	nameInput,
	emailInput,
	messageInput,
	topicSelect,
	agreementCheckbox
) {
	// Сбрасываем классы ошибок
	[nameInput, emailInput, messageInput, topicSelect].forEach(el => {
		if (el) el.classList.remove("error");
	});
	
	let valid = true;
	
	if (!nameInput.value) {
		nameInput.classList.add("error");
		valid = false;
	}
	
	if (!emailInput.value) {
		emailInput.classList.add("error");
		valid = false;
	}
	
	if (!messageInput.value) {
		messageInput.classList.add("error");
		valid = false;
	}
	
	if (!topicSelect.value) {
		topicSelect.classList.add("error");
		valid = false;
	}
	
	if (!agreementCheckbox.checked) {
		agreementCheckbox.parentElement.classList.add("error");
		valid = false;
	}
	
	return valid;
}

function setupBenefitCards() {
	const benefitCards = document.querySelectorAll(".benefit-card");

	benefitCards.forEach((card, index) => {
		setTimeout(() => {
			card.style.opacity = 1;
			card.style.transform = "translateY(0)";
		}, 100 * index);
	});
}

function setupFaqAccordion() {
	const faqItems = document.querySelectorAll(".faq-item");

	faqItems.forEach((item) => {
		const question = item.querySelector(".faq-question");

		question.addEventListener("click", () => {
			const isActive = item.classList.contains("active");

			faqItems.forEach((faqItem) => {
				faqItem.classList.remove("active");
			});

			if (!isActive) {
				item.classList.add("active");
			}
		});
	});
}

const contactForm = document.getElementById("contact-form");

if (contactForm) {
	contactForm.querySelectorAll("input, textarea, select").forEach((field) => {
		field.addEventListener("input", function () {
			this.classList.remove("error");
			const messageEl = document.querySelector(".form-message");
			if (messageEl) messageEl.remove();
		});
	});
}

function showFormMessage(message, type) {
	const existingMessage = document.querySelector(".form-message");
	if (existingMessage) existingMessage.remove();

	const messageElement = document.createElement("div");
	messageElement.className = `form-message ${type}`;
	messageElement.textContent = message;

	contactForm.insertAdjacentElement("afterend", messageElement);

	messageElement.scrollIntoView({ behavior: "smooth", block: "nearest" });

	if (type === "success") {
		setTimeout(() => {
			messageElement.style.opacity = "0";
			setTimeout(() => messageElement.remove(), 500);
		}, 5000);
	}
}


});