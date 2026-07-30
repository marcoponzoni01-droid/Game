/**
 * Phase 1 seed data.
 *
 * Four real entries, with approximate but sourced figures, so every page type
 * renders against actual content. Everything here is marked `verified` for
 * testing — the real verification workflow arrives in Phase 2.
 */

import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import {
  ImpactDirection,
  VerificationStatus,
} from "../src/generated/prisma/enums";
import { cliConnectionString, describeTarget } from "./connection";

const connectionString = cliConnectionString();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

/* -------------------------------------------------------------------------
   Tag vocabularies
------------------------------------------------------------------------- */

const EVENT_TYPES = [
  { name: "War & armed conflict", slug: "war-armed-conflict" },
  { name: "Sanctions & economic statecraft", slug: "sanctions" },
  { name: "Energy shock", slug: "energy-shock" },
  { name: "Election & referendum", slug: "election-referendum" },
  { name: "Pandemic & natural disaster", slug: "pandemic-natural-disaster" },
];

const REGIONS = [
  { name: "Europe", slug: "europe" },
  { name: "Russia & Eurasia", slug: "russia-eurasia" },
  { name: "Middle East", slug: "middle-east" },
  { name: "North America", slug: "north-america" },
  { name: "Global", slug: "global" },
];

const ERAS = [
  { name: "Cold War", slug: "cold-war", sortOrder: 1 },
  { name: "Post-Cold War", slug: "post-cold-war", sortOrder: 2 },
  { name: "Post-2008", slug: "post-2008", sortOrder: 3 },
  { name: "The 2020s", slug: "the-2020s", sortOrder: 4 },
];

const GLOSSARY = [
  {
    term: "Basis point",
    slug: "basis-point",
    shortDefinition:
      "One hundredth of a percentage point. A yield moving from 1.00% to 1.25% has moved 25 basis points. Rates people use it because 'a quarter of a percent' is ambiguous and 25bp is not.",
  },
  {
    term: "Benchmark crude",
    slug: "benchmark-crude",
    shortDefinition:
      "A specific grade of oil whose price the rest of the market quotes against. Brent is the North Sea benchmark used for most of the world; WTI is the American one, priced for delivery in Cushing, Oklahoma.",
  },
  {
    term: "Contango",
    slug: "contango",
    shortDefinition:
      "When a commodity costs more for delivery later than for delivery now — usually a sign the market expects a glut, or that storage is scarce enough to be worth paying for.",
  },
  {
    term: "Credit spread",
    slug: "credit-spread",
    shortDefinition:
      "The extra yield a company has to offer over a government bond of the same maturity. It is the price of the risk that the company does not pay you back, and it widens when investors get nervous.",
  },
  {
    term: "Embargo",
    slug: "embargo",
    shortDefinition:
      "A refusal to sell something to a particular country. Distinct from a sanction, which is usually a refusal to let your own side buy, bank or ship.",
  },
  {
    term: "Foreign exchange reserves",
    slug: "foreign-exchange-reserves",
    shortDefinition:
      "The stock of foreign currency and gold a central bank holds so it can defend its own currency or pay for imports. Reserves only work if the bank can actually spend them — which is what sanctions on a central bank take away.",
  },
  {
    term: "Peak-to-trough",
    slug: "peak-to-trough",
    shortDefinition:
      "The fall from the highest point before a decline to the lowest point after it. It is the honest way to size a crash, because it does not depend on where the calendar year happened to start.",
  },
  {
    term: "Safe-haven asset",
    slug: "safe-haven-asset",
    shortDefinition:
      "Something investors buy when they are frightened — typically US Treasuries, the dollar, gold or the Swiss franc. The label is a description of past behaviour, not a guarantee: safe havens sell off too when investors need cash badly enough.",
  },
  {
    term: "SWIFT",
    slug: "swift",
    shortDefinition:
      "The Belgian-based messaging network banks use to instruct each other to move money. It does not hold the money; it carries the instructions. Cutting a bank off does not seize its assets — it removes its ability to tell anyone what to do with them.",
  },
  {
    term: "Trade-weighted exchange rate",
    slug: "trade-weighted-exchange-rate",
    shortDefinition:
      "A currency's value measured against a basket of the currencies its country actually trades with, rather than against the dollar alone. It is the better measure of whether imports are about to get more expensive.",
  },
  {
    term: "Volatility index (VIX)",
    slug: "volatility-index-vix",
    shortDefinition:
      "A measure derived from S&P 500 option prices of how large a move traders are paying to protect against over the next 30 days. It is often called the fear gauge; it rises when protection gets expensive.",
  },
  {
    term: "Yield",
    slug: "yield",
    shortDefinition:
      "The annual return a bond pays at its current price. Price and yield move in opposite directions: when frightened investors bid the price of a government bond up, its yield falls.",
  },
];

/* -------------------------------------------------------------------------
   Entries
------------------------------------------------------------------------- */

type ImpactSeed = {
  assetClass: string;
  instrument: string;
  direction: ImpactDirection;
  magnitude: string;
  timeframe: string;
  mechanism: string;
};

type EntrySeed = {
  title: string;
  slug: string;
  startDate: Date;
  endDate: Date | null;
  dateDisplay: string;
  summary: string;
  deepDive: string;
  persistence: string;
  soWhat: string;
  featured: boolean;
  eventTypes: string[];
  regions: string[];
  eras: string[];
  glossaryTerms: string[];
  marketImpacts: ImpactSeed[];
  sources: { url: string; label: string }[];
};

