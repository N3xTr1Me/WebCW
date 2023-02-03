var physicManager = {
    update: function(obj) {

        if (obj.move_x === 0 && obj.move_y === 0)
            return 'stop';

        let newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
        let newY = obj.pos_y + Math.floor(obj.move_y * obj.speed);

        let ts = Math.max(mapManager.getTilesetIdx(newX, newY),
             mapManager.getTilesetIdx(newX + obj.size_x, newY),
             mapManager.getTilesetIdx(newX + obj.size_x, newY + obj.size_y),
             mapManager.getTilesetIdx(newX, newY + obj.size_y)
        );

        let encounter = this.entityAtXY(obj, newX, newY);

        if (encounter && obj.ignoreEntity && obj.ignoreEntity(encounter))
            encounter = null;

        if (encounter && obj.onTouchEntity)
            obj.onTouchEntity(encounter);

        if (ts >= 5 && obj.onTouchMap)
            obj.onTouchMap();

        if (ts < 5 && !encounter) {
            obj.pos_x = newX;
            obj.pos_y = newY;
        } else {
            return 'break';
        }
        return 'move';
    },
    entityAtXY: function(obj, x, y) {
        return gameManager.entities.find(e =>
            e.name !== obj.name
            && !(x + obj.size_x < e.pos_x || y + obj.size_y < e.pos_y || x > e.pos_x + e.size_x || y > e.pos_y + e.size_y)
        )
    }
};