# SL CLI Travel Planner (unofficial)

I created this as I grew tired of leaving my hands from my keyboard to grab the mouse, go to [www.sl.se](https://www.sl.se), type in where I want to travel from and where I want to travel to, then wait.

It's also a way for me to learn programming and TypeScript.

## Quick start

Clone the repo:

```bash
git clone https://github.com/McBEASTse/sl-cli.git
```

Build the distribution, for example using `tsc` in the project root.

Link the the source directory to add a global `sl` command to the terminal emulator. I recommend using pnpm for this:

pnpm:

```bash
pnpm link --global .
```

### Usage

#### See departures

Example, `sl odenplan` shows the next five destinations from Stadshagen. An option to change how many departures and when will come later.

<img width="851" height="464" alt="sl-cli-departures" src="https://github.com/user-attachments/assets/ce943abb-3767-487b-8326-3b9cdd38cd6d" />

#### Get journey from one place to another

Example, `sl odenplan "täby kyrkby"` shows the three next journeys (or more if they have the same departure time, something with the SL API...) from Odenplan to Täby Kyrkby Trafikplats.

<img width="853" height="601" alt="sl-cli-journey-planner" src="https://github.com/user-attachments/assets/077af9a1-d926-4443-94b9-f2235b4cb588" />

## To-do

- Add help.
- Add stops by adding arguments: `<start> <middle_stops> <destination>`
- Add properties like detailed information, stop ID's and other info.
- Add Waxholmsbolaget's lines.
- Fix bugs.
- Make the code better.
- Adjust UI.
- Make it compiled.