const ENTRIES: EntrySeed[] = [
  {
    title: "The 1973 Arab oil embargo",
    slug: "arab-oil-embargo-1973",
    startDate: day("1973-10-17"),
    endDate: day("1974-03-18"),
    dateDisplay: "October 1973 – March 1974",
    summary:
      "Ten days into the Yom Kippur War, the Arab members of OPEC cut production and embargoed shipments to the United States and the Netherlands. The posted price of crude roughly quadrupled in three months, and the industrial world discovered that its cheapest input was also its most political one.",
    deepDive: `On 17 October 1973, meeting in Kuwait, the Arab oil ministers agreed to cut output by 5% a month and to embargo countries they judged to be supporting Israel in the war that had begun eleven days earlier. The United States and the Netherlands were named first; Portugal, Rhodesia and South Africa followed.

The volume actually withdrawn from the market was modest — a few million barrels a day against world consumption of roughly fifty. What changed was not the arithmetic of supply but the assumption underneath it. Oil had been priced as though it were always available at a posted price set by the international companies. After October 1973 it was priced as something a cartel of governments could withhold, and the market paid for that uncertainty on top of every barrel.

The mechanism ran straight into the real economy. Crude was the input to transport, electricity, plastics, fertiliser and freight, and there was no fast substitute for any of them. Costs rose across every industry at once, so the shock showed up as inflation rather than as a demand slump — and the central banks of the day, still working with the tools of the 1960s, could not lower it without a recession. American consumer price inflation ran at 3.4% in 1972 and 12.3% by the end of 1974.

For markets, the embargo arrived on top of an already fragile backdrop. The Bretton Woods system of fixed exchange rates had collapsed in stages between 1971 and 1973, so currencies were floating for the first time in a generation. Equities had peaked in January 1973. The oil shock turned an ordinary bear market into the worst since the 1930s: the Dow fell 45% from its January 1973 intraday peak of 1,051.70 to a closing low of 577.60 in December 1974.

The embargo formally ended in March 1974, but the price did not go back. OPEC had discovered it could set price directly, and it kept doing so. That is the part worth remembering: the embargo was a six-month event that produced a permanent repricing.`,
    persistence: `The embargo itself lasted five months. The price level it established lasted the rest of the decade — crude never returned to its pre-1973 range, and a second shock in 1979 took it higher again.

The structural consequences ran longer still. The International Energy Agency was created in 1974 specifically so that consumer countries could coordinate stockpiles. Strategic petroleum reserves, fuel-economy standards, North Sea and Alaskan development, and the French nuclear programme all trace to this window. Each was a deliberate attempt to make the next embargo less effective — and collectively they worked, which is why later supply threats have moved price less than this one did.

Equity markets took until 1982 to reclaim their 1973 highs in nominal terms, and considerably longer in real terms.`,
    soWhat:
      "An embargo does not need to remove much supply to move price a long way — it only needs to remove the market's belief that supply is guaranteed.",
    featured: true,
    eventTypes: ["energy-shock", "war-armed-conflict"],
    regions: ["middle-east", "global"],
    eras: ["cold-war"],
    glossaryTerms: [
      "embargo",
      "benchmark-crude",
      "peak-to-trough",
      "safe-haven-asset",
    ],
    marketImpacts: [
      {
        assetClass: "Commodities",
        instrument: "Crude oil (posted price)",
        direction: ImpactDirection.rise,
        magnitude: "$2.90 → $11.65 a barrel, roughly +300%",
        timeframe: "October 1973 – January 1974",
        mechanism:
          "Production cuts removed only a few percent of world supply, but they removed the assumption that supply was apolitical. Buyers who had held no inventory because oil was always available began holding it because it might not be, and that scramble for stock did more to the price than the missing barrels did.",
      },
      {
        assetClass: "Equities",
        instrument: "Dow Jones Industrial Average",
        direction: ImpactDirection.decline,
        magnitude: "−45%, from 1,051.70 to a closing low of 577.60",
        timeframe: "January 1973 – December 1974",
        mechanism:
          "Energy is an input cost for almost every listed company, so the shock compressed profit margins across the market at the same moment that rising inflation pushed up the rate at which future profits were discounted. Both halves of an equity valuation moved the wrong way at once.",
      },
      {
        assetClass: "Commodities",
        instrument: "Gold",
        direction: ImpactDirection.rise,
        magnitude: "About $100 → $183 an ounce, roughly +80%",
        timeframe: "October 1973 – December 1974",
        mechanism:
          "With inflation in double digits, cash and bonds were losing purchasing power in real terms. Gold had only just been freed to trade at a market price after the end of dollar convertibility, and it absorbed the demand from investors looking for something that could not be printed.",
      },
      {
        assetClass: "Rates & bonds",
        instrument: "US 10-year Treasury yield",
        direction: ImpactDirection.rise,
        magnitude: "About 6.5% → 8%",
        timeframe: "1973 – 1975",
        mechanism:
          "Bond investors demand compensation for expected inflation. With prices rising above 12% a year, an 8% yield was still deeply negative in real terms — which is why bonds were not the safe haven in this episode that they would be in later ones.",
      },
      {
        assetClass: "Currencies",
        instrument: "US dollar (trade-weighted)",
        direction: ImpactDirection.mixed,
        magnitude: "Sharply weaker through mid-1973, then a firm recovery into 1974",
        timeframe: "1973 – 1974",
        mechanism:
          "Two forces pulled in opposite directions. American inflation and the newly floating regime pushed the dollar down; the fact that oil was invoiced in dollars meant every importing country now needed far more of them, which pulled it back up. The second force is the origin of the term petrodollar.",
      },
    ],
    sources: [
      {
        url: "https://history.state.gov/milestones/1969-1976/oil-embargo",
        label:
          "Office of the Historian, US Department of State — Oil Embargo, 1973–1974",
      },
      {
        url: "https://www.federalreservehistory.org/essays/oil-shock-of-1973-74",
        label:
          "Federal Reserve History — Oil Shock of 1973–74 (price moving from $2.90 to $11.65 a barrel)",
      },
      {
        url: "https://www.britannica.com/event/Arab-oil-embargo",
        label: "Britannica — Arab oil embargo: cause, impact and definition",
      },
      {
        url: "https://en.wikipedia.org/wiki/1973%E2%80%931974_stock_market_crash",
        label:
          "1973–1974 stock market crash — Dow peak-to-trough of 1,051.70 to 577.60",
      },
    ],
  },

  {
    title: "The Brexit referendum",
    slug: "brexit-referendum-2016",
    startDate: day("2016-06-23"),
    endDate: day("2016-12-31"),
    dateDisplay: "June – December 2016",
    summary:
      "The United Kingdom voted 51.9% to leave the European Union. Sterling fell 8% in a single session — the largest one-day move since the pound began floating in 1971 — while the FTSE 100 ended the year higher than it started. The split between the two is the whole lesson.",
    deepDive: `Polling and betting markets had spent the final week of the campaign converging on a Remain result, and markets had positioned for it: sterling rallied to about \$1.50 on referendum day itself. When the Sunderland count came in far more Leave than expected, that positioning unwound in a few hours of thin overnight trading. The pound traded from \$1.5018 to a low of \$1.3229 — an 8% fall on the day, larger than anything seen on Black Wednesday in 1992 or in the 2008 crisis.

The equity reaction is where the episode becomes genuinely instructive. The FTSE 100 fell 3.2% on 24 June and recovered within days, finishing 2016 up around 14%. The FTSE 250 fell 7.2% on the day and roughly 14% across the two sessions, and took far longer to recover.

The two indices tell different stories because they own different businesses. Roughly three quarters of FTSE 100 revenue is earned outside the United Kingdom, in dollars and euros. When sterling falls, those foreign earnings translate into more pounds, so the index goes up in sterling terms even as the country gets poorer in dollar terms. The FTSE 250 is far more domestic — housebuilders, retailers, regional banks — so it took the hit undiluted.

Gilts rallied hard. The 10-year yield fell from 1.37% before the vote towards a record low near 0.5% by mid-August, helped along by the Bank of England cutting Bank Rate to 0.25% and restarting asset purchases in August. Investors were not pricing a UK default; they were pricing years of weaker growth and easier policy.

The most durable effect was not the crash but the level. Sterling did not bounce back. It settled roughly 10–15% below its pre-referendum trade-weighted level and stayed there, which fed through to import prices and pushed UK inflation above 3% during 2017 — a real, measurable cut in household purchasing power delivered entirely through the exchange rate.`,
    persistence: `The one-day equity moves were reversed within weeks. The currency move was not.

Sterling's repricing has proved close to permanent: the pound has never sustainably regained its pre-referendum trade-weighted level, and the resulting import-cost pass-through raised UK consumer price inflation through 2017 by roughly a percentage point on most estimates. The gilt-yield collapse reversed over the following two years as inflation arrived and the Bank of England reversed its emergency cut in November 2017.

The useful distinction is between a shock that changes sentiment and one that changes the terms on which a country trades. This was the second kind. Equity indices re-rated within a quarter; the exchange rate re-based for a decade.`,
    soWhat:
      "A currency can absorb a political shock that the headline equity index shrugs off — when the index earns its revenue abroad, the falling currency is the very thing propping it up.",
    featured: true,
    eventTypes: ["election-referendum"],
    regions: ["europe"],
    eras: ["post-2008"],
    glossaryTerms: [
      "trade-weighted-exchange-rate",
      "yield",
      "basis-point",
      "peak-to-trough",
    ],
    marketImpacts: [
      {
        assetClass: "Currencies",
        instrument: "Sterling (GBP/USD)",
        direction: ImpactDirection.decline,
        magnitude:
          "−8.1% in one session, $1.5018 → $1.3229; about −16% by October",
        timeframe: "24 June – 7 October 2016",
        mechanism:
          "The market had positioned for Remain, so the result forced a simultaneous unwind of long-sterling positions into overnight liquidity. Underneath the positioning was a genuine repricing: leaving the single market meant worse expected trade terms, and an exchange rate is the price at which a country's output clears against everyone else's.",
      },
      {
        assetClass: "Equities",
        instrument: "FTSE 100",
        direction: ImpactDirection.mixed,
        magnitude: "−3.2% on the day, then about +14% over the calendar year",
        timeframe: "24 June – 30 December 2016",
        mechanism:
          "Around three quarters of FTSE 100 revenue is earned abroad. A weaker pound mechanically inflates those foreign earnings when they are converted back into sterling, so the same shock that hurt the country flattered the index it is most often measured by.",
      },
      {
        assetClass: "Equities",
        instrument: "FTSE 250",
        direction: ImpactDirection.decline,
        magnitude: "−7.2% on the day, about −14% across two sessions",
        timeframe: "24 – 27 June 2016",
        mechanism:
          "Mid-cap Britain sells to Britain. Housebuilders, domestic retailers and regional banks got no translation benefit from the weaker pound and took the full weight of a lower growth forecast, which is why the FTSE 250 is the better read on the domestic economy.",
      },
      {
        assetClass: "Equities",
        instrument: "UK-focused banks (Barclays, RBS)",
        direction: ImpactDirection.decline,
        magnitude: "Around −18% on the day",
        timeframe: "24 June 2016",
        mechanism:
          "Banks are leveraged bets on domestic growth: their earnings depend on loan demand, on the interest margin, and on borrowers not defaulting. A forecast of slower growth and lower policy rates damages all three at once.",
      },
      {
        assetClass: "Rates & bonds",
        instrument: "UK 10-year gilt yield",
        direction: ImpactDirection.decline,
        magnitude: "1.37% → a then-record low near 0.5%",
        timeframe: "23 June – August 2016",
        mechanism:
          "Falling yields here were not a vote of confidence but the opposite: investors were pricing years of weaker growth and an easier Bank of England, which duly cut Bank Rate to 0.25% and restarted asset purchases in August. Weaker growth means lower future policy rates, and bond prices rise to reflect that.",
      },
    ],
    sources: [
      {
        url: "https://money.cnn.com/2016/06/24/investing/brexit-london-stocks-crashing/index.html",
        label:
          "CNN Money, 24 June 2016 — FTSE 100 −3.2% and FTSE 250 −7.2% on the day",
      },
      {
        url: "https://www.financialresearch.gov/financial-markets-monitor/files/OFR-FMM-2016-07-14_Markets-UK_Referendum_Roils_Markets.pdf",
        label:
          "US Office of Financial Research — Markets Monitor, Q2 2016: the UK referendum roils markets",
      },
      {
        url: "https://fred.stlouisfed.org/series/DEXUSUK",
        label: "FRED — US dollar / UK pound daily exchange rate (DEXUSUK)",
      },
      {
        url: "https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate",
        label: "Bank of England — Bank Rate history (cut to 0.25% in August 2016)",
      },
      {
        url: "https://www.schroders.com/en-us/us/individual/insights/brexit-three-years-on-markets-and-the-economy-in-six-charts/",
        label: "Schroders — Brexit three years on: markets and the economy in six charts",
      },
    ],
  },

  {
    title: "The COVID-19 market shock",
    slug: "covid-19-market-shock-2020",
    startDate: day("2020-02-19"),
    endDate: day("2020-04-30"),
    dateDisplay: "February – April 2020",
    summary:
      "The fastest bear market in the history of the S&P 500: −33.9% in 23 trading days. Every asset class moved, including the ones that are supposed to move the other way — and in April, the price of American oil went below zero for the first time on record.",
    deepDive: `The S&P 500 set a record high of 3,386.15 on 19 February 2020 and closed at 2,237.40 on 23 March — a 33.9% peak-to-trough decline in 23 trading sessions. The 2008 crisis took over a year to fall further. The VIX closed at 82.69 on 16 March, the highest close in its history.

What made March 2020 unusual was not the size of the equity fall but the behaviour of everything else. For the first ten days, markets behaved as the textbook says: equities down, Treasuries up, the 10-year yield falling to an all-time low of 0.318% on 9 March. Then, in the second week, the pattern broke. Treasuries sold off alongside equities. Gold fell about 12%. Even the most liquid assets in the world traded at unusual spreads.

The reason was a dash for cash. Leveraged investors facing margin calls, funds facing redemptions, and companies drawing down credit lines all needed dollars at the same moment, and the only way to raise dollars quickly is to sell what you can sell rather than what you would like to sell. That means selling your best assets. It is why the dollar itself rose about 8% in ten sessions while American equities were collapsing — the reserve currency gets bid up precisely when everyone is short of it.

Policy responded at a speed with no precedent. The Federal Reserve cut to a 0–0.25% target range on 15 March, restarted large-scale asset purchases, and reopened dollar swap lines with other central banks; by late March it had announced facilities to buy corporate credit outright. Investment-grade credit spreads, which had blown out from about 101 to 373 basis points, began narrowing almost immediately. The equity low came on 23 March, two days before the US Senate passed a \$2 trillion fiscal package.

Oil was the last shoe to drop, and the strangest. Demand fell by roughly a fifth while OPEC and Russia were briefly in a price war, and American storage at Cushing, Oklahoma filled up. On 20 April the expiring May WTI futures contract settled at −\$37.63 a barrel: holders of a contract requiring physical delivery had nowhere to put the oil, and paid to be released from it.`,
    persistence: `The equity drawdown was violent and short. The S&P 500 regained its February high by August 2020 and ended the year up 16%, a recovery driven by the speed and scale of the monetary and fiscal response rather than by any improvement in the underlying situation.

The negative oil print lasted one afternoon and was a contract-settlement artefact rather than a lasting price. But the demand destruction behind it lasted well over a year, and the production discipline it forced on OPEC+ set up the tight market that 2022's supply shock landed on.

The longest-lived consequence was inflationary, and it took eighteen months to show up. Fiscal transfers supported goods demand while supply chains were still impaired, and by late 2021 US consumer price inflation was running above 6% — before Russia's invasion of Ukraine added an energy shock on top of it. The 2020 crash and the 2022 inflation are usually filed as separate events; they are better read as one sequence.`,
    soWhat:
      "In a true liquidity panic, correlations go to one and the safe havens sell off too — what matters is not what you own, but who else is forced to sell it.",
    featured: true,
    eventTypes: ["pandemic-natural-disaster"],
    regions: ["global", "north-america"],
    eras: ["the-2020s"],
    glossaryTerms: [
      "safe-haven-asset",
      "volatility-index-vix",
      "credit-spread",
      "contango",
      "peak-to-trough",
      "benchmark-crude",
    ],
    marketImpacts: [
      {
        assetClass: "Equities",
        instrument: "S&P 500",
        direction: ImpactDirection.decline,
        magnitude: "−33.9%, 3,386.15 → 2,237.40, in 23 trading sessions",
        timeframe: "19 February – 23 March 2020",
        mechanism:
          "Lockdowns removed revenue from entire sectors at once with no way to forecast when it would return. Because the loss was simultaneous and economy-wide rather than concentrated in one industry, there was nowhere in the index to hide, and diversification across sectors did almost nothing.",
      },
      {
        assetClass: "Volatility",
        instrument: "VIX index",
        direction: ImpactDirection.rise,
        magnitude: "Closed at 82.69, the highest close on record",
        timeframe: "16 March 2020",
        mechanism:
          "The VIX measures what traders are paying for 30-day protection on the S&P 500. With the range of plausible outcomes genuinely enormous and dealers unwilling to sell insurance at any normal price, option premiums went to levels above even the 2008 peak.",
      },
      {
        assetClass: "Rates & bonds",
        instrument: "US 10-year Treasury yield",
        direction: ImpactDirection.decline,
        magnitude: "1.56% → an all-time low of 0.318%",
        timeframe: "19 February – 9 March 2020",
        mechanism:
          "The classic flight to quality: investors bought the most liquid government bond in the world, pushing its price up and its yield down. Note that this held only for the first three weeks — in the dash-for-cash phase that followed, even Treasuries were sold, which is what forced the Federal Reserve to intervene directly.",
      },
      {
        assetClass: "Credit",
        instrument: "US investment-grade corporate spreads",
        direction: ImpactDirection.rise,
        magnitude: "About 101 → 373 basis points over Treasuries",
        timeframe: "February – 23 March 2020",
        mechanism:
          "A credit spread is the price of default risk. Companies facing an indefinite revenue stop looked far more likely to miss a payment, and at the same time the dealers who normally warehouse corporate bonds ran out of balance sheet — so the spread widened on deteriorating credit and vanishing liquidity together.",
      },
      {
        assetClass: "Commodities",
        instrument: "WTI crude, May 2020 contract",
        direction: ImpactDirection.decline,
        magnitude: "Settled at −$37.63 a barrel, the first negative close on record",
        timeframe: "20 April 2020",
        mechanism:
          "WTI futures settle by physical delivery at Cushing, Oklahoma, and Cushing's tanks were effectively full. Anyone still holding the expiring contract had to take barrels they had nowhere to store, so they paid others to take the obligation away. The price went negative because storage, not oil, was the scarce thing.",
      },
      {
        assetClass: "Currencies",
        instrument: "US dollar (DXY)",
        direction: ImpactDirection.rise,
        magnitude: "About +8% in ten sessions",
        timeframe: "9 – 20 March 2020",
        mechanism:
          "Most of the world's cross-border debt is denominated in dollars, so a global scramble for cash is a scramble for dollars specifically. The reserve currency strengthens in a crisis not because America looks safe but because everyone else owes in it — the Fed's swap lines with other central banks existed to relieve exactly this squeeze.",
      },
      {
        assetClass: "Commodities",
        instrument: "Gold",
        direction: ImpactDirection.mixed,
        magnitude: "−12% in eight sessions, then +42% to a record $2,067",
        timeframe: "9 March – 6 August 2020",
        mechanism:
          "Gold's two-stage move is the clearest illustration of the episode. In the liquidity panic it was sold because it was liquid and could be sold. Once central banks had supplied the cash and real interest rates had collapsed, the reason to hold a non-yielding asset improved dramatically and it went to a record.",
      },
    ],
    sources: [
      {
        url: "https://fred.stlouisfed.org/series/SP500",
        label: "FRED — S&P 500 daily closing levels (SP500)",
      },
      {
        url: "https://www.cnbc.com/2020/03/16/wall-streets-fear-gauge-hits-highest-level-ever.html",
        label: "CNBC, 16 March 2020 — VIX closes at a record 82.69",
      },
      {
        url: "https://www.cnbc.com/2020/03/09/10-year-treasury-yield-plunges.html",
        label:
          "CNBC, 9 March 2020 — 10-year Treasury yield hits an all-time low of 0.318%",
      },
      {
        url: "https://www.cftc.gov/PressRoom/PressReleases/8315-20",
        label:
          "CFTC — Interim staff report on NYMEX WTI trading around 20 April 2020",
      },
      {
        url: "https://www.eia.gov/todayinenergy/detail.php?id=46336",
        label:
          "US Energy Information Administration — crude oil prices briefly traded below $0 in spring 2020",
      },
      {
        url: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20200315a.htm",
        label:
          "Federal Reserve, 15 March 2020 — target range cut to 0–0.25% and asset purchases restarted",
      },
      {
        url: "https://fred.stlouisfed.org/series/BAMLC0A0CM",
        label:
          "FRED — ICE BofA US corporate index option-adjusted spread (BAMLC0A0CM)",
      },
    ],
  },

  {
    title: "Russia's invasion of Ukraine and the SWIFT sanctions",
    slug: "russia-ukraine-invasion-swift-sanctions-2022",
    startDate: day("2022-02-24"),
    endDate: null,
    dateDisplay: "February 2022 – ongoing",
    summary:
      "Russia invaded Ukraine on 24 February 2022. Within 72 hours the West had removed selected Russian banks from SWIFT and frozen roughly $300 billion of central bank reserves — an unprecedented sanction on the reserves of a G20 country. Brent touched $139, European gas reached fifteen times its normal price, and the rouble halved before capital controls stopped it.",
    deepDive: `The military event and the financial event were two days apart and had almost opposite market effects, which is why they are worth separating.

The invasion itself, on 24 February, produced the reaction any war in a major commodity exporter produces: energy up, equities down, government bonds bid. Brent rose from around \$96 to close near \$99 on the day. European equities fell. German Bund yields, which had been climbing all month, dropped from 0.23% to 0.16% in two sessions as investors bought safety.

The sanctions announced over the following weekend were the genuinely novel part. Removing selected Russian banks from SWIFT was widely reported as the headline measure, but SWIFT is only a messaging network — it carries instructions, not money. The measure with real force was the freeze on the Central Bank of Russia's foreign exchange reserves, roughly \$300 billion of the \$630 billion Russia had accumulated specifically as a war chest. A central bank's reserves exist so it can defend its currency; freezing them meant Russia could not spend the dollars and euros it owned.

The rouble's response was immediate — it fell about 26% in a session and reached roughly 135 to the dollar by 7 March, down from 76 before the invasion. The Russian central bank responded with the only tools left to it: it raised its policy rate from 9.5% to 20% overnight, closed the Moscow exchange for a month, forced exporters to convert 80% of their foreign earnings into roubles, and barred residents from taking currency out. Those controls worked in the narrow sense that the rouble not only recovered but reached a seven-year high by June 2022 — a widely misread signal, since a currency held up by capital controls and a collapse in imports is telling you about the controls, not about the economy.

The larger and more durable shock was European energy. Russia had supplied roughly 40% of EU natural gas, and through 2022 those flows were progressively cut — via the Nord Stream reduction in June, the shutdown in September, and the pipeline's sabotage weeks later. Dutch TTF gas, the European benchmark, reached about €340 per megawatt hour in late August 2022, some fifteen times its pre-crisis norm of roughly €20. That fed directly into electricity prices, industrial costs and household bills across the continent, and it forced the European Central Bank into its fastest tightening cycle ever: Bund yields ended 2022 above 2.4%.

Brent's own peak of \$139.13 on 7 March was brief. Oil is a global market with substitutable barrels, and Russian crude was largely redirected to India and China at a discount rather than removed from supply. Gas, which moves through fixed pipes, had no such flexibility — which is why the gas shock was several times larger than the oil shock and lasted far longer.`,
    persistence: `The oil spike lasted weeks. The gas shock lasted about eighteen months, and its political consequences are permanent.

Brent was back below its pre-invasion level by the end of 2022 as Russian barrels found new buyers. European gas fell back under €40/MWh through 2023 as the continent built LNG import capacity, filled storage early, and lost a slice of its energy-intensive industry outright — demand destruction that has not fully returned.

The most durable change is not a price at all. Freezing a G20 central bank's reserves demonstrated that reserves held in another country's financial system are conditional on that country's consent. Every reserve manager in the world now prices that possibility, which shows up in steady central bank gold buying and in slow diversification away from dollar and euro assets at the margin. It is a small effect measured year by year and a significant one measured by decade.

Roughly $300 billion of Russian reserves remain frozen, most of it in Europe, and their eventual disposition is still unresolved.`,
    soWhat:
      "When sanctions target the plumbing rather than the product, the price shock lands on whoever cannot re-route — oil found new buyers in weeks, and pipeline gas could not.",
    featured: true,
    eventTypes: ["war-armed-conflict", "sanctions", "energy-shock"],
    regions: ["europe", "russia-eurasia"],
    eras: ["the-2020s"],
    glossaryTerms: [
      "swift",
      "foreign-exchange-reserves",
      "benchmark-crude",
      "safe-haven-asset",
      "yield",
      "basis-point",
    ],
    marketImpacts: [
      {
        assetClass: "Commodities",
        instrument: "Dutch TTF natural gas",
        direction: ImpactDirection.rise,
        magnitude: "About €340/MWh at the peak, roughly 15× the pre-crisis norm",
        timeframe: "February – 26 August 2022",
        mechanism:
          "Gas arrives through fixed pipelines and cannot be re-routed the way a tanker can. With roughly 40% of EU supply progressively withdrawn and LNG import terminals not yet built, buyers were bidding for a physically capped quantity — so price had to rise until enough demand gave up. That is what a genuinely inelastic market looks like.",
      },
      {
        assetClass: "Commodities",
        instrument: "Brent crude",
        direction: ImpactDirection.rise,
        magnitude: "About $96 → an intraday $139.13, roughly +45%",
        timeframe: "24 February – 7 March 2022",
        mechanism:
          "The spike priced the risk that Russian barrels would leave the market entirely. They largely did not — they were redirected to India and China at a discount. Because oil is fungible and moves by sea, the shock decayed within months, which is precisely the difference between the oil market and the gas market here.",
      },
      {
        assetClass: "Currencies",
        instrument: "Russian rouble (vs US dollar)",
        direction: ImpactDirection.decline,
        magnitude: "76 → about 135 per dollar, roughly −44%",
        timeframe: "24 February – 7 March 2022",
        mechanism:
          "Freezing the central bank's reserves removed its ability to defend the currency by selling dollars, so the exchange rate fell until the authorities substituted capital controls for reserves — a 20% policy rate, a closed exchange, and forced conversion of exporters' earnings. The subsequent recovery to a seven-year high measured the controls, not confidence.",
      },
      {
        assetClass: "Currencies",
        instrument: "Euro (EUR/USD)",
        direction: ImpactDirection.decline,
        magnitude: "About $1.13 → $0.96, below parity for the first time since 2002",
        timeframe: "February – September 2022",
        mechanism:
          "Europe had to buy energy priced in dollars from further away, which is a straightforward deterioration in its terms of trade: more euros out for the same energy in. The euro fell until that new balance cleared.",
      },
      {
        assetClass: "Rates & bonds",
        instrument: "German 10-year Bund yield",
        direction: ImpactDirection.mixed,
        magnitude: "0.23% → 0.16% within two days, then above 2.4% by December",
        timeframe: "February – December 2022",
        mechanism:
          "The two-stage move separates the war from its consequences. In the first days, investors bought Bunds for safety and the yield fell. Over the following months, energy-driven inflation forced the ECB into its fastest tightening cycle ever, and the yield rose to a level not seen since 2011.",
      },
      {
        assetClass: "Equities",
        instrument: "Euro Stoxx 50",
        direction: ImpactDirection.decline,
        magnitude: "About −17% peak to trough",
        timeframe: "February – 7 March 2022",
        mechanism:
          "European industry runs on energy it now had to buy at a multiple of the old price, and the continent's banks held the most direct exposure to Russian counterparties. Both hit the index at once, which is why European equities fell far more than American ones on the same news.",
      },
    ],
    sources: [
      {
        url: "https://www.consilium.europa.eu/en/policies/sanctions-against-russia/",
        label:
          "Council of the European Union — sanctions against Russia, including the SWIFT measures",
      },
      {
        url: "https://www.brookings.edu/articles/what-is-the-status-of-russias-frozen-sovereign-assets/",
        label:
          "Brookings — the status of Russia's frozen sovereign assets (roughly $300bn)",
      },
      {
        url: "https://www.business-standard.com/article/international/ruble-declines-26-after-swift-sanctions-against-russian-banks-122022800390_1.html",
        label:
          "Business Standard, 28 February 2022 — rouble falls about 26% after the SWIFT measures",
      },
      {
        url: "https://www.dallasfed.org/research/economics/2022/0531",
        label:
          "Federal Reserve Bank of Dallas — Russia counters sanctions' impact with currency controls",
      },
      {
        url: "https://www.esma.europa.eu/sites/default/files/2023-10/ESMA50-524821-2963_TRV_Article_the_August_2022_surge_in_the_price_of_natural_gas_futures.pdf",
        label:
          "ESMA — the August 2022 surge in the price of natural gas futures (TTF peak near €340/MWh)",
      },
      {
        url: "https://fred.stlouisfed.org/series/DCOILBRENTEU",
        label: "FRED — Brent crude daily spot price (DCOILBRENTEU)",
      },
      {
        url: "https://fred.stlouisfed.org/series/DEXUSEU",
        label: "FRED — US dollar / euro daily exchange rate (DEXUSEU)",
      },
    ],
  },
];

