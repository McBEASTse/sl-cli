# SL CLI Travel Planner (unofficial)

I created this as I grew tired of leaving my hands from my keyboard to grab the mouse, go to [www.sl.se](https://www.sl.se), type in where I want to travel from and where I want to travel to, then wait.

It's also a way for me to learn programming and TypeScript.

## Quick start

Clone the repo:

```bash
git clone https://github.com/McBEASTse/sl-cli.git
```

Link the the source directory to add a global `sl` command to the terminal emulator:

npm:

```bash
npm link .
```

pnpm:

```bash
pnpm link --global .
```

### Usage

`sl odenplan` shows all destinations from Stadshagen.
`sl odenplan "täby kyrkby"` shows the three next journeys from Odenplan to Täby Kyrkby Trafikplats.

## To-do

- Add help.
- Add stops by adding arguments: `<start> <middle_stops> <destination>`
- Add properties like detailed information, stop ID's and other info.
- Add Waxholmsbolaget's lines.
- Fix bugs.
- Make the code better.
- Adjust UI.
- Make it compiled.
