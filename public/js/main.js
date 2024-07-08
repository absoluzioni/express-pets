async function start() {
  const weatherPromise = await fetch(
    "https://api.weather.gov/gridpoints/MFL/110,50/forecast"
  );
  const weatherData = await weatherPromise.json();

  const ourTemperature = weatherData.properties.periods[0].temperature;
  document.querySelector("#temperature-output").textContent = ourTemperature;
}

start();

// pet filter button code
const allButtons = document.querySelectorAll(".pet-filter button");

allButtons.forEach(el => {
  el.addEventListener("click", handleButtonClick);
});

function handleButtonClick(e) {
  // remove active class from any and all buttons
  allButtons.forEach(el => el.classList.remove("active"));

  // add active class to the specific button that just got clicked
  e.target.classList.add("active");

  // actually filter the pets down below
  const currentFilter = e.target.dataset.filter;
  document.querySelectorAll(".pet-card").forEach(el => {
    if (currentFilter == el.dataset.species || currentFilter == "all") {
      el.style.display = "grid";
    } else {
      el.style.display = "none";
    }
  });
}

document.querySelector(".form-overlay").style.display = "";

function openOverlay(el) {
  const petCard = el.closest(".pet-card");

  const id = petCard.dataset.id;
  const name = petCard.querySelector(".pet-card-text h3").textContent.trim();
  const photo = petCard.querySelector(".pet-card-photo img").src;
  const photoAlt = petCard.querySelector(".pet-card-photo img").alt;

  document.querySelector(".form-overlay__photo img").src = ``;

  document.querySelector(".form-overlay__photo img").src = photo;
  document.querySelector(".form-overlay__photo img").alt = photoAlt;
  document.querySelector(".form-overlay__photo span").textContent = name + ".";
  document.querySelector(".form-overlay__content").dataset.id = id;

  document
    .querySelector(".form-overlay")
    .classList.add("form-overlay--visible");
}

document
  .querySelector(".close-btn")
  .addEventListener("click", () => closeOverlay());

async function closeOverlay() {
  document
    .querySelector(".form-overlay")
    .classList.remove("form-overlay--visible");
}

document
  .querySelector(".form-overlay__content")
  .addEventListener("submit", e => sendForm(e));

function sendForm(e) {
  e.preventDefault();

  const userValues = {
    name: document.querySelector(".form-overlay__content #name").value,
    email: document.querySelector(".form-overlay__content #email").value,
    secret: document.querySelector(".form-overlay__content #secret").value,
    comment: document.querySelector(".form-overlay__content #comment").value,
    petId: document.querySelector(".form-overlay__content").dataset.id
  };

  console.log(userValues);

  fetch("/submit-contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userValues)
  });
}
