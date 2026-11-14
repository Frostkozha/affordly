# Affordly - Sources and unit economics (Business Cup 2.0, Money track)

Research date: 2026-11-14. Every number below was read from the original page or file unless marked UNVERIFIED. "Opened" means the original publisher's page or file was fetched in this session. Nothing here is invented; where I could not open the original I say what I saw instead.

Status key: VERIFIED = original opened. UNVERIFIED = original not opened or not found (reason given).

---

## 1. USDA Official Food Plans, Cost of Food (October 2026) - VERIFIED

- Source: "Cost of Food Monthly Reports" page (Thrifty Food Plan: October 2026; Cost of Food at Home at Three Levels: U.S. Average, October 2026), USDA Food and Nutrition Service, CNPP. Page updated November 13, 2026.
- URL: https://www.fns.usda.gov/research/cnpp/usda-food-plans/cost-food-monthly-reports (linked PDFs: /sites/default/files/resource-files/CostofFoodOct2026Thrifty.pdf and CostofFoodOct2026LowModLib.pdf; I read the page tables, not the PDFs).
- Note: the USDA age band is 20-50 years (not 19-50). Costs are for individuals in 4-person households; footnote 2: "1-person - add 20%; 2-person - add 10%". Costs rounded to nearest 10 cents; monthly = weekly x 4.333.

| Plan | Female 20-50 weekly | Male 20-50 weekly |
|---|---|---|
| Thrifty | $58.70 | $73.70 |
| Low-Cost | $63.90 | $73.50 |
| Moderate-Cost | $77.80 | $92.10 |
| Liberal | $99.30 | $112.30 |

- Thrifty reference family of 4 (male and female 20-50 and children 6-8, 9-11): $236.50 per week, $1,024.60 per month.
- Single adult after the +20% footnote (my arithmetic, label as such): Thrifty female 58.70 x 1.2 = $70.44; Thrifty male 73.70 x 1.2 = $88.44 per week.
- Caution: the Low, Moderate, Liberal plans use a 2001-02 market basket updated by CPI (page footnote 9). Only the Thrifty plan was re-evaluated in 2021.

## 2. US grocery spending, stress, population

| Item | Value | Source | Status |
|---|---|---|---|
| Household food at home, 2024 | $6,224 per consumer unit per year (about $120 per week; my division); food away from home $3,945 | "Household spending on food at home in 2024 averaged $6,224, compared with $3,945 for food away from home." BLS, The Economics Daily, "The new year and household spending" (table "Average annual consumer expenditures (in dollars), selected categories, 2010-2024"), Jan 5, 2026. https://www.bls.gov/opub/ted/2026/the-new-year-and-household-spending.htm | VERIFIED |
| Share saying grocery cost is a "major" source of stress | Article text: "About half of all Americans say the cost of groceries is a 'major' source of stress in their life right now." Poll July 10-14, 2025, 1,437 US adults, NORC AmeriSpeak, margin +/-3.6 points | Cora Lewis and Linley Sanders, "The vast majority of US adults are stressed about grocery costs, an AP-NORC poll finds", Associated Press via PBS NewsHour, Aug 4, 2025. https://www.pbs.org/newshour/politics/vast-majority-of-us-adults-are-stressed-about-grocery-costs-ap-norc-poll-finds | VERIFIED (wording "about half") |
| Exact figure 53% major, 33% minor, 14% not a source | Seen only in search-result summaries of the same AP-NORC poll; the PBS page I opened gave only "about half". Do not put 53% on a slide as verified until read on apnorc.org | secondary summaries | UNVERIFIED |
| US adults aged 25-44 | Not retrieved. Census Bureau domains (census.gov, www2.census.gov, api.census.gov) returned 403 to every request. Use Census file NC-EST2024-AGESEX-RES (Vintage 2024), sum ages 25-44, and cite it once opened | - | UNVERIFIED |

## 3. Food waste and package size

