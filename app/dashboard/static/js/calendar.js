document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) {
    console.error("❌ #calendar non trovato nel DOM!");
    return;
  }

  const eventi = window.appuntamenti || [];

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridWeek",
    locale: "it",
    height: "auto",
    timeZone: "local",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,listWeek"
    },
    events: eventi,
    eventTimeFormat: {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }
  });

  calendar.render();
});

window.initCalendar = function () {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl || typeof FullCalendar === "undefined") {
    console.warn("⏳ In attesa di FullCalendar...");
    return;
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: window.appuntamenti || [],
    locale: "it"
  });
  calendar.render();
};