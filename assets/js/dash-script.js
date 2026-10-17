//add task functionality
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function addTask() {
  console.log("addtask running!");
  const taskIp = document.getElementById("taskip");
  const tasktxt = taskIp?.value.trim();  // Safe access

  if (!tasktxt) return;

  tasks.push({ text: tasktxt, done: false });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  taskIp.value = "";
  renderTasks();
}

//Make it global for HTML onclick to work in Electron
window.addTask = addTask;

function renderTasks() {
  const list = document.getElementById("todoList");
  list.innerHTML = "";

  tasks.forEach((task, i) => {
    const li = document.createElement("li");
    const label = document.createElement("label");
    label.className = "todo-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => {
      tasks[i].done = !tasks[i].done;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
    });

    const checkmark = document.createElement("span");
    checkmark.className = "checkmark";

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;
    taskText.style.textDecoration = task.done ? "line-through" : "none";

    const delBtn = document.createElement("button");
    delBtn.innerHTML = "✕";
    delBtn.style.cssText = "background:none;border:none;color:red;margin-left:10px;cursor:pointer;";
    delBtn.addEventListener("click", () => {
      tasks.splice(i, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
    });

    label.appendChild(checkbox);
    label.appendChild(checkmark);
    label.appendChild(taskText);
    label.appendChild(delBtn);

    li.appendChild(label);
    list.appendChild(li);
  });
}

// Calendar Logic
let selectedCalDate = "";
let currtaskI = null;
let calendar;

