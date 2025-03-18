import puppeteer, { Browser, Page } from "puppeteer";
import express from "express";
import { Request, Response } from "express";

const app = express();
app.use(express.json());
const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post("/get-leads", async (req: Request, res: Response): Promise<void> => {
  let browser: Browser | undefined;
  try {
    const { platforms, jobTitle, location }: RequestBody = req.body;
    if (!(platforms || jobTitle || location)) {
      res.status(400).json({ message: "Please provide all the fields" });
    }
    browser = await puppeteer.launch({ headless: false });
    console.log("Browser opened");
    const openedPages = await openMultiplePages(
      browser,
      platforms,
      jobTitle,
      location
    ); //an attempt to simulate parallelism
    console.log("Opened multiple pages");
    const finalLeads = [];
    for (const openedPage of openedPages) {
      const { page, platform } = openedPage;
      if (platform === "gMaps") {
        const gMapLeads = await scrapeLeadsGMaps(page);
        finalLeads.push({ platform, leads: gMapLeads });
      } else if (platform === "yellowPages") {
        const yellowPagesLeads = await scrapeLeadsYellowpages(page);
        finalLeads.push({ platform, leads: yellowPagesLeads });
      } else if (platform === "yelp") {
        //scrape yelp
      }
    }
    await browser.close();
    res.status(200).json({ leads: finalLeads });
    return;
  } catch (error: any) {
    console.log(error);
    await browser?.close();
    res
      .status(500)
      .json({ status: "Internal server error", message: error.message });
    return;
  }
});

type Platform = "yellowPages" | "gMaps" | "yelp";
type RequestBody = {
  platforms: Platform[];
  jobTitle: string;
  location: string;
};
type GoogleMapsLeads = {
  name: string | undefined;
  url: string | undefined;
  phone: string | undefined;
};
//utlis
const platformMap: Map<
  Platform,
  (jobTitle: string, location: string) => string
> = new Map([
  ["yellowPages", yellowPagesUrl],
  ["gMaps", gMapsUrl],
  ["yelp", yelpUrl],
]);
async function openMultiplePages(
  browser: Browser,
  platforms: Platform[],
  jobTitle: string,
  location: string
) {
  const openedPagesPromises = platforms.map(async (platform) => {
    const page = await browser.newPage();
    const urlFunction = platformMap.get(platform);
    if (!urlFunction) {
      throw new Error("Invalid platform");
    }
    await page.goto(urlFunction(jobTitle, location));
    console.log(`Navigated to ${platform}`);
    return { page, platform };
  });
  const openedPages = await Promise.all(openedPagesPromises);
  return openedPages;
}
async function scrapeLeadsGMaps(page: Page): Promise<GoogleMapsLeads[]> {
  const gMapleads = [];
  const mainContainerSelector =
    "div.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde.ecceSd[role='feed']";
  const leadCardSelector = "div.Nv2PK.tH5CWc.THOPZb";
  const nameSelector = "div.qBF1Pd.fontHeadlineSmall";
  const urlSelector = "a.lcr4fd.S9kvJb[data-value='Website']";
  const phoneSelector = "span.UsdlK";
  try {
    await page.waitForSelector(mainContainerSelector, { timeout: 30000 });
    console.log("Main container found");
    const mainContainer = await page.$(mainContainerSelector);
    if (!mainContainer) {
      throw new Error("Main container not found");
    }
    const leadCards = await mainContainer.$$(leadCardSelector);
    for (const lead of leadCards) {
      const name = await lead.evaluate(
        (el, nameSelector) =>
          (el.querySelector(nameSelector) as HTMLElement)?.innerText ||
          undefined,
        nameSelector
      );
      const url = await lead.evaluate(
        (el, urlSelector) =>
          (el.querySelector(urlSelector) as HTMLAnchorElement)?.href ||
          undefined,
        urlSelector
      );
      const phone = await lead.evaluate(
        (el, phoneSelector) =>
          (el.querySelector(phoneSelector) as HTMLElement)?.innerText ||
          undefined,
        phoneSelector
      );
      gMapleads.push({ name, url, phone });
    }
    return gMapleads;
  } catch (error: any) {
    console.log("Error while scraping google maps leads", error.message);
    return gMapleads;
  }
}
async function scrapeLeadsYellowpages(page: Page) {
  const yellowPagesLeads = [];
  const mainContainerSelector = "div.row.results--row.results--capsuleList";
  const leadCardSelector = "div.row.businessCapsule--mainRow";
  const nameSelector = "h2.businessCapsule--name.text-h2";
  const urlSelector = "a.btn.btn-yellow.businessCapsule--ctaItem";
  const phoneSelector = "span.business--telephoneNumber";

  try {
    await page.waitForSelector(mainContainerSelector, { timeout: 30000 });
    console.log("Main container found");
    const mainContainer = await page.$(mainContainerSelector);
    if (!mainContainer) {
      throw new Error("Main container not found");
    }
    const leadCards = await mainContainer.$$(leadCardSelector);
    for (const lead of leadCards) {
      const name = await lead.evaluate(
        (el, nameSelector) =>
          (el.querySelector(nameSelector) as HTMLElement)?.innerText ||
          undefined,
        nameSelector
      );
      const url = await lead.evaluate(
        (el, urlSelector) =>
          (el.querySelector(urlSelector) as HTMLAnchorElement)?.href ||
          undefined,
        urlSelector
      );
      const phone = await lead.evaluate(
        (el, phoneSelector) =>
          (el.querySelector(phoneSelector) as HTMLElement)?.innerText ||
          undefined,
        phoneSelector
      );
      yellowPagesLeads.push({ name, url, phone });
    }
    return yellowPagesLeads;
  } catch (error: any) {
    console.log("Error while scraping yellow pages leads", error.message);
    return yellowPagesLeads;
  }
}
function gMapsUrl(jobTitle: string, location: string) {
  return `https://www.google.com/maps/search/${jobTitle}+${location}`;
}
function yelpUrl(jobTitle: string, location: string) {
  return `https://www.yelp.com/search?find_desc=${jobTitle}&find_loc=${location}`;
}
function yellowPagesUrl(jobTitle: string, location: string) {
  return `https://www.yell.com/ucs/UcsSearchAction.do?scrambleSeed=114618551&keywords=${jobTitle}&location=${location}`;
}
