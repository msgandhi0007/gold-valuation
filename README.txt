GOLD VALUATION MOBILE APP
==========================
This is a mobile-first Progressive Web App created from Gold Valuation.xlsx.

Excel logic reproduced:
- Net weight = Gross weight - Stone weight
- Pure gold weight = Net weight × Purity / 100
- Rounded net weight = ROUNDDOWN(Pure gold weight, 1)
- Market value = Rounded net weight × Market Rate / gram
- LTV 65% = Total Market Value × 65%
- LTV 70% = Total Market Value × 70%

Mobile use:
1. Upload these files to a static hosting service (for example GitHub Pages, Netlify, or similar).
2. Open the hosted index.html on Android Chrome.
3. Use Chrome menu → Add to Home screen / Install app.

No server/database is required; Save stores the current valuation locally on the phone.


Update: After calculation, the app now displays every item in a horizontal valuation table and a TOTAL row containing Gross Weight, Stone Weight, Net Weight, weighted-average Purity, Pure Gold Weight, Rounded Weight, and Market Value, plus LTV 65% and 70%.

Customer details added: Name, Mobile Number, Customer ID, Valuation Date, and Address. Customer details are saved with the valuation and included in sharing.

Customer details simplified to: Customer Name, Mobile Number, and Valuation Date only.
