// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

var http = require('http')
var Constant = require('Constant')
var Game = require('Game')


cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        console.log(Game)
        var pokebutton = null
        for (var i = 1; i < 6; i++) {
            pokebutton = cc.find('bg/PokeBag/poke'+String(i)+'/pokeicon')
            pokebutton.on('click', this._exchange, this)
        }
        this.loadfail = cc.find('bg/Fail')
    },

    _exchange(button) {
        var pokeicon = button.target
        var selected_poke = pokeicon.parent
        var poke0 = cc.find('bg/PokeBag/poke0')
        var pokeindex = Number(selected_poke.name[selected_poke.name - 1])
        let tmp = Game.all_poke[0]
        Game.all_poke[0] = Game.all_poke[pokeindex]
        Game.all_poke[pokeindex] = tmp
        cc.resources.load('icon/' + Game.all_poke[0].poke_id, cc.SpriteFrame, function (err, spriteFrame) {
            if (err != null) {
                this.loadFail()
                return
            }
            poke0.getChildByName('pokeicon').getComponent(cc.Sprite).spriteFrame = spriteFrame
        })
        poke0.getChildByName('pokename').getComponent(cc.Label).string = Game.all_poke[0].poke_name + ' 属性:' +
            Game.all_poke[0].property + (Game.all_poke[0].second_property ? ' ' + Game.all_poke[0].second_property : '')
        var detail = cc.find('detail', poke0)
        detail.getChildByName('attack').getComponent(cc.Label).string = String(Game.all_poke[0].attack)
        detail.getChildByName('special_attack').getComponent(cc.Label).string = String(Game.all_poke[0].special_attack)
        detail.getChildByName('defense').getComponent(cc.Label).string = String(Game.all_poke[0].defense)
        detail.getChildByName('special_defense').getComponent(cc.Label).string = String(Game.all_poke[0].special_defense)
        detail.getChildByName('speed').getComponent(cc.Label).string = String(Game.all_poke[0].speed)
        detail.getChildByName('health').getComponent(cc.Label).string = String(Game.all_poke[0].health)
        cc.resources.load('icon/' + Game.all_poke[pokeindex].poke_id, cc.SpriteFrame, function (err, spriteFrame) {
            if (err != null) {
                this.loadFail()
                return
            }
            selected_poke.getChildByName('pokeicon').getComponent(cc.Sprite).spriteFrame = spriteFrame
        })
        selected_poke.getChildByName('pokename').getComponent(cc.Label).string = Game.all_poke[pokeindex].poke_name + ' 属性:' +
            Game.all_poke[pokeindex].property + (Game.all_poke[pokeindex].second_property ? ' ' + Game.all_poke[pokeindex].second_property : '')
        detail = cc.find('detail', selected_poke)
        detail.getChildByName('attack').getComponent(cc.Label).string = String(Game.all_poke[pokeindex].attack)
        detail.getChildByName('special_attack').getComponent(cc.Label).string = String(Game.all_poke[pokeindex].special_attack)
        detail.getChildByName('defense').getComponent(cc.Label).string = String(Game.all_poke[pokeindex].defense)
        detail.getChildByName('special_defense').getComponent(cc.Label).string = String(Game.all_poke[pokeindex].special_defense)
        detail.getChildByName('speed').getComponent(cc.Label).string = String(Game.all_poke[pokeindex].speed)
        detail.getChildByName('health').getComponent(cc.Label).string = String(Game.all_poke[pokeindex].health)

        var obj = {
            'url': Constant.EXCHANGE_URL,
            'data': {
                'method': 'update',
                'result': Game.all_poke,
            },
            'success': function () {
                console.log('successfully update')
                return
            },
            'fail': this.loadFail
        }
        http.request(obj)
    },

    loadFail() {
        this.loadfail.active = true
    },

    start() {

    },

    // update (dt) {},
});
