# Luna 

> **Crescent moons, cozy tunes & calm plans** — a cozy desktop space for planning tasks and settling into a focused mood.

[Overview](#what-is-luna) · [Features](#features) · [Get started](#get-started) · [How to use](#using-luna) · [Project map](#project-map) · [Setup notes](#setup-and-integration-status) · [Contributing](#contributing)

## What is Luna?

Luna is an Electron desktop app prototype that brings a personal to-do list, date-based task calendar, mood playlist mockups, and a Pomodoro timer into one plant-filled dashboard. The desktop window opens on a welcome screen; choose **LET’S PLAN!** to reach the dashboard.


## Features

| Area | What you can do | Where it lives |
| --- | --- | --- |
| To-do list | Add tasks, mark them done, and remove them. Tasks persist in the app’s browser storage. | Dashboard |
| Calendar | Add date-specific tasks, view them by month, and open a date to manage its tasks. | Dashboard calendar |
| Reminders | Allow notifications to see reminders for today and scheduled future tasks. | Calendar tasks |
| Mood playlists | Browse sample Coding, Relax, Focus, and Calm song lists; add a custom song name. | Mood Playlist cards |
| Focus timer | Open a mood’s Now Playing screen and start or pause a 25-minute timer. | Now Playing modal |
| Desktop shell | Run the interface in a resizable Electron window. | `main.js` |

The playlist names are sample labels: the current player changes the displayed song title and artwork, but does not stream audio.

## Get started

### Requirements

- Node.js and npm
- A desktop environment supported by Electron

### Install and launch

```bash
git clone <repository-url>
cd Luna-app
npm install
npm start
```

`npm start` runs the Electron app and opens `views/splash.html`. The app dependencies are defined in the root `package.json`.

## Using Luna

1. Launch Luna and select **LET’S PLAN!**.
2. Add a task in **To-Do List**. Select its checkbox to mark it complete, or the × control to remove it.
3. Select a calendar date to add a task for that day. Select a calendar entry to view and manage its tasks.
4. Choose a mood card to see its sample songs. **Play** opens the Now Playing screen, where the previous/next buttons change the displayed song and **Start** begins the timer.
5. Select **Add Songs** to add a song title to the selected mood list.

Allow notifications when prompted if you want date reminders. Browser storage is local to the Electron app profile; clearing app data can remove locally stored tasks and mood data.

### Quick walkthrough

- [ ] Add and complete a to-do item.
- [ ] Add a task to a calendar date and reopen that date.
- [ ] Open a mood and try the sample song controls.
- [ ] Start and pause the focus timer.

<details>
<summary>Keyboard and interaction notes</summary>

- The app is primarily operated with buttons, inputs, calendar date selection, and modal dialogs.
- Modal **Close** controls return to the dashboard or prior playlist view.
- The Pomodoro timer starts at 25:00 and supports pause/resume. It is an in-memory timer and does not persist across restarts.

</details>

## Project map

```text
.
├── main.js                    
├── views/
│   ├── splash.html             
│   └── dashboard.html          
├── assets/
│   ├── css/                    
│   ├── images/                 
│   └── js/
│       ├── dash-script.js       
│       └── firebaseConfig.js   
└── backend/
    ├── package.json            
    └── server.js               
```

## License

Contact the maintainers before reusing or distributing this code.
