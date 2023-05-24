import { getScreenshot } from "./_lib/puppeteer";

module.exports = async (req, res) => {
  if (!req.query.url) return res.status(400).send("No url query specified.");
  if (!checkUrl(req.query.url)) return res.status(400).send("Invalid url query specified.");
  try {
    const orientation = /(?<=[/])(landscape|portrait)$/.exec(req.query.url);
    const file = await getScreenshot(req.query.url, {path: req.query.url, orientation: (orientation && orientation.length > 0? orientation[0] : "portrait") as "landscape" | "portrait",
				format: "a4"});
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "public, immutable, no-transform, s-maxage=86400, max-age=86400");
    res.status(200).end(file);
  } catch (error) {
    console.error(error)
    res.status(500).send("The server encountered an error. You may have inputted an invalid query.");
  }
}

function checkUrl(string) {
  var url: URL | undefined;
  try {
    url = new URL(string);
  } catch (error) {
    return false;
  }
  return true;
}
