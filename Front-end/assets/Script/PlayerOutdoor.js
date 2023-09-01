// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

var Input = {}

cc.Class({
    extends: cc.Component,

    properties: {
    },

    setState(state) {
        if (this.state == state) return
        this.state = state
        this.playAni.play(this.state)
    },

    onKeyDown(event) {
        Input[event.keyCode] = true
    },

    onKeyUp(event) {
        Input[event.keyCode] = false
    },


    onLoad: function () {
        this.speed = 100
        this.state = ''
        this.direction = cc.v2(0, 0)
        this.playAni = this.node.getComponent(cc.Animation)

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this)
    },



    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this)

    },

    update: function (dt) {
        if (Input[cc.macro.KEY.a] || Input[cc.macro.KEY.left]) {
            this.direction.x = -1
            // this.face_direction = 'left'
        } else if (Input[cc.macro.KEY.d] || Input[cc.macro.KEY.right]) {
            this.direction.x = 1
            // this.face_direction = 'right'
        } else {
            this.direction.x = 0
        }

        if (Input[cc.macro.KEY.w] || Input[cc.macro.KEY.up]) {
            this.direction.y = 1
            // this.face_direction = 'up'
        } else if (Input[cc.macro.KEY.s] || Input[cc.macro.KEY.down]) {
            this.direction.y = -1
            // this.face_direction = 'down'
        } else {
            this.direction.y = 0
        }

        this.lv = this.node.getComponent(cc.RigidBody).linearVelocity

        if (this.direction.x != 0) {
            // this.node.x += this.direction.x * this.speed * dt
            this.lv.y = 0
            this.lv.x = this.direction.x * this.speed
        } else if (this.direction.y != 0) {
            // this.node.y += this.direction.y * this.speed * dt
            this.lv.x = 0
            this.lv.y = this.direction.y * this.speed
        } else {
            this.lv.y = this.lv.x = 0
        }

        this.node.getComponent(cc.RigidBody).linearVelocity = this.lv

        let state = ''

        if (this.direction.x == 1) state = 'female_right'
        else if (this.direction.x == -1) state = 'female_left'
        else if (this.direction.y == 1) state = 'female_up'
        else if (this.direction.y == -1) state = 'female_down'
        else {

        }

        this.setState(state)
    },


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    // update (dt) {},
});