/* -------------------------------------------------------------------------
   Related events (precedents and echoes)
------------------------------------------------------------------------- */

const RELATIONS: { from: string; to: string; note: string }[] = [
  {
    from: "russia-ukraine-invasion-swift-sanctions-2022",
    to: "arab-oil-embargo-1973",
    note: "The closest precedent for energy used deliberately as leverage. 1973 withdrew supply to change foreign policy; 2022 withdrew it to answer sanctions. Both show that a modest cut to a physically constrained market produces a price move far larger than the missing volume implies.",
  },
  {
    from: "russia-ukraine-invasion-swift-sanctions-2022",
    to: "covid-19-market-shock-2020",
    note: "These are usually filed as separate events. They are better read as one sequence: 2020's supply-chain damage and fiscal support had already pushed inflation above 6% before the invasion added an energy shock on top of it.",
  },
  {
    from: "russia-ukraine-invasion-swift-sanctions-2022",
    to: "brexit-referendum-2016",
    note: "Both episodes repriced a currency on political news rather than on an economic release — and in both cases the currency, not the equity index, was where the durable damage showed up.",
  },
  {
    from: "covid-19-market-shock-2020",
    to: "arab-oil-embargo-1973",
    note: "The two occasions when the crude oil market stopped behaving like a price and started behaving like a physical constraint — 1973 because there was not enough oil, 2020 because there was nowhere left to put it.",
  },
  {
    from: "brexit-referendum-2016",
    to: "arab-oil-embargo-1973",
    note: "1973 is the reference case for a political decision permanently re-rating an asset class rather than temporarily disturbing it. Sterling after 2016 did the same thing on a smaller scale.",
  },
  {
    from: "arab-oil-embargo-1973",
    to: "russia-ukraine-invasion-swift-sanctions-2022",
    note: "The echo, fifty years on. The lesson consumer countries drew in 1974 — build reserves, diversify suppliers, cut demand — is precisely the playbook Europe ran in 2022, and it is why the gas shock lasted eighteen months rather than a decade.",
  },
];

