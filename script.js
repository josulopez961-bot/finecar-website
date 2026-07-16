const WHATSAPP_NUMBER = "593995556084";

const messages = {
  general:
    "Hola FINECAR Bodyshop, quiero cotizar un servicio para mi vehículo. Estoy en Ambato.",
  fotos:
    "Hola FINECAR Bodyshop, quiero enviar fotos de mi vehículo para cotizar una reparación.",
  inspeccion:
    "Hola FINECAR Bodyshop, quiero solicitar una inspección para mi vehículo en Ambato.",
  choques:
    "Hola FINECAR Bodyshop, quiero cotizar reparación de choque, enderezada o pintura para mi vehículo.",
  pintura:
    "Hola FINECAR Bodyshop, quiero cotizar pintura automotriz o reparación de rayones.",
  rayones:
    "Hola FINECAR Bodyshop, quiero cotizar la clínica de rayones para mi vehículo.",
  pulido:
    "Hola FINECAR Bodyshop, quiero cotizar pulido o protección cerámica para mi vehículo.",
  mantenimiento:
    "Hola FINECAR Bodyshop, quiero consultar por mantenimiento preventivo para mi vehículo.",
  mecanica:
    "Hola FINECAR Bodyshop, quiero consultar por mecánica general para mi vehículo.",
  guia:
    "Hola FINECAR Bodyshop, quiero recibir la guía gratuita de mantenimiento para cuidar mi vehículo.",
};

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const year = document.querySelector("[data-year]");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");
const whatsappLinks = document.querySelectorAll("[data-wa-service]");

const whatsappUrl = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

if (year) {
  year.textContent = new Date().getFullYear();
}
updateHeader();

whatsappLinks.forEach((link) => {
  const service = link.dataset.waService || "general";
  link.href = whatsappUrl(messages[service] || messages.general);
});

window.addEventListener("scroll", updateHeader, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  header.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(contactForm);
    const service = data.get("service");
    const baseMessage = messages[service] || messages.general;
    const message = [
      baseMessage,
      "",
      `Nombre: ${data.get("name")}`,
      `Vehículo: ${data.get("vehicle")}`,
      `Mensaje: ${data.get("message") || "Quiero coordinar una revisión."}`,
    ].join("\n");

    if (formNote) {
      formNote.textContent = "Abriendo WhatsApp con tu solicitud de cotización.";
    }
    window.open(whatsappUrl(message), "_blank", "noopener");
  });
}
