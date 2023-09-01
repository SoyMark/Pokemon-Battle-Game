// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html



var http = require('http')
var Constant = require("Constant")
var Global = require('Global')

window.Global = {
    player2Name: null,
    player2_type: null,
    ballPack: null,
    all_poke: null,
    trainer: {},
    player2_all_poke: null,
    alterable: {},
}

class Attack {
    constructor(attack_type, power, self_damage, attribute) {
        this.attack_type = attack_type
        this.power = power
        this.self_damage = self_damage
        this.attribute = attribute
    }
}

class effect {
    constructor(effectId, effect_result) {
        this.effectId = effectId
        this.effect_result = effect_result
    }
}

class skill {
    constructor(skill_name, skill_type, attack_info, introduction, ...effect_info) {
        this.skill_name = skill_name
        this.skill_type = skill_type
        this.attack_info = attack_info
        this.effect_info = new Array(effect_info.length)
        for (var i = 0; i < effect_info.length; i++) {
            this.effect_info[i] = effect_info[i]
        }
        this.introduction = introduction
    }
}

class pokemon {
    constructor(poke_id, poke_name, property, second_property, attack, special_attack, defense, special_defense, speed, health) {
        this.poke_id = poke_id
        this.poke_name = poke_name
        this.property = property
        this.second_property = second_property
        this.attack = attack
        this.special_attack = special_attack
        this.defense = defense
        this.special_defense = special_defense
        this.speed = speed
        this.health = health
    }
}

window.Global.all_poke = new Array(6)
window.Global.player2_all_poke = new Array(6)

for (var i in window.Global.all_poke) {
    window.Global.all_poke[i] = null
}
for (var i in window.Global.player2_all_poke) {
    window.Global.player2_all_poke[i] = null
}