/* -------------------------------------------------------------------------
   Newsletter issues
------------------------------------------------------------------------- */

const ISSUES = [
  {
    issueNumber: 1,
    publishDate: day("2016-06-26"),
    title: "The pound takes the strain",
    teaser:
      "Britain voted to leave, the FTSE 100 finished the year up 14%, and the country still got poorer. Both of those things are true, and the exchange rate is why.",
    currentEventSummary: `On Thursday the United Kingdom voted 51.9% to 48.1% to leave the European Union, on a turnout of 72%. Sterling fell 8% against the dollar in a single overnight session — the largest one-day move since the pound began floating in 1971 — and the FTSE 250 closed 7.2% lower on Friday.

The FTSE 100 fell 3.2% and had recovered its losses within a week.`,
    essayBody: `The temptation this weekend is to read the FTSE 100's recovery as the market shrugging off the result. It is not. It is the market repricing the currency the index is denominated in.

Roughly three quarters of FTSE 100 revenue is earned outside the United Kingdom. When a company sells in dollars and reports in pounds, a falling pound makes its earnings look larger without anything real having improved. A British index that goes up while Britain gets poorer is not a contradiction; it is arithmetic, and it is the single most useful thing to understand about reading a national stock index.

The FTSE 250 is the honest read. Mid-cap Britain sells to Britain: housebuilders, domestic retailers, regional banks. It got no translation benefit and fell twice as hard, and that gap between the two indices — three percent against seven — is a cleaner measure of what the market thinks the vote did to the domestic economy than any single number.

The precedent worth reaching for is not another referendum. It is 1973, when the Arab oil embargo demonstrated that a political decision could permanently re-rate an asset class rather than temporarily disturb it. Crude never went back to its pre-embargo range. The question for sterling is which kind of shock this is: the sort that reverses when sentiment recovers, or the sort that changes the terms on which a country trades.

The gilt market has already made its guess. Ten-year yields fell from 1.37% to near 1% on Friday — not a vote of confidence but a forecast of years of weaker growth and an easier Bank of England.`,
    whatToWatch: `Whether sterling stabilises or keeps sliding through the summer. A currency fall of this size passes into import prices with a lag of roughly six to twelve months, so the real test of whether this was a repricing or a panic will be UK inflation in 2017, not the FTSE next week.`,
    precedents: ["arab-oil-embargo-1973"],
  },
  {
    issueNumber: 2,
    publishDate: day("2020-03-22"),
    title: "Everything sold at once",
    teaser:
      "The textbook says bonds rise when equities fall. For ten days it held. Then it stopped, and that is the part worth understanding.",
    currentEventSummary: `The S&P 500 has fallen 32% from its 19 February record. The VIX closed at 82.69 on Monday, the highest close in its history. On Sunday the Federal Reserve cut its target range to 0–0.25%, restarted asset purchases and reopened dollar swap lines with other central banks.

Most strikingly, in the past week US Treasuries and gold have fallen alongside equities, and the dollar has risen about 8% in ten sessions.`,
    essayBody: `Two different things have happened in the past month, and conflating them makes the second one incomprehensible.

The first was an ordinary, if very fast, risk-off move. Equities fell, Treasuries rallied, and the 10-year yield hit an all-time low of 0.318% on 9 March. Diversification worked exactly as advertised.

The second was a liquidity event, and it followed different rules. When leveraged investors face margin calls and funds face redemptions, they need cash today, and the way you raise cash quickly is to sell what is liquid rather than what you would prefer to sell. That means selling your best assets — Treasuries, gold, the things that were supposed to protect you. Correlations went to one not because the assets became similar but because their holders became similar: everyone was a forced seller at once.

This is also why the dollar rose while American equities were collapsing. Most cross-border debt in the world is denominated in dollars, so a global scramble for cash is specifically a scramble for dollars. The Fed's swap lines exist to relieve exactly that squeeze, and they were reopened for exactly that reason.

The archive's closest analogue is not 2008 — that was a solvency crisis in a single sector that spread outward. It is closer to 1973, when the shock came from outside the financial system entirely and hit every industry's costs at the same moment. And the currency lesson from 2016 applies in reverse: then, a domestic political shock sent one currency down; now, a global one sends the reserve currency up, for the same underlying reason that exchange rates are where cross-border stress gets expressed first.

The practical implication is uncomfortable. In a genuine liquidity panic, what matters is not what you own but who else has to sell it — and that is not knowable from a correlation table calculated in calm markets.`,
    whatToWatch: `Credit spreads, not equity prices. Investment-grade spreads have widened from about 101 to over 370 basis points. If the Fed's new facilities work, that number will turn before the S&P does, because it measures whether companies can still borrow — which is the thing that decides whether a market crash becomes an economic one.`,
    precedents: ["arab-oil-embargo-1973", "brexit-referendum-2016"],
  },
  {
    issueNumber: 3,
    publishDate: day("2022-03-06"),
    title: "When the plumbing becomes the weapon",
    teaser:
      "Cutting a bank off from SWIFT does not take its money. Freezing a central bank's reserves does — and that is the measure that changed the week.",
    currentEventSummary: `Russia invaded Ukraine on 24 February. Over the following weekend, the European Union, United States, United Kingdom and Canada removed selected Russian banks from SWIFT and — the far heavier measure — froze roughly $300 billion of the Central Bank of Russia's foreign exchange reserves.

The rouble fell about 26% in a session and traded near 135 to the dollar this week, from 76 before the invasion. The Russian central bank raised its policy rate from 9.5% to 20% and closed the Moscow exchange. Brent touched $139.13 on Monday.`,
    essayBody: `SWIFT got the headlines, and SWIFT is the less important half of the story. It is a messaging network: it carries the instruction to move money, not the money. Removing a bank from it is genuinely disruptive — payments have to be arranged by slower, bilateral means — but it does not take anything away.

The reserve freeze does. Russia had accumulated roughly \$630 billion in foreign exchange reserves, explicitly as insurance against this scenario. Around half of it was held as claims on Western financial systems: deposits and securities in dollars, euros, sterling and yen. Those claims only have value if the institutions holding them will honour them, and last weekend they stopped. A central bank whose reserves are frozen cannot defend its currency, because defending a currency means selling dollars to buy your own — and it no longer has dollars it can spend.

What Russia did next is the standard playbook when reserves are unavailable: substitute controls. A 20% policy rate to make holding roubles compulsory-attractive, a closed exchange to stop the selling, forced conversion of exporters' earnings to create rouble demand by decree. Expect the rouble to recover on the back of this. When it does, it will not mean the sanctions failed — a currency propped up by capital controls and collapsing imports is measuring the controls.

For the rest of us, the energy question matters more. The 1973 embargo is the obvious precedent, and it is instructive in a specific way: the volume actually withdrawn in 1973 was small, but the price move was enormous, because what the market repriced was the assumption that supply was guaranteed. The same thing is happening now to European gas.

But note the asymmetry inside this week's numbers. Brent spiked 45% and is already retreating, because oil moves by ship and Russian barrels can find buyers in Asia at a discount. Gas moves through fixed pipes and cannot. Whatever happens to the oil price over the next month, the European gas market is the one where this shock will still be visible a year from now.

And there is a longer-dated consequence that no price shows yet. Every reserve manager on earth has just watched a G20 central bank's savings become unspendable by the decision of the countries holding them. That is not a fact about Russia. It is a fact about what reserves are.`,
    whatToWatch: `Dutch TTF gas rather than Brent. Oil found alternative buyers within weeks in every comparable episode; pipeline gas has no such flexibility, and Europe's storage will be tested next winter, not this one.`,
    precedents: ["arab-oil-embargo-1973", "covid-19-market-shock-2020"],
  },
  {
    issueNumber: 4,
    publishDate: day("2022-08-26"),
    title: "The most expensive gas in history",
    teaser:
      "Fifteen times the normal price, and it took six months rather than six days. The slow shocks are the ones that change things.",
    currentEventSummary: `Dutch TTF gas — the European benchmark — reached roughly €340 per megawatt hour today, around fifteen times its pre-crisis norm of about €20. Nord Stream flows have been cut to 20% of capacity since July, with a further shutdown announced for the end of this month.

Brent, by contrast, is trading around $100, below where it stood in the week of the invasion.`,
    essayBody: `Six months ago the oil price was on every front page and gas was a specialist concern. That has inverted, and the inversion is the lesson.

Oil is fungible and travels by sea. When Europe stopped buying Russian crude, Russian crude went to India and China at a discount and someone else's barrels came to Europe. The global balance barely changed, so the price came back down. The March spike to \$139 priced a disruption that never fully materialised.

Gas is different in a way that has nothing to do with geopolitics and everything to do with plumbing. It arrives through pipes that were built to go one place. Building the alternative — liquefaction terminals, tankers, regasification capacity — takes years and billions, not weeks. So when the pipeline volume falls, there is no re-routing available, and the only thing that can balance the market is demand giving up. That is what €340 is: the price at which enough European industry stops running.

This is the difference between a shock that is expensive and a shock that is structural, and it is the single most useful distinction in the archive. The 1973 embargo is filed as a five-month event, but the five months are not what mattered. What mattered was that the price never returned, and that consumer countries spent the following decade building strategic reserves, fuel-economy rules, North Sea fields and nuclear plants specifically so it could not happen again.

Europe is currently compressing that decade into about eighteen months. LNG terminals that would normally take four years are being commissioned in one. Storage is being filled ahead of schedule at almost any price. Energy-intensive industry — fertiliser, aluminium, glass — is shutting down, and some of it will not restart here.

Which means the honest way to read this number is not as a crisis price. It is as the cost of rebuilding an energy system on a deadline, being paid in a single winter.`,
    whatToWatch: `Whether the industrial demand that has shut down this year comes back when prices normalise. In 1974 some of it never did — the energy intensity of European manufacturing fell permanently after the oil shock, and that adjustment is what eventually broke OPEC's pricing power. The same mechanism is running now.`,
    precedents: [
      "russia-ukraine-invasion-swift-sanctions-2022",
      "arab-oil-embargo-1973",
    ],
  },
];

