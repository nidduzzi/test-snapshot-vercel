import { launch, Page, PaperFormat } from "puppeteer-core";
import chrome from "chrome-aws-lambda";
let _page: Page | null;

export interface CapturePdfParms {
	path: string;
	orientation?: "landscape" | "portrait";
	format?: PaperFormat;
	isFullHeight?: boolean;
	viewport?: {
		height: number;
		width: number;
	};
}

async function getPage() {
    if (_page) return _page;
    const options = { 
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless
    };
    const browser = await launch(options);
    _page = await browser.newPage();
    return _page;
}

export async function getScreenshot(url, params: CapturePdfParms) {
    const page = await getPage();
    if (params.viewport) {
        await page.setViewport({
            width: params.viewport.width,
            height: params.viewport.height,
        });
    }
    await page.goto(url, {
        waitUntil: "networkidle0",
    });
    await page.emulateMediaType("print");
    let pdf: Buffer;
    if (params.isFullHeight) {
        const pageHeight = await evaluateHeight(page);

        pdf = await page.pdf({
            margin: {
                top: "0px",
                right: "0px",
                bottom: "0px",
                left: "0px",
            },
            height: pageHeight + 2 + "px",
            width: params.viewport?.width
                ? params.viewport.width + "px"
                : undefined,
            printBackground: true,
        });
    } else {
        pdf = await page.pdf({
            landscape: params.orientation === "landscape",
            margin: {
                top: "0px",
                right: "0px",
                bottom: "0px",
                left: "0px",
            },
            printBackground: true,
            format: params.format ?? "A4",
        });
    }

    await page.close();

    return pdf;
}

async function evaluateHeight(page: Page) {
    return await page.evaluate(() => {
        let body = document.body,
            html = document.documentElement;

        let height = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
        );
        return height;
    });
}
