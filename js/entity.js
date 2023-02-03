var Entity = {
    pos_x: 0,
    pos_y: 0,
    size_x: 64,
    size_y: 64,
    extend: function(proto) {
        let object = Object.create(this);
        for (let property in proto) {
            if (this.hasOwnProperty(property) || typeof object[property] === 'undefined') {
                object[property] = proto[property];
            }
        }
        return object;
    }
};

var Player = Entity.extend({
    size_x: 64,
    size_y: 64,
    lifetime: 100000,
    move_x: 0,
    move_y: 1,
    speed: 3,
    rotation: 0,
    reload: 0,
    rocketDamage: 50,
    draw: function (ctx) {
        spriteManager.drawSprite(
            ctx,
            "player",
            this.pos_x,
            this.pos_y,
            this.rotation,
            this.size_x,
            this.size_y,
        );
    },
    update: function() {
        if (this.reload > 0)
            this.reload--;

        this.move_y = 0;
        this.move_x = 0;

        if (eventsManager.action['down']) {
            this.move_y = 1;
            this.rotation = 180;
        } else if (eventsManager.action['up']) {
            this.move_y = -1;
            this.rotation = 0;
        } else if (eventsManager.action['left']) {
            this.move_x = -1;
            this.rotation = -90;
        } else if (eventsManager.action['right']) {
            this.move_x = 1;
            this.rotation = 90;
        }

        physicManager.update(this);
    },
    onTouchEntity: function (obj) {
        if (obj.type === "Shield") {
            obj.kill();
            this.lifetime += 50;
        } else if (obj.type === "Ammo") {
            obj.kill();
            this.rocketDamage += 50;
        }
    },
    kill: function () {
        gameManager.laterKill.push(this);
        statisticsManager.finish(false);
    },
    fire: function() {
        if (this.reload > 0)
            return;

        let r = Object.create(Shell);
        r.name = "shell" + (++gameManager.fireNum);
        r.owner = this;
        r.damage = this.rocketDamage;

        switch (this.rotation) {
            case -90: { // left
                r.pos_x = this.pos_x - r.size_x - 10;
                r.pos_y = this.pos_y + this.size_y/2 - r.size_y/2;
                r.move_x = -1;
                break;
            }
            case 90: { // right
                r.pos_x = this.pos_x + this.size_x + 10;
                r.pos_y = this.pos_y + this.size_y/2 - r.size_y/2;
                r.move_x = 1;
                break;
            }
            case 0: { // top
                r.pos_x = this.pos_x + this.size_x/2 - r.size_x/2;
                r.pos_y = this.pos_y - r.size_y - 10;
                r.move_y = -1;
                break;
            }
            case 180: { // bottom
                r.pos_x = this.pos_x + this.size_x/2 - r.size_x/2;
                r.pos_y = this.pos_y + this.size_y + 10;
                r.move_y = 1;
            }
        }
        gameManager.entities.push(r);
        this.reload = 200 / gameManager.drawInterval;
    },
    damage: function(damage) {
        this.lifetime -= damage;
        if (this.lifetime <= 0) {
            this.lifetime = 0;
            this.kill();
        }
    },
    ignoreEntity(other) {
        return other.name.match(/Shell/);
    }
});