/* -------------------------------------------------------------------------
   Seeding
------------------------------------------------------------------------- */

async function reset() {
  // Ordered so foreign keys never block a delete. Implicit many-to-many join
  // tables are cleared automatically when their owning rows go.
  await prisma.relatedEvent.deleteMany();
  await prisma.marketImpact.deleteMany();
  await prisma.source.deleteMany();
  await prisma.newsletterIssue.deleteMany();
  await prisma.databaseEntry.deleteMany();
  await prisma.glossaryTerm.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.region.deleteMany();
  await prisma.era.deleteMany();
}

async function main() {
  await reset();

  await prisma.eventType.createMany({ data: EVENT_TYPES });
  await prisma.region.createMany({ data: REGIONS });
  await prisma.era.createMany({ data: ERAS });
  await prisma.glossaryTerm.createMany({ data: GLOSSARY });

  for (const entry of ENTRIES) {
    await prisma.databaseEntry.create({
      data: {
        title: entry.title,
        slug: entry.slug,
        startDate: entry.startDate,
        endDate: entry.endDate,
        dateDisplay: entry.dateDisplay,
        summary: entry.summary,
        deepDive: entry.deepDive,
        persistence: entry.persistence,
        soWhat: entry.soWhat,
        featured: entry.featured,
        // Phase 1 only: real verification lands with the admin dashboard.
        verificationStatus: VerificationStatus.verified,
        eventTypes: { connect: entry.eventTypes.map((slug) => ({ slug })) },
        regions: { connect: entry.regions.map((slug) => ({ slug })) },
        eras: { connect: entry.eras.map((slug) => ({ slug })) },
        glossaryTerms: {
          connect: entry.glossaryTerms.map((slug) => ({ slug })),
        },
        marketImpacts: {
          create: entry.marketImpacts.map((impact, index) => ({
            ...impact,
            sortOrder: index,
          })),
        },
        sources: {
          create: entry.sources.map((source, index) => ({
            ...source,
            sortOrder: index,
          })),
        },
      },
    });
  }

  const entryIdBySlug = new Map(
    (await prisma.databaseEntry.findMany({ select: { id: true, slug: true } })).map(
      (entry) => [entry.slug, entry.id],
    ),
  );

  let relationIndex = 0;
  for (const relation of RELATIONS) {
    const entryId = entryIdBySlug.get(relation.from);
    const relatedEntryId = entryIdBySlug.get(relation.to);

    if (!entryId || !relatedEntryId) {
      throw new Error(
        `Related event references an unknown entry: ${relation.from} → ${relation.to}`,
      );
    }

    await prisma.relatedEvent.create({
      data: {
        entryId,
        relatedEntryId,
        note: relation.note,
        sortOrder: relationIndex++,
      },
    });
  }

  for (const issue of ISSUES) {
    await prisma.newsletterIssue.create({
      data: {
        issueNumber: issue.issueNumber,
        publishDate: issue.publishDate,
        title: issue.title,
        teaser: issue.teaser,
        currentEventSummary: issue.currentEventSummary,
        essayBody: issue.essayBody,
        whatToWatch: issue.whatToWatch,
        precedents: { connect: issue.precedents.map((slug) => ({ slug })) },
      },
    });
  }

  const counts = {
    entries: await prisma.databaseEntry.count(),
    marketImpacts: await prisma.marketImpact.count(),
    sources: await prisma.source.count(),
    relatedEvents: await prisma.relatedEvent.count(),
    glossaryTerms: await prisma.glossaryTerm.count(),
    issues: await prisma.newsletterIssue.count(),
  };

  // Naming the target makes seeding the wrong database a visible mistake
  // rather than a silent one — it is the same command locally and against a
  // hosted database, and only the environment distinguishes them.
  console.log(`Seeded The Archive at ${describeTarget(connectionString)}:`, counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