| Item | Value | Source | Status |
|---|---|---|---|
| Cost of wasted food per person | "$728 - Average annual food waste cost per person"; "$2,913 - Average annual food waste cost for a family of four" (attributed on the page to EPA's 2025 report on what food waste costs consumers; I did not open that report) | EPA, "Feed It Onward", last updated June 12, 2026. https://www.epa.gov/node/297373 | VERIFIED on EPA page; underlying report not opened |
| Family of four | "The average family of four spends almost $3,000 per year on food that goes uneaten." | EPA, "Preventing Wasted Food at Home", updated Nov 10, 2026. https://www.epa.gov/recycle/preventing-wasted-food-home | VERIFIED |
| Federal baseline (older) | Retail plus consumer level in 2010: "roughly 1.2 pounds of food per person per day", "retail value of over $1.40". Not split by level; 2010 data | USDA ERS, "Food Loss", updated 1/5/2025. https://ers.usda.gov/data-products/food-availability-per-capita-data-system/food-loss | VERIFIED |
| ReFED / YouGov 2026 | PDF exceeded the 10 MB fetch limit; not read | https://refed.org/uploads/2026-refed-yougov-survey-report-final.pdf | UNVERIFIED |

### van Rooijen et al. - exists, and here is what it claims (VERIFIED, full PDF read)
- M.A. van Rooijen, J.C. Gerdessen, G.D.H. Claassen, S.L.J.M. de Leeuw (Operations Research and Logistics Group, Wageningen University), "Optimizing household food waste: The impact of meal planning, package sizes, and performance indicators", Resources, Conservation & Recycling 205 (2024) 107559; received 21 Nov 2023, available online 18 Mar 2024; open access CC BY 4.0. PDF: https://edepot.wur.nl/653807 (DOI 10.1016/j.resconrec.2024.107559).
- Abstract quote: "A key reason for the occurrence of household food waste is poor meal planning, which is partly due to inappropriate discrete package sizes at supply level and lack of accounting for unused food at consumer level." The model "generates healthy, affordable meal plans with no waste."
- What it actually is: a mixed-integer optimization model (Netherlands case, package data from a large Dutch retailer). Result: the minimum-waste plan reuses a partly used package in a later recipe on another day.
- What it does NOT show: it is a modelling study, not a measurement of real households, and it gives no percent or dollar waste reduction I could quote. It states consumers "mention large package sizes as among the main reported" causes, citing other work.
- Detail that matters for Affordly: in the paper's cost objective, perishable ingredients are charged by whole packages, but for shelf-stable ingredients only used grams are counted ("the cost of 3 grams is considered rather than the price for the entire bottle"). If Affordly prices every item by whole package, say that is stricter than this paper, not the same.
- Safe slide wording: "Peer-reviewed optimization research (Wageningen, 2024) finds that meal plans built around real retail package sizes can reach no modelled waste."

## 4. Subscription benchmarks (app benchmarks; Affordly is web, treat as proxies)

RevenueCat, "State of Subscription Apps 2026" (data through Feb 2026; page shows no explicit date; images dated March 2026). https://www.revenuecat.com/state-of-subscription-apps/ - VERIFIED, page opened.

| Metric | Value | Quote or reference |
|---|---|---|
| Freemium download-to-paid, day 35 | 2.1% median (top quartile above 4.5%) | "Freemium median: 2.1% (top quartile above 4.5%)." Hard paywall 10.7%. |
| Retention, monthly plans, 12 months | Non-AI apps 9.5%; AI apps 6.1% | "Monthly: AI 6.1% vs. non-AI 9.5%." Another line: "Monthly retention clusters around 7-9%". Page also states monthly 6-14% across categories. |
| Retention, yearly plans, 12 months (= first renewal) | Non-AI 30.7%; AI 21.1%. Category range 20-40% | "Annual: AI 21.1% vs. non-AI 30.7%." "Yearly plans achieve significantly higher Y1 retention: median 20-40% (yearly) vs. 1-2% (weekly) and 6-14% (monthly)." |
| Annual renewals | 1st renewal 24-47%, 2nd 52-70%, 3rd 60-79% | "Annual plans start lower but build loyalty: 1st renewal 24-47%, climbing to 52-70% (2nd) and 60-79% (3rd)." |
| Freemium vs hard paywall retention | Nearly identical after a year | "Access method is not a retention differentiator, 1% gap is noise." |
| North America download-to-paid 2.6% | Seen in a search summary only; not located on the page text I read | UNVERIFIED |

Definition on page: retention is the share of paid subscriptions still active; a monthly plan counts as retained at 12 months after 12 monthly renewals.

Adapty, "State of In-App Subscriptions 2026" (page shows "(c) 2026 Adapty Tech Inc.", no date). https://adapty.io/state-of-in-app-subscriptions/ - page opened.
- First renewal rate of annual plans: UNVERIFIED. I did not find an annual first-renewal number in the text I could read (the full charts are behind the report form). What I did see, FAQ text: "At Day 380, annual trial subscribers retain at 19.9%, monthly at 14.2%, and weekly at 5.5%." Also "Utilities leads with 58.1% first-renewal retention while Health & Fitness is last at 30.3%" (all plans, by category). A search summary quoted a funnel of 1st renewal 45.1%, but I could not find 45.1% on the page, so it is not used.
- Use RevenueCat's annual numbers above; Adapty's 19.9% is a trial-only cohort figure and is lower than RevenueCat's median.

## 5. Market size and comparable products

| Item | Value | Source | Status |
|---|---|---|---|
| US meal planning app market | USD 565.74 million in 2025, CAGR 10.46% (2026-2035), about USD 1.53 billion by 2035 | SNS Insider, "Meal Planning App Market" report page, "Last Updated: October 29, 2026". https://www.snsinsider.com/reports/meal-planning-app-market-11549 | VERIFIED that the page says this. Single paid-research vendor; treat as an estimate. I did not see its method. |
| US meal kit delivery | IBISWorld: revenue $9.1 billion in 2025 (+2.8%), $8.7 billion 2024. Statista: $6.14 billion 2025. Mordor: USD 13.55 billion 2025. | IBISWorld page returned empty to my fetch; figures from a search summary | UNVERIFIED. Vendors differ by 2x; scope differs |
| Instacart | Q3 2026 (quarter ended Sep 30, 2026): GTV $10,528 million (+15%), 91.4 million orders (+10%), total revenue $1,095 million (+17%) | Maplebear Inc. (Instacart), "Instacart Announces Third Quarter 2026 Financial Results", PR Newswire, Oct 29, 2026 (read via Finviz copy). The release gives no Instacart+ member count. Instacart also agreed to be acquired by DoorDash at about $17 billion (from search summaries) | VERIFIED for the three figures; deal value UNVERIFIED |
| Mealime | Own site: "Join over 4,500,000 others for free today." and "Mealime will shut down on October 21, 2026." Closing page, titled "Mealime is moving to Meals Hub": "Mealime will be discontinued as of October 21, 2026." Successor Meals Hub is in Albertsons grocery apps. | https://www.mealime.com/ and https://www.mealime.com/closing | VERIFIED. Revenue not stated |
| Yummly | Reported closed December 2024 by Whirlpool | Wikipedia and blog summaries, no original opened | UNVERIFIED |
| Eat This Much, PlateJoy revenue or user counts | Not found in any public filing or company page | - | UNVERIFIED |
| US adults who use meal planning apps | No reputable figure found | - | UNVERIFIED |

What the Mealime and Yummly facts do and do not show: a 4.5M-user free planner shut down and a large brand closed. That shows demand for planning exists but also that planning alone has been hard to monetise. Do not present it as proof of either. Affordly's pitch should rest on the narrower budget-plus-receipt problem.

## 6. Competitors (from their own sites; "not stated" = not on the page I opened)

| Product | Price (own site) | Prices by whole packages | Says a budget is impossible | Carries leftovers to next week | Real store prices | Source |
|---|---|---|---|---|---|---|
| Eat This Much | Free; Premium $5.00/month ("annual subscription"); free trial; Professional varies | Not stated | Not stated | Premium lists "automatic leftovers" (the page does not say across weeks) | Not stated; grocery delivery integration with Instacart, Amazon Fresh, Walmart | https://www.eatthismuch.com/pricing/ |
| Mealime | Free; shutting down Oct 21, 2026 | Not stated | Not stated | Not stated | Not stated | https://www.mealime.com/ , /pricing , /closing |
| Cestio | $4.99/week or $39.99/year; 3-day trial | Not stated ("aisle-sorted shopping list ... with a running cost estimate", "estimated total") | Not stated | Not stated for plans; separate feature cooks "from what you already own" | Says plans are built around your budget and supermarket (Walmart, Costco, Aldi, Kroger and others); sample plan "from $29.64 in groceries (prices from Walmart)"; calls totals "estimated" | https://cestio.app/ |
| Mealzo | Free; no paid plan seen | Not stated | Not stated | Not stated; has "Scan my fridge first" | Title says "Real Grocery Prices"; the form says "Price estimates adjust based on your region and store. Actual prices vary" | https://mealzo.app/ |
| Cheap Gains | Free; Premium monthly/yearly toggle shown, price not in the text I read | Not stated | Not stated | Not stated | FAQ: "Most stores show estimated national averages, adjusted per store"; footer: "Store prices are rough averages, not live store prices"; Kroger only has a path to live pricing | https://cheap-gains-frontend.onrender.com/ |
| Budget Bytes | Site returned 403 to my requests | - | - | - | - | UNVERIFIED, not opened |
| Budget Bites, Plate Planner, Kitchen Crew, MealPlannerAI (App Store budget planners) | Seen only in search summaries of App Store listings, for example "sets a weekly grocery budget" | - | - | - | - | UNVERIFIED, listings not opened |

Honest gap statement: none of the opened competitor pages states whole-package pricing, a "budget not feasible" message, or week-to-week leftover carry-over. That is "not stated on their site", not proof they lack it. Cestio and Mealzo already sell "budget plus real prices", so the claim to defend is the package-level Checkout Gap, not "budget planning" in general.

## 7. Ad cost benchmark (for CAC) - VERIFIED

WordStream (LocaliQ), "Facebook Ads Benchmarks 2025: Data, Trends, & Insights for Your Industry", page shows "Last Updated: September 14, 2026", analysis of "over 1,000 campaigns". https://www.wordstream.com/blog/facebook-ads-benchmarks-2025
- Traffic campaigns, average CPC across all industries: $0.70 ("The average cost per click in Facebook ads for traffic campaigns across all industries is $0.70", down from $0.77).
- Restaurants & Food: $0.72. Finance & Insurance: $1.22 ("Industries with the highest CPCs included Finance and Insurance ($1.22)"). Finance & Insurance CTR 0.98%.
- Lead campaigns: Restaurants & Food $0.74 (lowest-CPC industry in that table).
- Not found: a US-only, TikTok, or "consumer finance app" CPC from an original source. Meta traffic-objective CPC is also not the cost of an install or purchase. Use $0.72 (food) and $1.22 (finance) as a low and a high case.

---

## Unit economics (every assumption labelled)

Inputs from verified numbers: RevenueCat monthly 12-month retention 6.1% (AI) to 9.5% (non-AI); yearly 1st renewal 30.7% (median), with ranges 24-47%, 2nd 52-70%, 3rd 60-79%; download-to-paid 2.1%; WordStream CPC $0.72 and $1.22.

Assumptions (mine, not sourced):
- A1: Constant monthly churn c reproduces the 12-month retention: c = 1 - r12^(1/12); expected paid months = 1/c. Real curves are front-loaded (RevenueCat: first renewal is the big drop), so this understates the long tail but overstates early months.
- A2: Annual LTV = 59.99 x (1 + r1 + r1 r2 + r1 r2 r3), a 4-year cap. Base: r1 = 30.7%, r2 = 52%, r3 = 60% (the low ends of RevenueCat's 2nd/3rd ranges).
- A3: Net margin 85% after Stripe fees (about 3%) and AI/infra cost. Placeholder; replace with Affordly's real cost.
- A4: Click-to-paid conversion = 2.1% (RevenueCat download-to-paid, app benchmark). This treats every click as a download, so it understates CAC. Web funnels are not measured here. Sensitivity at 1% and 2.6% (2.6% UNVERIFIED) shown.
- A5: CAC = CPC / click-to-paid. Paid acquisition only; no organic, referral, or churn-reactivation.

Lifetime:

| Plan | Retention input | Expected paid periods | Gross LTV | Net LTV (85%) |
|---|---|---|---|---|
| Monthly $7.99, r12 = 9.5% | c = 17.8% | 5.61 months | $44.84 | $38.11 |
| Monthly $7.99, r12 = 6.1% | c = 20.8% | 4.81 months | $38.40 | $32.64 |
| Annual $59.99 (A2 base) | 1 + 0.307 + 0.160 + 0.096 | 1.56 payments | $93.7 | $79.6 |

(Annual with RevenueCat range ends: low 24/52/60 gives $89.06 gross, high 47/70/79 gives $135.83 gross.)

CAC and LTV:CAC (net LTV, base cases):

| CPC | Click-to-paid | CAC = CPC / conv | Monthly LTV:CAC (9.5%) | Annual LTV:CAC |
|---|---|---|---|---|
| $0.72 (food) | 2.1% | $34.29 | 1.11 | 2.32 |
| $1.22 (finance) | 2.1% | $58.10 | 0.66 | 1.37 |
| $0.72 | 1.0% | $72.00 | 0.53 | 1.11 |
| $1.22 | 1.0% | $122.00 | 0.31 | 0.65 |
| $0.72 | 2.6% (UNVERIFIED) | $27.69 | 1.38 | 2.87 |

Arithmetic example: annual, CPC $0.72, 2.1%: CAC = 0.72 / 0.021 = $34.29; net LTV = 93.7 x 0.85 = $79.6; ratio = 79.6 / 34.29 = 2.32.

Plain reading:
- On benchmark inputs, paid acquisition alone does NOT clear LTV > 3x CAC. The best verified-input case is annual at about 2.3x; the monthly plan is about 1.1x or worse.
- LTV > CAC holds only for the annual plan at the food CPC with 2.1% conversion. It fails for monthly and for the finance-CPC case.
- To reach 3x on annual at net LTV $79.6, CAC must be at most $26.5, which needs about 2.7% click-to-paid at $0.72 CPC. That is above the 2.1% benchmark and untested for web.
- So the pitch must lean on the annual plan, organic and referral acquisition, and a measured web conversion rate. Say that the number is untested until a landing-page test exists. Do not claim 3x.
- Benchmarks are mobile-app data (RevenueCat covers in-app subscriptions); Affordly is web. Web has no app store fee but loses store discovery and one-tap purchase.

## Subscribers needed for $100M ARR (arithmetic only)

- All annual at $59.99: 100,000,000 / 59.99 = 1,666,944 active subscribers.
- All monthly at $7.99 (x12 = $95.88/year): 100,000,000 / 95.88 = 1,042,970 active subscribers.
- 50/50 mix (average $77.94/year): 1,283,121 active subscribers.
- Those are active paid subscribers at one moment, before any churn replacement. At 9.5% 12-month monthly retention, holding 1.0 million monthly subscribers means replacing most of them every year.
- Scale check: 1.3 to 1.7 million subscribers is 1.3 to 1.7 times the 4.5 million users Mealime claimed on its own site before it closed. The US 25-44 adult count is UNVERIFIED (Census blocked), so a share-of-population figure is not given here.
- The SNS Insider estimate of the whole US meal planning app market is $565.74 million in 2025. $100M ARR would be about 18% of that figure. If that estimate is right, $100M ARR requires growing the category or taking budget-and-grocery spend, not just meal-planning-app spend. Treat this comparison as indicative because the estimate is from one vendor.