cc.Class({
    extends: cc.Component,

    properties: {
        signin_node: {
            default: null,
            type: cc.Node
        },
        login_button: {
            default: null,
            type: cc.Button
        },
        signin_button: {
            default: null,
            type: cc.Button
        },
        ID_input: {
            default: null,
            type: cc.EditBox
        },
        Password_input: {
            default: null,
            type: cc.EditBox
        },
    },

    // LIFE-CYCLE CALLBACKS:

    tryLogin() {
        var encrypt = require("encryptjs")
        this.ID = this.ID_input.string
        var secretkey = this.ID
        // var dataString = JSON.stringify(this.Password_input.string)
        // var encrypted = encrypt.encrypt(dataString, secretkey, 256)

        // var result = JSON.parse(encrypt.decrypt(encrypted, secretkey, 256))     // result存储了经过sha256算法加密的密码，密钥为ID
        // this.PassWord = result
        this.PassWord = this.Password_input.string
        this.Name = this.ID
        this._startLogin()


    },

    trySignin() {
        this.signin_node.active = true
        this.node.active = false
    },

    onLoad() {
        // console.info(1)
        this.signin_button.node.on('click', this.trySignin, this)
        this.login_button.node.on('click', this.tryLogin, this)
        this.loginsignal = cc.find('LoginSignal')
        this.signinsignal = cc.find('SigninSignal')
        this.trainer = new Object
        console.log('http is ', http)
    },
    

    start() {

    },

    loadGame() {
        cc.director.loadScene('Outdoor')
    },

    update() {
        if (this.Password_input.string != "" && this.ID_input.string != "") {
            this.login_button.interactable = true
        } else {
            this.login_button.interactable = false
        }
    },

    _startLogin: function() {
        this.signin_button.node.off('click', this.trySignin, this)
        this.login_button.node.off('click', this.tryLogin, this)
        var obj = {
            'url': Constant.LOGIN_URL,
            'method': 'POST',
            'data': {
                'id': this.ID,
                'password': this.PassWord
            },
            'success': function(jsonData) {
                this._onLoginSuccess(jsonData)
            }.bind(this),

            'fail': function(jsonData) {
                this._onLoginFail(jsonData)
            }.bind(this)
        }
        http.request(obj)
    },
    
    _onLoginSuccess(jsonData) {
        let response_result = JSON.parse(jsonData)
        for(let i in response_result) {
            let new_poke = new pokemon
            new_poke.poke_id = response_result[i].id.padStart(3, '0')
            new_poke.poke_name = response_result[i].name
            new_poke.property = response_result[i].property1
            new_poke.second_property = response_result[i].property2
            new_poke.attack = response_result[i].attack
            new_poke.special_attack = response_result[i].special_attack
            new_poke.defense = response_result[i].defense
            new_poke.special_defense = response_result[i].special_defense
            new_poke.speed = response_result[i].speed
            new_poke.health = response_result[i].health
            window.Global.all_poke[i] = new_poke
            let tmp_move = new skill
            tmp_move.skill_type = response_result[i].skill_type1
            tmp_move.skill_name = response_result[i].skill_name1
            if(tmp_move.skill_type == 0) {
                tmp_move.effect_info = null
                tmp_move.attack_info = new Attack
                tmp_move.attack_info.attack_type = response_result[i].attack_type1
                tmp_move.attack_info.power = response_result[i].attack_power1
                tmp_move.attack_info.self_damage = response_result[i].self_damage1
                tmp_move.attack_info.attribute = response_result[i].attribute1
                tmp_move.introduction = tmp_move.attack_info.attack_type ? "物攻 " : "特攻 "
                tmp_move.introduction += '威力:'+tmp_move.attack_info.power
                switch(tmp_move.self_damage) {
                    case 0:
                        break
                    case 10:
                        tmp_move.introduction += ' 轻微自损'
                        break
                    case 30:
                        tmp_move.introduction += '中度自损'
                        break
                    case 50:
                        tmp_move.introduction += '严重自损'
                        break
                    case 200:
                        tmp_move.introduction += '自杀技能'
                        break
                }
            }
            else {
                tmp_move.attack_info = null
                tmp_move.effect_info = new effect
                tmp_move.effect_info.effectId = response_result[i].effect_id1
                tmp_move.effect_info.effect_result = response_result[i].effect_result1
                tmp_move.introduction = "属性 "
                if(parseInt(tmp_move.effect_info.effectId/6) == 0) {
                    tmp_move.introduction += '自身 '
                }
                else if(parseInt(tmp_move.effect_info.effectId/6) == 1) {
                    tmp_move.introduction += '对方 '
                }
                switch(parseInt(tmp_move.effect_info.effectId)) {
                    case 0:
                        tmp_move.introduction += '攻击'
                        break
                    case 1:
                        tmp_move.introduction += '特攻'
                        break
                    case 2:
                        tmp_move.introduction += '防御'
                        break
                    case 3:
                        tmp_move.introduction += '特防'
                        break
                    case 4:
                        tmp_move.introduction += '速度'
                        break
                    case 5:
                        tmp_move.introduction += '生命恢复'
                        break
                }
                tmp_move.introduction += tmp_move.effect_info.effect_result
                if(tmp_move.effect_info.effectId == 12) {
                    tmp_move.introduction = '将天气变为雨天'
                }
                if(tmp_move.effect_info.effectId == 13) {
                    tmp_move.introduction = '将天气变为晴天'
                }
            }
            window.Global.all_poke[i].move1 = tmp_move
            tmp_move = new skill
            tmp_move.skill_type = response_result[i].skill_type2
            tmp_move.skill_name = response_result[i].skill_name2
            if(tmp_move.skill_type == 0) {
                tmp_move.effect_info = null
                tmp_move.attack_info = new Attack
                tmp_move.attack_info.attack_type = response_result[i].attack_type2
                tmp_move.attack_info.power = response_result[i].attack_power2
                tmp_move.attack_info.self_damage = response_result[i].self_damage2
                tmp_move.attack_info.attribute = response_result[i].attribute2
                tmp_move.introduction = tmp_move.attack_info.attack_type ? "物攻 " : "特攻 "
                tmp_move.introduction += '威力:'+tmp_move.attack_info.power
                switch(tmp_move.self_damage) {
                    case 0:
                        break
                    case 10:
                        tmp_move.introduction += ' 轻微自损'
                        break
                    case 30:
                        tmp_move.introduction += '中度自损'
                        break
                    case 50:
                        tmp_move.introduction += '严重自损'
                        break
                    case 200:
                        tmp_move.introduction += '自杀技能'
                        break
                }
            }
            else {
                tmp_move.attack_info = null
                tmp_move.effect_info = new effect
                tmp_move.effect_info.effectId = response_result[i].effect_id2
                tmp_move.effect_info.effect_result = response_result[i].effect_result2
                tmp_move.introduction = "属性 "
                if(parseInt(tmp_move.effect_info.effectId/6) == 0) {
                    tmp_move.introduction += '自身 '
                }
                else if(parseInt(tmp_move.effect_info.effectId/6) == 1) {
                    tmp_move.introduction += '对方 '
                }
                switch(parseInt(tmp_move.effect_info.effectId)) {
                    case 0:
                        tmp_move.introduction += '攻击'
                        break
                    case 1:
                        tmp_move.introduction += '特攻'
                        break
                    case 2:
                        tmp_move.introduction += '防御'
                        break
                    case 3:
                        tmp_move.introduction += '特防'
                        break
                    case 4:
                        tmp_move.introduction += '速度'
                        break
                    case 5:
                        tmp_move.introduction += '生命恢复'
                        break
                }
                tmp_move.introduction += tmp_move.effect_info.effect_result
                if(tmp_move.effect_info.effectId == 12) {
                    tmp_move.introduction = '将天气变为雨天'
                }
                if(tmp_move.effect_info.effectId == 13) {
                    tmp_move.introduction = '将天气变为晴天'
                }
            }
            window.Global.all_poke[i].move2 = tmp_move
            tmp_move = new skill
            tmp_move.skill_type = response_result[i].skill_type3
            tmp_move.skill_name = response_result[i].skill_name3
            if(tmp_move.skill_type == 0) {
                tmp_move.effect_info = null
                tmp_move.attack_info = new Attack
                tmp_move.attack_info.attack_type = response_result[i].attack_type3
                tmp_move.attack_info.power = response_result[i].attack_power3
                tmp_move.attack_info.self_damage = response_result[i].self_damage3
                tmp_move.attack_info.attribute = response_result[i].attribute3
                tmp_move.introduction = tmp_move.attack_info.attack_type ? "物攻 " : "特攻 "
                tmp_move.introduction += '威力:'+tmp_move.attack_info.power
                switch(tmp_move.self_damage) {
                    case 0:
                        break
                    case 10:
                        tmp_move.introduction += ' 轻微自损'
                        break
                    case 30:
                        tmp_move.introduction += '中度自损'
                        break
                    case 50:
                        tmp_move.introduction += '严重自损'
                        break
                    case 200:
                        tmp_move.introduction += '自杀技能'
                        break
                }
            }
            else {
                tmp_move.attack_info = null
                tmp_move.effect_info = new effect
                tmp_move.effect_info.effectId = response_result[i].effect_id3
                tmp_move.effect_info.effect_result = response_result[i].effect_result3
                tmp_move.introduction = "属性 "
                if(parseInt(tmp_move.effect_info.effectId/6) == 0) {
                    tmp_move.introduction += '自身 '
                }
                else if(parseInt(tmp_move.effect_info.effectId/6) == 1) {
                    tmp_move.introduction += '对方 '
                }
                switch(parseInt(tmp_move.effect_info.effectId)) {
                    case 0:
                        tmp_move.introduction += '攻击'
                        break
                    case 1:
                        tmp_move.introduction += '特攻'
                        break
                    case 2:
                        tmp_move.introduction += '防御'
                        break
                    case 3:
                        tmp_move.introduction += '特防'
                        break
                    case 4:
                        tmp_move.introduction += '速度'
                        break
                    case 5:
                        tmp_move.introduction += '生命恢复'
                        break
                }
                tmp_move.introduction += tmp_move.effect_info.effect_result
                if(tmp_move.effect_info.effectId == 12) {
                    tmp_move.introduction = '将天气变为雨天'
                }
                if(tmp_move.effect_info.effectId == 13) {
                    tmp_move.introduction = '将天气变为晴天'
                }
            }
            window.Global.all_poke[i].move3 = tmp_move
            tmp_move = new skill
            tmp_move.skill_type = response_result[i].skill_type4
            tmp_move.skill_name = response_result[i].skill_name4
            if(tmp_move.skill_type == 0) {
                tmp_move.effect_info = null
                tmp_move.attack_info = new Attack
                tmp_move.attack_info.attack_type = response_result[i].attack_type4
                tmp_move.attack_info.power = response_result[i].attack_power4
                tmp_move.attack_info.self_damage = response_result[i].self_damage4
                tmp_move.attack_info.attribute = response_result[i].attribute4
                tmp_move.introduction = tmp_move.attack_info.attack_type ? "物攻 " : "特攻 "
                tmp_move.introduction += '威力:'+tmp_move.attack_info.power
                switch(tmp_move.self_damage) {
                    case 0:
                        break
                    case 10:
                        tmp_move.introduction += ' 轻微自损'
                        break
                    case 30:
                        tmp_move.introduction += '中度自损'
                        break
                    case 50:
                        tmp_move.introduction += '严重自损'
                        break
                    case 200:
                        tmp_move.introduction += '自杀技能'
                        break
                }
            }
            else {
                tmp_move.attack_info = null
                tmp_move.effect_info = new effect
                tmp_move.effect_info.effectId = response_result[i].effect_id4
                tmp_move.effect_info.effect_result = response_result[i].effect_result4
                tmp_move.introduction = "属性 "
                if(parseInt(tmp_move.effect_info.effectId/6) == 0) {
                    tmp_move.introduction += '自身 '
                }
                else if(parseInt(tmp_move.effect_info.effectId/6) == 1) {
                    tmp_move.introduction += '对方 '
                }
                switch(parseInt(tmp_move.effect_info.effectId)) {
                    case 0:
                        tmp_move.introduction += '攻击'
                        break
                    case 1:
                        tmp_move.introduction += '特攻'
                        break
                    case 2:
                        tmp_move.introduction += '防御'
                        break
                    case 3:
                        tmp_move.introduction += '特防'
                        break
                    case 4:
                        tmp_move.introduction += '速度'
                        break
                    case 5:
                        tmp_move.introduction += '生命恢复'
                        break
                }
                tmp_move.introduction += tmp_move.effect_info.effect_result
                if(tmp_move.effect_info.effectId == 12) {
                    tmp_move.introduction = '将天气变为雨天'
                }
                if(tmp_move.effect_info.effectId == 13) {
                    tmp_move.introduction = '将天气变为晴天'
                }
            }
            window.Global.all_poke[i].move4 = tmp_move
            window.Global.all_poke[i].encounter = response_result[i].catch_time
        }
        console.log(window.Global.all_poke[i])
        // todo
        //store pokemon information
        var obj = {
            'url': Constant.USERINFO_URL,
            'method': 'GET',
            'success': function(jsonData) {
                this.storeTrainerSuccess(jsonData)
            }.bind(this),

            'fail': function(jsonData) {
                this._onLoginFail(jsonData)
            }.bind(this)
        }
        http.request(obj)
    },
    
    storeTrainerSuccess(jsonData) {
        var trainer_data = JSON.parse(jsonData)
        
        console.log(trainer_data)

        this.trainer.money = trainer_data.money
        this.trainer.id = trainer_data.id
        console.log(trainer_data.pokemon_num)
        this.trainer.poke_num = trainer_data.pokemon_num
        this.trainer.name = trainer_data.name

        console.log(this.trainer)
        window.Global.trainer = this.trainer


        this.loginsignal.active = true
        var fail = this.loginsignal.getChildByName('Fail')
        fail.active = false
        var success = this.loginsignal.getChildByName('Success')
        success.active = true
        var button = success.getChildByName('Confirm').getComponent(cc.Button)
        button.node.on('click', this.loadGame, this)

    },

    _onLoginFail(jsonData) {
        console.log('Failed'+jsonData)
        this.loginsignal.active = true
        var fail = this.loginsignal.getChildByName('Fail')
        fail.active = true
        var success = this.loginsignal.getChildByName('Success')
        success.active = false
        var button = fail.getChildByName('Confirm')
        button.on('click', function() {
            this.signin_button.node.on('click', this.trySignin, this)
            this.login_button.node.on('click', this.tryLogin, this)
            this.loginsignal.active = false
        }, this)

    }

    // update (dt) {},
});