var Enemy = Entity.extend({
    size_x: 64,
    size_y: 64,
    lifetime: 100,
    move_x: 0,
    move_y: 0,
    speed: 1,
    rotation: 0,
    draw: function(ctx) {
        spriteManager.drawSprite(
            ctx,
            "enemy",
            this.pos_x,
            this.pos_y,
            this.rotation,
            this.size_x,
            this.size_y,
        );
    },
    update: function() {
        if (this.reload > 0)
            this.reload--;

        let player = gameManager.player;
        let dx = Math.min(this.size_x, player.size_x)/2;
        let dy = Math.min(this.size_y, player.size_y)/2;

        if (Math.abs(this.pos_x - player.pos_x) <= dx && !mapManager.hasWallsBetween(this.pos_x, this.pos_y, player.pos_x, player.pos_y)) {
            this.rotation = this.pos_y > player.pos_y ? 0 : 180;
            this.fire();
        } else if (Math.abs(this.pos_y - player.pos_y) <= dy && !mapManager.hasWallsBetween(this.pos_x, this.pos_y, player.pos_x, player.pos_y)) {
            this.rotation = this.pos_x > player.pos_x ? -90 : 90;
            this.fire();
        } else {
            if (this.move_y)
                this.rotation = this.move_y === 1 ? 180 : 0;
            else if (this.move_x)
                this.rotation = this.move_x === 1 ? 90 : -90;

            physicManager.update(this);
        }
    },
    onTouchEntity: function(obj) {
        this.move_x = -this.move_x;
        this.move_y = -this.move_y;
    },
    onTouchMap: function(t) {
        this.move_x = -this.move_x;
        this.move_y = -this.move_y;
    },
    kill: function() {
        gameManager.laterKill.push(this);
        statisticsManager.incKills();
    },
    fire: function() {
        if (this.reload > 0)
            return;

        let r = Object.create(Shell);
        r.name = "shell" + (++gameManager.fireNum);
        r.owner = this;
        r.speed = 5;

        switch (this.rotation) {
            case -90: { // left
                r.pos_x = this.pos_x - r.size_x - 10;
                r.pos_y = this.pos_y + this.size_y/2 - r.size_y/2;
                r.move_x = -1;
                break;
            }
            case 90: { // right
                r.pos_x = this.pos_x + this.size_x + 10;
                r.pos_y = this.pos_y + this.size_y/2 - r.size_y/2;
                r.move_x = 1;
                break;
            }
            case 0: { // top
                r.pos_x = this.pos_x + this.size_x/2 - r.size_x/2;
                r.pos_y = this.pos_y - r.size_y - 10;
                r.move_y = -1;
                break;
            }
            case 180: { // bottom
                r.pos_x = this.pos_x + this.size_x/2 - r.size_x/2;
                r.pos_y = this.pos_y + this.size_y + 10;
                r.move_y = 1;
            }
        }
        gameManager.entities.push(r);
        this.reload = 200 / gameManager.drawInterval;
    },
    damage: function(damage) {
        this.lifetime -= damage;
        if (this.lifetime <= 0)
            this.kill();
    },
    ignoreEntity(other) {
        return other.name.toLowerCase().contains("shell");
    }
});

var Shell = Entity.extend({
    damage: 50,
    owner: null,
    move_x: 0,
    move_y: 0,
    speed: 10,
    size_x: 11,
    size_y: 18,
    draw: function(ctx) {
        let rotation = 0;

        if (this.move_x === 1)
            rotation = -90;
        else if (this.move_x === -1)
            rotation = 90;
        else if (this.move_y === 1)
            rotation = 180;

        spriteManager.drawSprite(
            ctx,
            "shell",
            this.pos_x,
            this.pos_y,
            rotation,
            this.size_x,
            this.size_y,
        );
    },
    update: function() {
        physicManager.update(this);
    },
    onTouchEntity: function(obj) {
        this.kill();

        if (typeof obj.damage === 'function')
            obj.damage(this.damage);
    },
    onTouchMap: function(idx) {
        this.kill();
    },
    kill: function() {
        gameManager.laterKill.push(this);
    },
    ignoreEntity(other) {
        return other === this.owner
            || this.owner === other.owner
            || (this.owner && other.owner && this.owner.type === other.owner.type)
            || this.type === other.type;
    }
});

var Shield = Entity.extend({
    size_x: 40,
    size_y: 40,
    draw: function(ctx) {
        spriteManager.drawSprite(
            ctx,
            "shield",
            this.pos_x,
            this.pos_y,
        );
    },
    kill: function() {
        gameManager.laterKill.push(this);
    },
});

var Ammo = Entity.extend({
    size_x: 52,
    size_y: 48,
    draw: function(ctx) {
        spriteManager.drawSprite(
            ctx,
            "ammo",
            this.pos_x,
            this.pos_y,
        );
    },
    kill: function() {
        gameManager.laterKill.push(this);
    },
});