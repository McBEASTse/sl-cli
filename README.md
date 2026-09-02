# SL CLI Travel Planner (unofficial)

I created this as I grew tired of leaving my hands from my keyboard to grab the mouse, go to www.sl.se, then type where I want to travel from and where I want to travel to, then wait. Instead I can now use an alias `home` to see the next destination from my work to my home. It saves me about 20 seconds each search.

It's also a way for me to learn programming and TypeScript.

## Quick start

- Clone the repo.
- Recommended to run pnpm.
- In the source directory:
  `pnpm link --global .` to add the command "sl".

### Usage

`sl "stadshagen"` shows all destinations from Stadshagen.
`sl "stadshagen" "odenplan"` shows the three next journeys from Stadshagen to Odenplan.

## To-do

- Add help.
- Add stops by adding arguments: `<start> <middle_stops> <destination>`
- Add Waxholmsbolaget's lines.
- Fix bugs.
- Make the code better.
- Make it compiled.
