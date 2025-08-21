import { Browser, Page } from "puppeteer";

export type Platform = "yellowPages" | "gMaps" | "yelp";
export type RequestBody = {
  job: string;
  location: string;
};
export type GoogleMapsLeads = {
  name: string | undefined;
  url: string | undefined;
  phone: string | undefined;
};
const platformMap: Map<
  Platform,
  (jobTitle: string, location: string) => string
> = new Map([
  ["yellowPages", yellowPagesUrl],
  ["gMaps", gMapsUrl],
  ["yelp", yelpUrl],
]);

export async function openMultiplePages(
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

export async function scrapeLeadsYellowpages(page: Page) {
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
export function gMapsUrl(jobTitle: string, location: string) {
  return `https://www.google.com/maps/search/${jobTitle}+in+${location}`;
}
export function yelpUrl(jobTitle: string, location: string) {
  return `https://www.yelp.com/search?find_desc=${jobTitle}&find_loc=${location}`;
}
export function yellowPagesUrl(jobTitle: string, location: string) {
  return `https://www.yell.com/ucs/UcsSearchAction.do?scrambleSeed=114618551&keywords=${jobTitle}&location=${location}`;
}
