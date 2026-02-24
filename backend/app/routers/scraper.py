import re
from decimal import Decimal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup
from ..schemas import ScrapeResult

router = APIRouter(prefix="/scrape", tags=["scraper"])

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
}


class ScrapeRequest(BaseModel):
    url: str


def extract_price(text: str) -> Decimal | None:
    # Find first number that looks like a price
    pattern = r"[\d\s,]+\.?\d*"
    matches = re.findall(pattern, text)
    for m in matches:
        cleaned = re.sub(r"[\s,]", "", m).replace(",", ".")
        try:
            val = Decimal(cleaned)
            if val > 0:
                return val
        except Exception:
            continue
    return None


def get_og_meta(soup: BeautifulSoup, prop: str) -> str | None:
    tag = soup.find("meta", property=f"og:{prop}") or soup.find("meta", attrs={"name": f"og:{prop}"})
    if tag:
        return tag.get("content")
    return None


@router.post("/", response_model=ScrapeResult)
async def scrape_url(data: ScrapeRequest):
    url = data.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=15) as client:
            resp = await client.get(url)
            resp.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not fetch URL: {str(e)}")

    soup = BeautifulSoup(resp.text, "lxml")

    # Name
    name = (
        get_og_meta(soup, "title")
        or (soup.find("title").get_text(strip=True) if soup.find("title") else None)
        or soup.find("h1").get_text(strip=True) if soup.find("h1") else None
    )
    # Clean up name
    if name:
        name = re.sub(r"\s+", " ", name).strip()[:300]

    # Image
    image_url = (
        get_og_meta(soup, "image")
        or get_og_meta(soup, "image:url")
    )

    # Price — try multiple strategies
    price = None

    # 1. JSON-LD
    for script in soup.find_all("script", type="application/ld+json"):
        text = script.get_text()
        price_match = re.search(r'"price":\s*"?([\d,.]+)"?', text)
        if price_match:
            price = extract_price(price_match.group(1))
            if price:
                break

    # 2. Meta tags
    if not price:
        for prop in ["product:price:amount", "og:price:amount"]:
            tag = soup.find("meta", property=prop) or soup.find("meta", attrs={"name": prop})
            if tag:
                price = extract_price(tag.get("content", ""))
                if price:
                    break

    # 3. Common price selectors
    if not price:
        price_selectors = [
            '[class*="price"]', '[class*="Price"]', '[data-price]',
            '[itemprop="price"]', '.product-price', '#priceblock_ourprice',
        ]
        for selector in price_selectors:
            el = soup.select_one(selector)
            if el:
                price = extract_price(el.get_text())
                if price:
                    break

    description = get_og_meta(soup, "description")
    if description:
        description = description[:500]

    return ScrapeResult(
        name=name,
        price=price,
        image_url=image_url,
        description=description,
    )
