// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


cc.Class({
    extends: cc.Component,

    properties: {
        Player: {
            default: null,
            type: cc.Node
        },
        tilemap: {
            default: null,
            type: cc.TiledMap
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.beginBattle = cc.find('bg/BeginBattle')
        this.tileSize = this.tilemap.getTileSize()
        this.ableAllMove()
    },

    disableAllMove() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN)
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP)
        this.player_moving = false
    },

    ableAllMove() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function () {
            this.player_moving = true
        }, this)
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, function () {
            this.player_moving = false
        }, this)

    },

    start() {

    },

    update(dt) {

        if (this.player_moving) {
        }
    },
});
