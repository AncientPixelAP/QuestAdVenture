Quest AdVentures
================

adding a little fluff to Adventure Capitalist
---------------------------------------------

My solution focuses the front-end and gameplay.
I turned AdVenture Capitalist around on itself and made the managers the focus of the game. In Quest AdVentures the managers are called heroes and you can send them on quests if they meet the level requirement. You can upgrade them and sometimes you need to heal them. If that happens, they get sent on a personal quest that doesnt show up on the quest list.
Although i wanted to have only one currency more besides gold, it ended up being two: loot and food. These you can use to generate gold or upgrade your heroes. That way you should get some interesting choices to make, while your hereos are on their quests.
I found that balancing this is quite difficult and it was hard to reduce downtimes. I would add in some little clicking minigames while the heroes are on a quest. Like working on your tavern to upgrade it and seat more guests to sell more loot and food.

tech
----
I used phaser.js to draw stuff on screen, that way i dont have to fool around with CSS and could concentrate on the rest. In photoshop i drew some small sprites for the heroes, buttons and quests. I didnt use any special font that needs embedding, although i woudl add that as well with mobile sensitive scaling if I had more time.
numeral.js was used to convert big numbers to strings, like 1 000 000 will result in "1m"