// Run everything after DOM is loaded
window.onload = () => {
  auth.signInAnonymously()
  .then(() => console.log("🔐 Logged in anonymously"))
  .catch((err) => console.error("Firebase auth error", err));
  renderTasks(); 
  loadSongsFromStorage();

  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    selectable: true,
    events: loadCalendarTasks(),

    // When a date is clicked
    dateClick(info) {
      openCalendarModal(info.dateStr);
    },

    // When a note/event is clicked
    eventClick(info) {
      const { extendedProps } = info.event;
      const taskList = extendedProps?.rawTasks || [];
      const dateKey = extendedProps?.dateKey;

      if (!dateKey) {
        console.warn("Missing dateKey in clicked event:", info.event);
        return;
      }

      selectedCalDate = dateKey;

      const modalList = document.getElementById("popupTaskList");
      modalList.innerHTML = "";

      taskList.forEach((task, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="task-text ${task.done ? 'done' : ''}">${task.text}</span>
          <button onclick="toggleDone(${i})">✅</button>
          <button onclick="openEditDeletePopup('${task.text}', ${i}, '${dateKey}')">✏️</button>
        `;
        modalList.appendChild(li);
      });

      document.getElementById("popupDateDisplay").textContent = dateKey;
      document.getElementById("calendarTaskInputPopup").value = "";
      document.getElementById("taskPopupModal").classList.remove("modal-hidden");

      console.log("Popup opened for:", dateKey);
      const modal = document.getElementById("taskPopupModal");
      console.log("Modal classes:", modal.className);
      modal.style.border = "5px solid red"; // Visual debug
    }
  });
  if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          notifyTodayTasks();
          scheduleFutureNotification();
        }
      });
  }else{
    notifyTodayTasks();
    scheduleFutureNotification();
  }

  calendar.render();
};

// Load events from localStorage and return as calendar-friendly objects
function loadCalendarTasks() {
  const stored = JSON.parse(localStorage.getItem("calendarTasks")) || {};
  let events = [];

  for (const date in stored) {
    const bulletList = stored[date].map(t =>  t.done ? `✔︎ ${t.text}` : `• ${t.text}`).join('\n');
    events.push({
      title: bulletList,
      start: date,
      extendedProps: {
        rawTasks: stored[date],
        dateKey: date
      }
    });
  }

  return events;
}

// Save a task to localStorage under specific date
function saveCalendarTask(date, task) {
  const stored = JSON.parse(localStorage.getItem("calendarTasks")) || {};
  if (!stored[date]) stored[date] = [];
  stored[date].push({ text: task, done: false }); //for marking done task
  localStorage.setItem("calendarTasks", JSON.stringify(stored));
}

// Refresh all calendar events
function refreshCalendar() {
  calendar.removeAllEvents();

  const events = loadCalendarTasks(); // includes extendedProps!
  events.forEach(event => calendar.addEvent(event));
}
//for marking tasks done
function toggleDone(i) {
  let stored = JSON.parse(localStorage.getItem("calendarTasks")) || {};
  stored[selectedCalDate][i].done = !stored[selectedCalDate][i].done;
  localStorage.setItem("calendarTasks", JSON.stringify(stored));
  refreshCalendar();
}
// --- Modal open/close handlers ---
window.openCalendarModal = function (dateStr) {
  selectedCalDate = dateStr;
  document.getElementById("selectedDate").textContent = dateStr;
  document.getElementById("calendarModal").classList.remove("modal-hidden");
};

window.closeCalendarModal = function () {
  document.getElementById("calendarModal").classList.add("modal-hidden");
  document.getElementById("calendarTaskInput").value = "";
};

window.closeTaskPopup = function () {
  document.getElementById("taskPopupModal").classList.add("modal-hidden");
};

window.closeEditDeletePopup = function () {
  document.getElementById("editDeleteModal").classList.add("modal-hidden");
  currtaskI = null;
};

// Save new task from modal
window.saveCalendarModalTask = function () {
  const task = document.getElementById("calendarTaskInput").value.trim();
  if (!task) return;

  saveCalendarTask(selectedCalDate, task);
  refreshCalendar();
  closeCalendarModal();
};

// Add task from inside popup
window.addTaskToDateFromPopup = function () {
  const newTask = document.getElementById("calendarTaskInputPopup").value.trim();
  if (!newTask) return;

  const stored = JSON.parse(localStorage.getItem("calendarTasks")) || {};
  if (!stored[selectedCalDate]) stored[selectedCalDate] = [];

  const taskObj = { text: newTask, done: false };
  stored[selectedCalDate].push(taskObj);
  localStorage.setItem("calendarTasks", JSON.stringify(stored));

  refreshCalendar();
  document.getElementById("calendarTaskInputPopup").value = "";
  closeTaskPopup();

  scheduleNotification(taskObj.text, selectedCalDate);
};

// Edit task popup
function openEditDeletePopup(task, i, dateKey) {
  document.getElementById("editTaskInput").value = task;
  document.getElementById("editDeleteModal").classList.remove("modal-hidden");
  currtaskI = i;
  selectedCalDate = dateKey;
}

// Save edited task
window.saveEditedTask = function () {
  const newText = document.getElementById("editTaskInput").value.trim();
  if (!newText) return;

  let stored = JSON.parse(localStorage.getItem("calendarTasks")) || {};
  stored[selectedCalDate][currtaskI] = newText;
  localStorage.setItem("calendarTasks", JSON.stringify(stored));
  closeEditDeletePopup();
  closeTaskPopup();
  refreshCalendar();
};

// Delete task
window.deleteTask = function () {
  let stored = JSON.parse(localStorage.getItem("calendarTasks")) || {};
  if (!stored[selectedCalDate]) return;

  stored[selectedCalDate].splice(currtaskI, 1);
  if (stored[selectedCalDate].length === 0) delete stored[selectedCalDate];

  localStorage.setItem("calendarTasks", JSON.stringify(stored));
  closeEditDeletePopup();
  closeTaskPopup();
  refreshCalendar();
};
function scheduleNotification(task, dateStr) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  if (dateStr === today) {
    // If the task is for today, notify immediately
    new Notification("🧠 Task Today", {
      body: `You have a task due today: ${task}`,
    });
  } else {
    // Future task → schedule for 9:00am on that day
    const taskDate = new Date(dateStr + "T09:00:00");
    const timeout = taskDate.getTime() - now.getTime();

    if (timeout > 0) {
      setTimeout(() => {
        new Notification("Reminder 📝", {
          body: `Don't forget: ${task}`,
        });
      }, timeout);
    }
  }
}
function notifyTodayTasks() {
  const today = new Date().toISOString().split("T")[0]; //yyyy-mm-dd
  const stored = JSON.parse(localStorage.getItem("calendarTasks")) || {};
  const todayTasks = stored[today];

  if (todayTasks && todayTasks.length > 0){
    todayTasks.forEach(taskObj => {
      const text = typeof taskObj === "string" ? taskObj : taskObj.text;
      if(Notification.permission === "granted") {
        new Notification("📅 Task for Today", {
          body:text,
        });
      }
    });
  }
  if (!todayTasks || todayTasks.length === 0) {
  console.log("✅ No tasks today or tasks already completed.");
  }
}
function scheduleFutureNotification() {
  const stored = JSON.parse(localStorage.getItem("calendarTasks")) || {};
  const now = new Date();

  for (const date in stored) {
    const taskList = stored[date];
    const taskDate = new Date(date + "T09:00:00");

    if (taskDate > now) {
      taskList.forEach(taskObj => {
        const text = typeof taskObj === "string" ? taskObj : taskObj.text;
        scheduleNotification(text,date);
      });
    }
  }
}
//mood playlists
let currMood = "";
let currSI= 0;
const moodSongs = {
  coding: ["Lo-Fi Beats","Coding Vibes","Focus Flow"],
  relax: ["Soft Piano","Rain Sounds","Ocean Breeze"],
  focus: ["Concentration Max","No Distractions","Mind Sharpener"],
  calm: ["Sleepy Jazz","Evening Tea", "Forest Ambience"]
};
function loginWithSpotify() {
  const client_id = "0adb861423b1485fb5c3bac7e346be9b";
  const redirect_uri = "http://127.0.0.1:3000/callback.html";

  const scope = "user-read-private user-read-email playlist-read-private";

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scope)}`;

  //use electron's shell to open the browser
  const { shell } = require("electron");
  shell.openExternal(authUrl);
}
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("spotify_access_token");
  if (!token) return;
  //fetch spotify profile and detect plan
  fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(profile => {
    const plan = profile.product;
    document.getElementById("spotifyPlanText").textContent = `Plan: ${plan}`;
    console.log("🎧 Spotify user:", profile.display_name);
    console.log("💎 Plan:", profile.product); // free or premium
    localStorage.setItem("spotify_user_id", profile.id);
    localStorage.setItem("spotify_user_product",profile.product);
  });
});
function openMoodPlaylist(card) {
  const mood = card.getAttribute("data-mood");
  currMood = mood;
  document.getElementById("moodTitle").textContent = `Mood: ${mood.toUpperCase()}`;

  const songList = document.getElementById("songList");
  songList.innerHTML = "";

  (moodSongs[mood] || []).forEach(song => {
    const li = document.createElement("li");
    li.textContent = song;
    songList.appendChild(li);
  });

  document.getElementById("moodPlaylistModal").classList.remove("modal-hidden");
  //reset add song section
  document.getElementById("addSongSection").style.display = "none";
  document.getElementById("newSongInput").value = "";
}
function closeMoodPlaylist() {
  document.getElementById("moodPlaylistModal").classList.add("modal-hidden");
}
// nowplayingscreen
function startNowPlaying(){
  //start pomodoro timer
  //startPomodoroTimer();
  const mood = currMood;
  const songs = moodSongs[mood];
  if (!songs || songs.length === 0) return;

  currSI = 0;
  updateNowPlayingUI();

  document.getElementById("nowPlayingModal").classList.remove("modal-hidden");
  document.getElementById("moodPlaylistModal").classList.add("modal-hidden");
}
function updateNowPlayingUI() {
  const mood = currMood;
  const songs = moodSongs[mood];
  if (!songs || !songs[currSI]) return;

  const fsong = songs[currSI];
  const moodLabel = mood.charAt(0).toUpperCase() + mood.slice(1);

  document.getElementById("nowPlayingMood").textContent = `Mood: ${moodLabel}`;
  document.getElementById("nowPlayingSong").innerHTML = `Now Playing: <b>${fsong}</b>`;

  const albumMap = {
    coding:"programmer.png",
    relax:"calm.png",
    calm:"relax.png",
    focus:"focus.png"
  };

  const album = document.getElementById("nowPlayingAlbumArt");
  if (album) {
    album.src = "../assets/images/" + (albumMap[mood] || "placeholder.svg");
  }
}
function closeNowPlaying() {
  document.getElementById("nowPlayingModal").classList.add("modal-hidden");
}
let pomoInterval = null;
let pomoRunning = false;
let pomoTime = 1500;

function togglePomodoro(){
  const display = document.getElementById("pomodoroTime");
  const btn = document.getElementById("pomoToggleBtn");

  if (!pomoRunning) {
    pomoInterval = setInterval(() => {
      const mins = Math.floor(pomoTime / 60);
      const secs = pomoTime % 60;
      display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      if (--pomoTime < 0) {
        clearInterval(pomoInterval);
        btn.textContent = "⏱️ Done";
      }
    }, 1000);
    btn.textContent = "⏸ Pause";
    pomoRunning = true;
  } else {
    clearInterval(pomoInterval);
    btn.textContent = "▶ Resume";
    pomoRunning = false;
  }
}
document.querySelector(".add-btn").addEventListener("click", () => {
  document.getElementById("addSongSection").style.display = "block";
});
function submitNewSong() {
  const name = document.getElementById("newSongInput").value.trim();
  const mood = currMood;
  if (!name || !mood) return;

  if(!moodSongs[mood]) moodSongs[mood] = [];
  moodSongs[mood].push(name);

  //sync to firebase
  const user = auth.currentUser;
  if (user) {
    const uid = user.uid;
    db.collection("users").doc(uid).collection("moods").doc(mood).set({
      songs: moodSongs[mood]
    }).then(() => {
      console.log("synced to firebase");
    });
  }
  localStorage.setItem("moodSongs", JSON.stringify(moodSongs));
  openMoodPlaylist(document.querySelector(`[data-mood=${mood}"]`));
}
function saveSongsToStorage() {
  localStorage.setItem("moodSongs", JSON.stringify(moodSongs));
}
function loadSongsFromStorage() {
  const user = auth.currentUser;

  if(user) {
    const uid = user.uid;
    db.collection("users").doc(uid).collection("moods").get().then(snapshot => {
      snapshot.forEach(doc => {
        moodSongs[doc.id] = doc.data().songs || [];
      });
      console.log("loaded from firestore:", moodSongs);
    });
  } else{
    const stored = localStorage.getItem("moodSongs");
    if (stored) {
      moodSongs = JSON.parse(stored);
    }
  }
}
function nextSong() {
  const songs = moodSongs[currMood];
  currSI = (currSI + 1) % songs.length;
  updateNowPlayingUI();
}
function prevSong() {
  const songs = moodSongs[currMood];
  currSI = (currSI - 1 + songs.length) % songs.length;
  updateNowPlayingUI();
}