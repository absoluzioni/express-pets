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

// function to open form-overlay called from pet card's mail icon
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
  document.querySelector(":root").style.overflowY = "hidden";
}

// function to close form-overlay
document
  .querySelector(".close-btn")
  .addEventListener("click", () => closeOverlay());

function closeOverlay() {
  document
    .querySelector(".form-overlay")
    .classList.remove("form-overlay--visible");
  document.querySelector(":root").style.overflowY = "hidden";
}

// function to send contact-form colled when submit event is triggered
document
  .querySelector(".form-overlay__content")
  .addEventListener("submit", e => sendForm(e));

async function sendForm(e) {
  e.preventDefault();

  const theName = document.querySelector(".form-overlay__content #name");
  const theEmail = document.querySelector(".form-overlay__content #email");
  const theSecret = document.querySelector(".form-overlay__content #secret");
  const theComment = document.querySelector(".form-overlay__content #comment");

  const userValues = {
    name: theName.value,
    email: theEmail.value,
    secret: theSecret.value,
    comment: theComment.value,
    petId: document.querySelector(".form-overlay__content").dataset.id
  };

  console.log(userValues);

  const sendMail = await fetch("/submit-contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userValues)
  });

  if (sendMail.ok) {
    const formOverlayMessage = document.querySelector(".form-overlay__message");
    formOverlayMessage.classList.add("form-overlay__message--visible");

    setTimeout(closeOverlay, 2500);
    setTimeout(() => {
      formOverlayMessage.classList.remove("form-overlay__message--visible");
      theName.value = "";
      theEmail.value = "";
      theSecret.value = "";
      theComment.value = "";
    }, 2900);
  }
}
