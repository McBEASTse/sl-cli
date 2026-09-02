import chalk from "chalk";

export function formatStopsList(leg: any): string | null {
  const productName = leg.transportation.product.name.toLowerCase();
  const origin = leg.origin.name;
  const destination = leg.destination.name;

  if (productName !== "footpath") {
    return `${origin} => ${destination}`;
  }
  return null;
}

export function formatLineLabelsList(leg: any): string | null {
  const productName = leg.transportation.product.name;
  const lineNumber = leg.transportation.disassembledName;

  if (productName !== "footpath") {
    const lineLabel = createLineLabel(productName, lineNumber);
    return `${lineLabel}`;
  }
  return null;
}

export function createLineLabel(
  productName: string,
  lineNumber: string | number,
) {
  let lineLabel = lineNumber;
  productName = productName.toLowerCase();
  lineNumber = lineNumber.toString();
  if (productName.includes("båt") || productName.includes("ship")) {
    return (lineLabel =
      chalk.hex("#FFFFFF").bold.bgHex("#000000")(` Båt `) +
      chalk.hex("#FFFFFF").bold.bgHex("#498228")(` ${lineNumber} `));
  } else if (productName.includes("spårvagn") || productName.includes("tram")) {
    switch (lineNumber) {
      case "7":
        return (lineLabel =
          chalk.hex("#FFFFFF").bold.bgHex("#000000")(` SC `) +
          chalk.hex("#FFFFFF").bold.bgHex("#747770")(` ${lineNumber} `));
      case "12":
        return (lineLabel =
          chalk.hex("#FFFFFF").bold.bgHex("#000000")(` N `) +
          chalk.hex("#FFFFFF").bold.bgHex("#627892")(` ${lineNumber} `));
      case "21":
        return (lineLabel =
          chalk.hex("#FFFFFF").bold.bgHex("#000000")(` L `) +
          chalk.hex("#FFFFFF").bold.bgHex("#007DB8")(` ${lineNumber} `));
      case "25":
      case "26":
        return (lineLabel =
          chalk.hex("#FFFFFF").bold.bgHex("#000000")(` S `) +
          chalk.hex("#FFFFFF").bold.bgHex("#007DB8")(` ${lineNumber} `));
      case "27":
      case "28":
      case "29":
        return (lineLabel =
          chalk.hex("#FFFFFF").bold.bgHex("#000000")(` R `) +
          chalk.hex("#FFFFFF").bold.bgHex("#9F599A")(` ${lineNumber} `));
      case "30":
      case "31":
        return (lineLabel =
          chalk.hex("#FFFFFF").bold.bgHex("#000000")(` Tv `) +
          chalk.hex("#FFFFFF").bold.bgHex("#007DB8")(` ${lineNumber} `));
    }
  } else if (productName.includes("tåg") || productName.includes("train")) {
    return (lineLabel =
      chalk.hex("#FFFFFF").bold.bgHex("#000000")(` P `) +
      chalk.hex("#FFFFFF").bold.bgHex("#CC417F")(` ${lineNumber} `));
  } else if (
    productName.includes("tunnelbana") ||
    productName.includes("metro")
  ) {
    switch (lineNumber) {
      case "10":
      case "11":
        return (lineLabel =
          chalk.hex("#FFFFFF").bold.bgHex("#000000")(` T `) +
          chalk.hex("#FFFFFF").bold.bgHex("#007DB8")(` ${lineNumber} `));
      case "13":
      case "14":
        return (lineLabel =
          chalk.hex("#FFFFFF").bold.bgHex("#000000")(` T `) +
          chalk.hex("#FFFFFF").bold.bgHex("#D71D24")(` ${lineNumber} `));
      case "17":
      case "18":
      case "19":
        return (lineLabel =
          chalk.hex("#FFFFFF").bold.bgHex("#000000")(` T `) +
          chalk.hex("#FFFFFF").bold.bgHex("#148541")(` ${lineNumber} `));
    }
  } else if (productName.includes("bus")) {
    return (lineLabel =
      chalk.hex("#FFFFFF").bold.bgHex("#000000")(` B `) +
      chalk.hex("#FFFFFF").bold.bgHex("#000000")(` ${lineNumber} `));
  }
  return null;
}
