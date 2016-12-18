# Cradle

**Welcome to Cradle: White Eye Detector**

[![https://gyazo.com/658a9b0965ba180e509f6b5db7b4ceec](https://i.gyazo.com/658a9b0965ba180e509f6b5db7b4ceec.png)](https://gyazo.com/658a9b0965ba180e509f6b5db7b4ceec)

**Cradle is Facebook-integrated web app built by [Chris Katzmann](http://www.github.com/cwkatzmann) and  [Tim Chew](http://www.github.com/timothyrchew) in the course of a week.**

*Our goal* was to incentiveize productivity through creating a Chrome browser extension and web application that allows users to create "Sprints," or competitions, that track friends' time spent on productive websites. 

We taught ourselves [AngularJS](https://angularjs.org/) the week prior to beginning the project, and then built Sprintr on:
* Node.js
* Express
* AngularJS
* PostgreSQL
<hr>

### Challenges we faced:

* This was **our very first application built in Angular**, and we learned a lot about the digest cycle and rendering dynamically-updated views in the process, as our Chrome extension's time-tracking functionality is working in the background at all times.

* We had lofty aspirations of connecting to players' PayPal accounts to be able to have a cash payout for winning. **We applied with [PayPal Developer](https://developer.paypal.com/) to use its Payouts API twice**, but were rejected both times on the basis our app being categorized as "online gaming." PayPal's dev support phone representatives described our business model as a "too risky a category" for PayPal to allow us use of the Payouts API. We then had to find an alternative to allow the transfer of money through our app, which we found and implemented successfully in **[Dwolla](https://developers.dwolla.com/)**.

* The **Google Chrome extension development environment** was entirely new for all three of us and took some getting used to.

* We wanted to render leaderboard Sprint data in charts, but the **ChartJS library could not be rendered directly with Angular**. We ended up having to use a **[3rd-party Angular chart library](https://jtblin.github.io/angular-chart.js/)**.

* We wanted to have the web portal automatically render a user's personalized dashboard when a user clicks "View Web Portal" button on the extension popup, but we discovered that the Chrome extension's local storage is a **completely different local storage** from the Chrome browser's local storage, thus creating a chasm in the saved data about who is logged in. This was the one challenge we were not able to solve in the week allotted for our project, although the user's data is both viewable and current when he/she logs into the web app. We also learned a lot about navigating Google's **[JavaScript APIs](https://developer.chrome.com/extensions/api_index)** because of this challenge.
<hr>
### Other technologies used for this project:
* **[Semantic-UI](http://semantic-ui.com/)** - to help with page styling
* **[Heroku](http://www.heroku.com)** - used for deployment
* **[Knex.js](http://knexjs.org/)** - used as SQL query builder


<br><br>
<br>

# Sprintr Walkthrough:
<br>
##  1. Create a Sprint 

<br>
<br>
[![https://gyazo.com/e2f7039b7438447e147089f4ddb1e750](https://i.gyazo.com/e2f7039b7438447e147089f4ddb1e750.png)](https://gyazo.com/e2f7039b7438447e147089f4ddb1e750)
<br>
* Name your Sprint.
* Pick a start and end date for your Sprint. 
* Designate the productive websites you would like to track during the course of your Sprint. 
* If you would like to up the stakes, designate your Sprint as a cash game. This will require all players to contribute to a cash pot (through Dwolla). The winner of the Sprint takes home the pot.
<br><br><br><br>


##  2. Invite Your Friends

<br>
<br>
[![https://gyazo.com/86a0f43d50b78898099bdf34f8c04da1](https://i.gyazo.com/86a0f43d50b78898099bdf34f8c04da1.png)](https://gyazo.com/86a0f43d50b78898099bdf34f8c04da1)
<br>
* Players can join existing games as long as they have the unique game code that Sprintr generates for each Sprint. 
* If the Sprint is a cash game, players will be authenticated through Dwolla and their Dwolla account will be connected to the Sprint.
<br><br><br><br>


##  3. Download the Chrome Extension

<br><br>
[![http://imgur.com/a/F0bIP](http://i.imgur.com/9ZCH9e7.png)](http://i.imgur.com/9ZCH9e7.png)
<br>
* Anyone who has downloaded the extension can log in right on the extension popup itself.
* Players can view Sprintr game stats directly from the extension for any competition they're a part of. 
<br><br><br><br>


##  4. Compete To Win

<br><br>
[![https://gyazo.com/52f9a7612392e7b07412934149ac3dbc](https://i.gyazo.com/52f9a7612392e7b07412934149ac3dbc.png)](https://gyazo.com/52f9a7612392e7b07412934149ac3dbc)
<br>
* Sprintr's web portal generates a more detailed view for all games a player is a part of.
* The player's dashboard page lists stats for all current games.
<br>
<br>
[![https://gyazo.com/0209b2a5918a5dfe3507c25594327bf8](https://i.gyazo.com/0209b2a5918a5dfe3507c25594327bf8.png)](https://gyazo.com/0209b2a5918a5dfe3507c25594327bf8)
<br>
* The game's leaderboard page shows individualized stats as a donut chart as well as a chart that displays players' game rankings and the countdown to the end of the game.
<br>

Thanks for Sprinting with us!
<strong>*Hard work pays off. Let's Sprint together.*</strong>
