let level1 = 1;

var statisticsManager = {
    kills: 0,
    levels: [
        "/map.json",
        "/map1.json"
    ],
    curLevel: 0,
    availableLevel: 1,
    finished: false,
    lifetime: 0,
    damage: 0,
    score: 0,
    min_score: 0,

    finish(success) {

        if (this.curLevel) {
            this.curLevel = 0;
            this.score += this.lifetime;
            this.checkHighScore(this.score)
        }

        // let current_user = localStorage.getItem("current_user")
        // let current_score = Number(localStorage.getItem(String(current_user)))
        //
        // localStorage.setItem(localStorage.getItem("current_user"), String(Math.max(current_score, maybe_record)))

        if (success) {
            this.finished = 'win';
            this.availableLevel = Math.min(Math.max(this.availableLevel, this.curLevel + 1), this.levels.length-1);
        } else
            this.finished = 'fail';

        gameManager.stop();
        this.redraw();
    },
    incKills() {
        this.kills++;
        this.redraw();
    },
    saveHighScore(score, highScores) {
        highScores.push(score);

        console.log(highScores[0])

        highScores.sort((a, b) => b.score - a.score);

        console.log(highScores);

        localStorage.setItem('leaders', JSON.stringify(highScores));
    },

    checkHighScore(score) {
        const highScores = JSON.parse(localStorage.getItem('leaders'));
        const lowestScore = highScores[this.min_score - 1]?.score ?? 0;

        if (score > lowestScore) {
            const name = localStorage.getItem("user");
            const newScore = { score, name };
            console.log(newScore)
            console.log(highScores)
            this.saveHighScore(newScore, highScores);
            this.showHighScores();
        }
    },

    showHighScores() {
        const highScores = JSON.parse(localStorage.getItem('leaders'));
        const highScoreList = document.getElementById('leaders');

        console.log(highScoreList)
        console.log(highScores)

        highScoreList.innerHTML = highScores
            .map((score) => `<li>${score.score} - ${score.name}`)
            .join('');
    },

    checkoutPlayer(player) {
        if (!player)
            return;

        this.lifetime = player.lifetime;
        this.damage = player.rocketDamage;

        let enemies = 0;
        for (let i = 0; i < gameManager.entities.length; i++) {
            let entity = gameManager.entities[i];
            if (entity.type === 'Enemy')
                enemies++;
        }

        if (!enemies)
            this.finish(true);

        this.redraw();
    },
    restartLevel() {
        this.kills = 0;
        this.finished = false;
        gameManager.loadAll(ctx);
        gameManager.play(ctx);
    },
    nextLevel() {
        statisticsManager.curLevel = Math.min(this.curLevel+1, this.availableLevel);
        statisticsManager.restartLevel();
    },
    prevLevel() {
        statisticsManager.curLevel = Math.max(this.curLevel-1, 0);
        statisticsManager.restartLevel();
    },
    redraw() {
        document.getElementById('level').innerHTML = `${statisticsManager.curLevel+1}`;
        document.getElementById('lifetime').innerHTML = `${statisticsManager.lifetime}`;
        document.getElementById('damage').innerHTML = `${statisticsManager.damage}`;
        document.getElementById('kills').innerHTML = `${statisticsManager.kills}`;
        let winMessage = document.getElementById('win-message');
        let failMessage = document.getElementById('fail-message');
        let prevLevelButton = document.getElementById('prev-level-button');
        let nextLevelButton = document.getElementById('next-level-button');

        if (this.finished === false) {
            winMessage.style.display = 'none';
            failMessage.style.display = 'none';
        } else if (this.finished === 'win') {
            winMessage.style.display = 'block';
            failMessage.style.display = 'none';
        } else {
            winMessage.style.display = 'none';
            failMessage.style.display = 'block';
        }

        prevLevelButton.disabled = !(this.curLevel > 0);
        nextLevelButton.disabled = !(this.curLevel < this.availableLevel);

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        let records = []
        for (let a in localStorage) {
            if (localStorage.getItem(a) != null) {
                if (a !== "level" && a !== "user" && a !== "score") {
                    records.push([a, localStorage.getItem(a)])
                }
            }
        }

        records.sort(function(first, second) {
            return Number(second[1]) - Number(first[1]);
        });

    }
};
