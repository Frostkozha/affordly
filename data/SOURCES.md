# Data sources

## Recipes and photos

All 25 recipes are adapted from USDA MyPlate Kitchen (https://www.myplate.gov/myplate-kitchen/recipes), a US government work in the public domain. Ingredients were rewritten to use catalog products only; steps are in our own words; nutrition (`perServing`) is computed from catalog `per100g` values, not copied from the site.

Verification note: on 14 Nov 2026 myplate.gov did not resolve in DNS from the build machine (authoritative nameservers unreachable, also via public DoH resolvers). Recipe pages and photos were therefore read from Internet Archive snapshots of the same myplate.gov pages (taken 2025-12-23 to 2025-12-31). The URLs below are the live myplate.gov addresses of those pages; photos were saved from the archived copy of the myplate-prod.azureedge.us file listed. `cookMinutes` are our own estimates from the steps (MyPlate lists times for only some recipes). Photos resized to 800 px max width, JPEG under 200 KB.

| Recipe id | MyPlate URL | Photo URL | What I changed |
|---|---|---|---|
| breakfast-burrito-salsa | https://www.myplate.gov/recipes/breakfast-burrito-salsa | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2025-06/Image-of-Breakfast-Burrito-Salsa-recipe.png | Scaled to 2 servings; corn, tomato and mustard dropped; 1 tortilla per half. |
| broccoli-omelet | https://www.myplate.gov/recipes/broccoli-omelet | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2021-01/Broccoli%20Omelet_EggsVegetablesProteinBreakfastMelonsMushroom.png | Scaled to 2 servings; whole eggs instead of egg whites; cottage cheese replaces ricotta and Parmesan; mushrooms dropped. |
| overnight-oatmeal-berries | https://www.myplate.gov/recipes/overnight-oatmeal-berries | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/recipe-images/OvernightOatmealwBerries.jpg | Frozen blueberries instead of raspberries; cinnamon and vanilla dropped. |
| breakfast-potato-egg-burritos | https://www.myplate.gov/recipes/breakfast-potato-egg-burritos | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2020-11/SpeedyBurritos_527x323.jpg | Scaled from 9 to 4 servings; flour tortillas only. |
| yogurt-berry-parfait | https://www.myplate.gov/recipes/yogurt-berry-parfait | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2023-05/Yogurt%20Parfait.jpg | Scaled to 2 servings; plain nonfat Greek yogurt; raw oats instead of granola; one fruit mix. |
| baked-eggs-cheese | https://www.myplate.gov/recipes/baked-eggs-cheese | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2020-11/SuretoPleaseBakedEggandCheese.jpg | Scaled to 3 servings; reduced-fat cheddar; toast added; garlic powder and oregano are optional. |
| tuna-quesadillas | https://www.myplate.gov/recipes/tuna-quesadillas | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2024-10/image-of-tuna-quesadillas-recipe.jpg | Scaled to 2 servings; Greek yogurt replaces mayonnaise. |
| black-bean-quesadillas | https://www.myplate.gov/recipes/black-bean-quesadillas | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2021-01/Black%20Bean%20Quesadilla.JPG | Scaled to 4 servings; cilantro dropped. |
| chicken-salad | https://www.myplate.gov/recipes/chicken-salad | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/recipe-images/AnyDaysaPicnicChickenSalad.jpg | Raw chicken breast poached first; Greek yogurt replaces mayonnaise and relish; apple and bread added. |
| black-bean-and-rice-salad | https://www.myplate.gov/recipes/black-bean-and-rice-salad | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2021-07/BlackBeanRiceSalad.jpg | Cooked brown rice replaced by dry white rice; vinegar and mustard dropped. |
| turkey-tostadas | https://www.myplate.gov/recipes/turkey-tostadas | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/recipe-images/Turkey%20Tostadas.jpg | Ground turkey instead of cooked turkey; flour tortillas; black beans for refried; salsa for taco sauce. |
| tuna-pasta | https://www.myplate.gov/recipes/tuna-pasta | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2024-10/image-of-tuna-pasta-recipe.jpg | Scaled to 2 servings; canned tomatoes replace jarred sauce; more tuna. |
| black-bean-burrito | https://www.myplate.gov/recipes/black-bean-burrito | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2023-04/beanburrito.png | Scaled to 2 servings; flour tortillas; cheese added; canned tomatoes. |
| tuna-salad-greens | https://www.myplate.gov/recipes/tuna-salad-greens | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2024-10/image-of-tuna-salad-on-greens-recipe.jpg | Scaled to 2 servings; Greek yogurt replaces mayonnaise; bread replaces crackers; vinegar dropped. |
| brown-rice-sizzling-chicken-and-vegetables | https://www.myplate.gov/recipes/brown-rice-sizzling-chicken-and-vegetables | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2021-01/MeetingYourMyPlateGoalsOnABudget_0_Page_26_0.jpg | White rice instead of brown; cornstarch dropped. |
| chicken-stir-fry | https://www.myplate.gov/recipes/chicken-stir-fry | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/recipe-images/Chicken%20Stir%20Fry.png | Raw chicken instead of cooked; scaled to 4 servings; ginger and sugar dropped. |
| braised-chicken-thighs-spinach | https://www.myplate.gov/recipes/braised-chicken-thighs-spinach | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2021-01/Braised%20Chicken%20Thighs%20with%20Spinach%201_0.jpg | Fresh spinach; rice side added; herbs dropped. |
| turkey-meatloaf | https://www.myplate.gov/recipes/turkey-meatloaf | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2024-10/image-of-turkey-meatloaf-recipe.jpg | Canned tomato replaces ketchup; sweet potatoes added as a side; 93% lean turkey. |
| easy-beef-supper | https://www.myplate.gov/recipes/easy-beef-supper | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/recipe-images/Easy%20Beef%20Supper_fixed.png | Scaled to 4 servings; black beans replace kidney beans; water replaces tomato juice. |
| tofu-broccoli | https://www.myplate.gov/recipes/tofu-broccoli | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/recipe-images/TofuBroccoli.jpg | Double tofu; rice added; scallions and herbs dropped. |
| cuban-beans-and-rice | https://www.myplate.gov/recipes/cuban-beans-and-rice | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2025-07/Image-of-Cuban-Beans-Rice-Recipe.png | White rice; water replaces broth; vinegar and oregano optional. |
| mac-and-beans-medley | https://www.myplate.gov/recipes/mac-and-beans-medley | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2022-07/MacAndBeansMedley_527x323.jpg | Black beans; red pepper flakes optional. |
| vegetable-and-turkey-stir-fry | https://www.myplate.gov/recipes/vegetable-and-turkey-stir-fry | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2020-10/Vegetables%20and%20Turkey%20Stir-Fry.jpg | Ground turkey instead of cooked turkey; rice added; gravy dropped; scaled to 3 servings. |
| beef-noodles | https://www.myplate.gov/recipes/beef-noodles | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2025-01/Image-of-Beef-and-Noodles-Recipe.jpg | Pasta instead of egg noodles; vegetables added; seasoning mix replaced by salt and pepper. |
| chickpeas-and-spinach-saute | https://www.myplate.gov/recipes/chickpeas-and-spinach-saute | https://myplate-prod.azureedge.us/sites/default/files/styles/recipe/public/2021-01/Chickpeas%20and%20Spinach%20Sautee_QuinoaMealProteinVegetables.png | Fresh spinach; rice for quinoa; lemon juice and pepper flakes optional. |

## Catalog nutrition

`per100g` values come from USDA FoodData Central, SR Legacy dataset (https://fdc.nal.usda.gov/, download FoodData_Central_sr_legacy_food_csv_2018-04), values per 100 g of edible portion. Canned beans use the whole can (solids and liquids) so a can = 425 g; canned tuna uses drained solids (5 oz can = 112 g drained). Rice, pasta and oats are dry weights.

Prices are estimates (priceSource `demo`, store 'Estimated US prices', priced 2026-11-14), not looked up; real Kroger prices are merged later via `kroger.description`.

| Product id | FDC id | FDC description |
|---|---|---|
| chicken-breast | 171077 | Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw |
| chicken-thighs | 173627 | Chicken, broilers or fryers, dark meat, thigh, meat only, raw |
| ground-turkey | 172850 | Turkey, ground, 93% lean, 7% fat, raw |
| ground-beef | 171796 | Beef, ground, 85% lean meat / 15% fat, raw (Includes foods for USDA's Food Distr |
| eggs | 171287 | Egg, whole, raw, fresh |
| canned-tuna | 173709 | Fish, tuna, light, canned in water, drained solids (Includes foods for USDA's Fo |
| tofu | 172448 | Tofu, firm, prepared with calcium sulfate and magnesium chloride (nigari) |
| black-beans | 175188 | Beans, black turtle, mature seeds, canned |
| chickpeas | 175206 | Chickpeas (garbanzo beans, bengal gram), mature seeds, canned, solids and liquid |
| lentils | 172420 | Lentils, raw |
| milk | 170872 | Milk, lowfat, fluid, 1% milkfat, with added vitamin A and vitamin D |
| greek-yogurt | 170894 | Yogurt, Greek, plain, nonfat (Includes foods for USDA's Food Distribution Progra |
| cheddar | 171292 | Cheese, cheddar, reduced fat (Includes foods for USDA's Food Distribution Progra |
| cottage-cheese | 173417 | Cheese, cottage, lowfat, 1% milkfat |
| rice | 168877 | Rice, white, long-grain, regular, raw, enriched |
| oats | 173904 | Cereals, oats, regular and quick, not fortified, dry |
| pasta | 169736 | Pasta, dry, enriched |
| bread | 172688 | Bread, whole-wheat, commercially prepared |
| tortillas | 167535 | Tortillas, ready-to-bake or -fry, flour, shelf stable |
| bananas | 173944 | Bananas, raw |
| apples | 171688 | Apples, raw, with skin (Includes foods for USDA's Food Distribution Program) |
| spinach | 168462 | Spinach, raw |
| broccoli | 170379 | Broccoli, raw |
| bell-peppers | 170108 | Peppers, sweet, red, raw |
| onions | 170000 | Onions, raw |
| carrots | 170393 | Carrots, raw |
| potatoes | 170027 | Potatoes, russet, flesh and skin, raw (Includes foods for USDA's Food Distributi |
| sweet-potatoes | 168482 | Sweet potato, raw, unprepared (Includes foods for USDA's Food Distribution Progr |
| garlic | 169230 | Garlic, raw |
| celery | 169988 | Celery, raw |
| romaine | 169247 | Lettuce, cos or romaine, raw |
| tomatoes-canned | 170138 | Tomatoes, red, ripe, canned, packed in tomato juice, no salt added |
| peanut-butter | 174294 | Peanut Butter, smooth (Includes foods for USDA's Food Distribution Program) |
| olive-oil | 171413 | Oil, olive, salad or cooking |
| salsa | 174524 | Sauce, salsa, ready-to-serve |
| soy-sauce | 174277 | Soy sauce made from soy and wheat (shoyu) |
| honey | 169640 | Honey |
| frozen-mixed-vegetables | 170471 | Vegetables, mixed, frozen, unprepared |
| frozen-berries | 173950 | Blueberries, frozen, unsweetened (Includes foods for USDA's Food Distribution Pr |

## Kroger prices

- Store: Kroger On the Rhine, Cincinnati, OH (locationId 01400513, zip 45202).
- Date: 2026-11-14. API environment: Kroger Developer API, Certification environment (via the Affordly proxy).
- Matched 38 of 39 products; 1 unmatched (romaine, kept as estimated price with `priceEstimated: true`). Details in `kroger-snapshot.json`.
- Item choice: plain, raw, unflavoured; Kroger store brand or cheapest mainstream brand; regular (non-promo) price; household size near the old package size.
- Size conversion: 1 lb = 453.6 g, 1 oz = 28.35 g, 1 fl oz = 29.57 g (oil, soy sauce; approximation), 12 ct eggs = 600 g, 1/2 gal = 1893 g. Canned beans keep whole-can contents (15 oz = 425 g, 16 oz = 454 g); tuna keeps 112 g drained. Items priced per lb use 453.6 g. "N ct / X oz" is read as X oz for the whole pack when X is clearly the pack total (tortillas 17.5 oz). Items sold each use an assumed weight: bell pepper 164 g, celery bunch 450 g, garlic 3 bulbs 150 g.

## Recipes 26 to 40 (added 14 Nov 2026)

Same method as above: USDA MyPlate Kitchen pages and photos (public domain) read from Internet Archive snapshots (web.archive.org, 2025 captures) because myplate.gov does not resolve here. `source.url` is the live myplate.gov address `https://www.myplate.gov/recipes/<id>`. Photos: the recipe's own MyPlate image, resized to 600x400 JPEG (under 200 KB); for garden-frittata, sweet-potato-hash-egg, lentil-stew and lentil-chili only the archived `large` image style existed. `perServing` computed from catalog `per100g`. No new catalog products (corn tortillas were skipped: their USDA nutrition values could not be verified from this machine, so rice replaces tortillas).

| Recipe id | What I changed |
|---|---|
| huevos-rancheros-fresh-salsa | Rice and black beans replace corn tortillas; cheese dropped; whole eggs only. |
| garden-frittata | Spinach replaces kale. |
| green-onion-omelet | Fresh potatoes for canned; ham and milk dropped; whole eggs. |
| huevos-motulenos | Rice instead of tortillas; canned black beans for pinto; mixed vegetables for peas; ham dropped; whole eggs. |
| scrambled-tofu | Olive oil for butter; spinach and pepper for bean sprouts. |
| sweet-potato-hash-egg | Chicken sausage dropped, black beans added; sweet potatoes cubed small to cook in about 35 min. |
| fruity-homemade-oatmeal | Raisins dropped. |
| banana-walnut-oatmeal | Water instead of milk; honey for maple syrup; peanut butter for walnuts. |
| lentil-tacos | Served over rice instead of corn tortillas; canned tomatoes for tomato paste; raisins dropped. |
| lentil-stew | Scaled to 5 servings with the full cup of lentils; carrots fresh. |
| lentil-chili | Dry lentils instead of cooked; two cans tomatoes. |
| one-pan-potatoes-chicken | Frozen mixed vegetables replace canned corn. |
| one-pan-taco-rice | Dry rice for cooked; canned tomatoes plus salsa for tomatoes with chiles; chili seasoning mix replaced by spices. |
| jollof-rice | Scaled to 6 servings; raw chicken thighs; water replaces broth; canned tomatoes replace tomato paste. |
| taco-soup | Scaled to 5 servings; black beans for kidney; frozen vegetables for corn. |

Oats are tagged gluten (not certified gluten-free).
