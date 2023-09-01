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

encounter = [1, 0.9, 0.8, 0.6, 0.4, 0.2, 0.05]

chance_json = new cc.JsonAsset

var Input = {}


var http = require('http')
var Constant = require('Constant')
const { TAKEIN_URL } = require('./Net/util/Constant')

choosed_poke = {
    id: null,
    name: null,
    encounter: null,
    property: null,
    second_property: null,
    move: [
        null,
        null,
        null,
        null
    ]
}

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
        },
        playerOutdoor: {
            default: null,
            type: cc.Node
        },
        pagePrefab: cc.Prefab,
        framePrefab: cc.Prefab,
        pageListPrefab: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        no_pokemon = window.Global.all_poke[0] == null ? true : false
        // console.log(cc.director.getScene())
        if (cc.director.getScene().name == 'Outdoor') {
            this.beginBattle = cc.find('Options/BeginBattle')
            this.tileSize = this.tilemap.getTileSize()
            console.log(this.tileSize)
            this.grass = this.tilemap.getLayer('grass')
            this.pc = this.tilemap.getLayer('pc')
            this.player = this.playerOutdoor.getComponent('PlayerOutdoor')
        }
        this.wareHouseIcon = cc.find('Options/WareHouse')
        this.pokeListIcon = cc.find('Options/PokeList')
        this.check = cc.find('Options/CheckBag')
        this.pageView = cc.find('Options/PageView')
        this.pokeListInfo = cc.find('Options/PokeListInfo')
        this.shopIcon = cc.find('Options/ShopIcon')
        this.loadfail = cc.find('Options/Fail')
        this.pokeBag = cc.find('Options/PokeBag')
        this.shop = cc.find('Options/Shop')
        this.quickBattleIcon = cc.find('Options/QuickBattleIcon')
        this.quickBattle = cc.find('Options/QuickBattle')
        this.wareHouse_PagePool = new cc.NodePool
        this.wareHouse_FramePool = new cc.NodePool
        this.pokeList_PagePool = new cc.NodePool
        let initCount = 6
        for (let i = 0; i < initCount; ++i) {
            let page = cc.instantiate(this.pagePrefab); // 创建节点
            let pageList = cc.instantiate(this.pageListPrefab); // 创建节点
            let frame = cc.instantiate(this.framePrefab); // 创建节点
            // let data = cc.instantiate(this.dataPrefab); // 创建节点
            this.wareHouse_PagePool.put(page); // 通过 put 接口放入对象池
            this.wareHouse_FramePool.put(frame); // 通过 put 接口放入对象池
            this.pokeList_PagePool.put(pageList); // 通过 put 接口放入对象池
        }
        chance_json = new cc.JsonAsset
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function (event) {
            Input[event.keyCode] = true
        }, this)
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, function (event) {
            Input[event.keyCode] = false
        }, this)
        cc.resources.load('captureChance', cc.JsonAsset, function (err, jsonAsset) {
            if (err != null) {
                console.log('failed to load')
                return
            }
            chance_json = jsonAsset.json
        }.bind(this))
        this.ableAllMove()
        cc.director.preloadScene('Battle', function () {
            console.log('preload battle')
        })
    },

    aboutBegin() {
        this.disableAllMove()
        console.log(this.playerOutdoor)
        this.player.lv.x = 0
        this.player.lv.y = 0
        this.beginBattle.active = true
        let confirm = cc.find('Options/BeginBattle/confirm')
        confirm.on('click', function () {
            cc.director.loadScene('Battle', () => {
                console.log('Battle')
            })
        }, this)

    },

    close(button) {
        button.target.parent.active = false
        console.log(this)
        this.ableAllMove()
    },

    disableAllMove() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN)
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP)
        this.player_moving = false
        this.wareHouseIcon.off('click', this._checkWareHouse, this)
        this.pokeListIcon.off('click', this._checkPokeList, this)
        this.check.off('click', this._checkPokeBag, this)
        this.shopIcon.off('click', this.checkShop, this)
    },

    ableAllMove() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function (event) {
            this.player_moving = true
            Input[event.keyCode] = true
        }, this)
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, function (event) {
            this.player_moving = false
            Input[event.keyCode] = false
        }, this)
        this.wareHouseIcon.on('click', this.checkWareHouse, this)
        this.pokeListIcon.on('click', this.checkPokeList, this)
        this.check.on('click', this.checkPokeBag, this)
        this.shopIcon.on('click', this.checkShop, this)
        this.quickBattleIcon.on('click', this.beginQuickBattle, this)

    },

    checkWareHouse() {
        this.disableAllMove()
        var obj = {
            'url': Constant.WAREHOUSE_URL,
            'data': {
                'method': 'POST'
            },
            'success': this.successCheckWareHouse.bind(this),
            'fail': this.loadFail.bind(this)
        }
        http.request(obj)
    },

    successCheckWareHouse(response) {
        var content = cc.find('Options/PageView/view/content')
        content.destroyAllChildren()
        setTimeout(()=>{}, 0.5)
        this.disableAllMove()
        this.pageView.active = true
        var response_result = JSON.parse(response)
        for(let i in response_result) {
            let new_frame = null
            if (this.wareHouse_FramePool.size() > 0) {
                new_frame = this.wareHouse_FramePool.get()
            } else {
                new_frame = cc.instantiate(this.framePrefab)
            }
            new_frame.parent = content
            let button = new_frame.getChildByName('pokeicon')
            button.on('click', (button) => {
                // let pokeicon = button.target
                let obj = {
                    'url': Constant.FIGHT_URL,
                    'method': 'POST',
                    'data': {
                        'pokemon_id': response_result[i].Pokemon_id
                    },
                    'success': (response) => {
                        let jsonData = JSON.parse(response)
                        console.log('fightdata', jsonData)
                        let new_poke = new pokemon
                        choosed_poke.id = jsonData.id.padStart(3, '0')
                        choosed_poke.name = jsonData.name
                        choosed_poke.property = jsonData.property1
                        choosed_poke.second_property = jsonData.property2
                        // new_poke.attack = jsonData.attack
                        // new_poke.special_attack = jsonData.special_attack
                        // new_poke.defense = jsonData.defense
                        // new_poke.special_defense = jsonData.special_defense
                        // new_poke.speed = jsonData.speed
                        // new_poke.health = jsonData.health
                        // choosed_poke = new_poke
                        choosed_poke.encounter = response_result[i].Catch_time
                        let tmp_move = new skill
                        tmp_move.skill_type = jsonData.skill_type1
                        tmp_move.skill_name = jsonData.skill_name1
                        if(tmp_move.skill_type == 0) {
                            tmp_move.effect_info = null
                            tmp_move.attack_info = new Attack
                            tmp_move.attack_info.attack_type = jsonData.attack_type1
                            tmp_move.attack_info.power = jsonData.attack_power1
                            tmp_move.attack_info.self_damage = jsonData.self_damage1
                            tmp_move.attack_info.attribute = jsonData.attribute1
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
                            tmp_move.effect_info.effectId = jsonData.effect_id1
                            tmp_move.effect_info.effect_result = jsonData.effect_result1
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
                        choosed_poke.move[0] = tmp_move
                        tmp_move = new skill
                        tmp_move.skill_type = jsonData.skill_type2
                        tmp_move.skill_name = jsonData.skill_name2
                        if(tmp_move.skill_type == 0) {
                            tmp_move.effect_info = null
                            tmp_move.attack_info = new Attack
                            tmp_move.attack_info.attack_type = jsonData.attack_type2
                            tmp_move.attack_info.power = jsonData.attack_power2
                            tmp_move.attack_info.self_damage = jsonData.self_damage2
                            tmp_move.attack_info.attribute = jsonData.attribute2
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
                            tmp_move.effect_info.effectId = jsonData.effect_id2
                            tmp_move.effect_info.effect_result = jsonData.effect_result2
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
                        choosed_poke.move[1] = tmp_move
                        tmp_move = new skill
                        tmp_move.skill_type = jsonData.skill_type3
                        tmp_move.skill_name = jsonData.skill_name3
                        if(tmp_move.skill_type == 0) {
                            tmp_move.effect_info = null
                            tmp_move.attack_info = new Attack
                            tmp_move.attack_info.attack_type = jsonData.attack_type3
                            tmp_move.attack_info.power = jsonData.attack_power3
                            tmp_move.attack_info.self_damage = jsonData.self_damage3
                            tmp_move.attack_info.attribute = jsonData.attribute3
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
                            tmp_move.effect_info.effectId = jsonData.effect_id3
                            tmp_move.effect_info.effect_result = jsonData.effect_result3
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
                        choosed_poke.move[2] = tmp_move
                        tmp_move = new skill
                        tmp_move.skill_type = jsonData.skill_type4
                        tmp_move.skill_name = jsonData.skill_name4
                        if(tmp_move.skill_type == 0) {
                            tmp_move.effect_info = null
                            tmp_move.attack_info = new Attack
                            tmp_move.attack_info.attack_type = jsonData.attack_type4
                            tmp_move.attack_info.power = jsonData.attack_power4
                            tmp_move.attack_info.self_damage = jsonData.self_damage4
                            tmp_move.attack_info.attribute = jsonData.attribute4
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
                            tmp_move.effect_info.effectId = jsonData.effect_id4
                            tmp_move.effect_info.effect_result = jsonData.effect_result4
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
                        choosed_poke.move[3] = tmp_move
                        console.log('choosed', choosed_poke)
                    },////
                    'fail': ()=> {
                        alert('Failed to select pokemon')
                    }
                }
                http.request(obj)
                let alert = cc.find('Options/InWareChoose')
                alert.active = true
                alert.getChildByName('Check').on('click', this.checkPokeInfo, this)
                alert.getChildByName('TakeOut').on('click', this.pokeTakeOut, this)
                alert.getChildByName('Letgo').on('click', this.letgo, this)
                
            }, this)
            console.log(response_result[i])
            let temp = response_result[i].Pokemon_id.padStart(3,'0')
            console.log('temp',temp)
            cc.resources.load('icon/'+ temp, cc.SpriteFrame, (err, spriteFrame) => {
                if(err != null) {
                    console.log('failed to load icon')
                    return
                }
                console.log('button', button)
                let backgroud = button.getChildByName('Background')
                console.log('back', backgroud)
                backgroud.getComponent(cc.Sprite).spriteFrame = spriteFrame
                let info = new_frame.getChildByName('pokeinfo').getComponent(cc.Label)
                info.string = response_result[i].Pokemon_name + ' ID: ' + response_result[i].Pokemon_id
                new_frame.getChildByName('encounter').getComponent(cc.Label).string = '相遇于' + response_result[i].Catch_time
            })
        }
        console.log(response_result)
    },

    checkPokeList() {
        var obj = {
            'url': Constant.POKELIST_URL,
            'method': 'POST',
            'data': {
            },
            'success': function (jsonData) {
                this.checkPokeListSeccess(jsonData)
            }.bind(this),
            'fail': function (jsonData) {
                this.loadFail(jsonData)
            }.bind(this)
        }
        console.log('begin check')
        http.request(obj)
    },

    checkPokeListSeccess(response) {
        this.disableAllMove()
        var jsonData = JSON.parse(response)
        var content = cc.find('Options/PokeListInfo/ScrollView/view/content')
        this.pokeListInfo.active = true
        content.destroyAllChildren()
        setTimeout(()=>{}, 0.5)
        let console_data = []
        for (let i in jsonData) {
            cc.resources.load('poke_intro/' + jsonData[i].id.padStart(3, '0'), cc.SpriteFrame, (err, spriteFrame) => {
                if (err != null) {
                    console.log(data_i)
                    console.log(data_i.id.padStart(3, '0'))
                    console.log('failed to load icon')
                    return
                }
                if (this.pokeList_PagePool.size() > 0) {
                    current_data = this.pokeList_PagePool.get()
                    current_data.parent = content
                } else {
                    current_data = cc.instantiate(this.pageListPrefab)
                    current_data.parent = content
                }
                console_data.push(jsonData[i].id.padStart(3, '0'))
                current_data.getComponent(cc.Sprite).spriteFrame = spriteFrame
                // alert('finished once')
            })
        }
        console.log(console_data)
        console.log(content)

    },

    checkPokeBag() {
        this.disableAllMove()
        this.pokeBag.active = true
        var pokeNodeArr = new Array(6)
        var detail = null
        console.log(window.Global.all_poke)
        for (var i in window.Global.all_poke) {
            if (!window.Global.all_poke) {
                pokeNodeArr[i] = null
                continue
            }
            pokeNodeArr[i] = cc.find('Options/PokeBag/poke' + String(i))
            cc.resources.load('icon/' + window.Global.all_poke[i].poke_id, cc.SpriteFrame, function (err, spriteFrame) {
                if (err != null) {
                    this.loadFail()
                    return
                }
                pokeNodeArr[i].getChildByName('pokeicon').on('click', (button)=> {
                    let alert = cc.find('Options/InBagChoose')
                    alert.active = true
                    console.log(button)
                    let index = button.target.parent.name
                    index = Number(index[index.length - 1])
                    console.log(index)
                    choosed_poke.id = window.Global.all_poke[index].poke_id
                    choosed_poke.name = window.Global.all_poke[index].poke_name
                    choosed_poke.property = window.Global.all_poke[index].property
                    choosed_poke.second_property = window.Global.all_poke[index].second_property
                    choosed_poke.encounter = window.Global.all_poke[index].encounter
                    choosed_poke.move[0] = window.Global.all_poke[index].move1
                    choosed_poke.move[1] = window.Global.all_poke[index].move2
                    choosed_poke.move[2] = window.Global.all_poke[index].move3
                    choosed_poke.move[3] = window.Global.all_poke[index].move4
                    alert.getChildByName('Check').on('click', this.checkPokeInfo, this)
                    alert.getChildByName('TakeIn').on('click', this.pokeTakeIn, this)
                    alert.getChildByName('BeFirst').on('click', this.beFirst, this)
                },this)
                pokeNodeArr[i].getChildByName('pokeicon').getComponent(cc.Sprite).spriteFrame = spriteFrame
                pokeNodeArr[i].getChildByName('pokename').getComponent(cc.Label).string = window.Global.all_poke[i].poke_name + ' 属性:' +
                    window.Global.all_poke[i].property + (window.Global.all_poke[i].second_property ? ' ' + window.Global.all_poke[i].second_property : '')
                pokeNodeArr[i].getChildByName('encounter').getComponent(cc.Label).string = '相遇于' + window.Global.all_poke[i].encounter
                detail = cc.find('detail', pokeNodeArr[i])
                detail.getChildByName('attack').getComponent(cc.Label).string = '攻击' + String(window.Global.all_poke[i].attack)
                detail.getChildByName('special_attack').getComponent(cc.Label).string = '特攻' + String(window.Global.all_poke[i].special_attack)
                detail.getChildByName('defense').getComponent(cc.Label).string = '防御' + String(window.Global.all_poke[i].defense)
                detail.getChildByName('special_defense').getComponent(cc.Label).string = '特防' + String(window.Global.all_poke[i].special_defense)
                detail.getChildByName('speed').getComponent(cc.Label).string = '速度' + String(window.Global.all_poke[i].speed)
                detail.getChildByName('health').getComponent(cc.Label).string = '生命' + String(window.Global.all_poke[i].health)
                console.log(pokeNodeArr)
            }.bind(this))
        }
    },

    pokeTakeOut() {
        let total = 0
        for(;total < 6; total++) {
            if(window.Global.all_poke[total] == null)
                break
        }
        if(total == 6) {
            alert('背包已满!')
            return
        }
        console.log(choosed_poke)
        var obj = {
            'url': TAKEIN_URL,
            'method': 'POST',
            'data': {
                'id': choosed_poke.poke_id,
                'catch_time': choosed_poke.encounter
            },
            'success': (response) => {
                window.Global.all_poke[total] = choosed_poke

            },
            'fail': ()=>{
                alert('取出失败!请检查背包中是否已有此精灵或网络条件')
            }
        }
        http.request(obj)
    },

    checkPersonalInfo() {
        var person_info = cc.find('Options/PersonInfo')
        person_info.active = true
        console.log(window.Global)
        person_info.getChildByName('Name').getComponent(cc.Label).string = window.Global.trainer.name
        person_info.getChildByName('ID').getComponent(cc.Label).string = window.Global.trainer.id
        person_info.getChildByName('Money').getComponent(cc.Label).string = window.Global.trainer.money
        person_info.getChildByName('PokeNum').getComponent(cc.Label).string = window.Global.trainer.poke_num

    },

    checkShop() {
        this.disableAllMove()
        this.shop.active = true
    },

    buyBall(touch) {
        let button = touch.target
        let type = parseInt(button.name) + 1
        let price = 0
        switch (type) {
            case 1:
                price = 15000
                break
            case 2:
                price = 1200
                break
            case 3:
                price = 500
                break
            case 4:
                price = 300
                break
        }
        console.log(window.Global.trainer.money)
        if (window.Global.trainer.money >= price) {
            console.log('odd')
            var obj = {
                'url': Constant.BUY_URL,
                'method': 'POST',
                'data': {
                    'type': type,
                    'money': price
                },
                'success': () => {
                    window.Global.trainer.money -= price
                    console.log('successfully purchase')

                },
                'fail': ()=> {
                    console.log('Failed to purchase')
                }
            }
            console.log(obj)
            http.request(obj)
        }
        else {
            console.log('穷逼爬')
        }
    },

    beginQuickBattle() {
        this.disableAllMove()
        this.quickBattle.active = true
        let battlePoke = this.quickBattle.getChildByName('BattlePoke')
        let battleAI = this.quickBattle.getChildByName('BattleAI')
        battlePoke.on('click', () => {
            if(no_pokemon) {
                alert('您并未携带宝可梦，无法开始战斗')
                return
            }
            this.quickBattle.active = false
            this.meetPoke()
        }, this)
        battleAI.on('click', () => {
            if(no_pokemon) {
                alert('您并未携带宝可梦，无法开始战斗')
                return
            }
            
            let i = 0
            for(let v in window.Global.all_poke) {
                if(window.Global.all_poke[v])  i++
            }
            let Poke_id_list = new Array(6)
            for(let k = 0; k < i; k++) {
                Poke_id_list[k] = String(Math.floor(Math.random() * 251 + 1))
            }
            var obj = new Array(i)
            for(let j in window.Global.player2_all_poke) {
                window.Global.player2_all_poke[i] = null
            }
            for(let u = 0; u < i; u++) {
                obj[u] = {
                    'url': Constant.FIGHT_URL,
                    'method': 'POST',
                    'data': {
                        "pokemon_id": Poke_id_list[u]
                    },
                    'success': (jsonData) => {
                        var response_result = JSON.parse(jsonData)
                        console.log(response_result)
                        console.log('fightdata', response_result)
                        let new_poke = new pokemon
                        new_poke.poke_id = response_result.id.padStart(3, '0')
                        new_poke.poke_name = response_result.name
                        new_poke.property = response_result.property1
                        new_poke.second_property = response_result.property2
                        new_poke.attack = response_result.attack
                        new_poke.special_attack = response_result.special_attack
                        new_poke.defense = response_result.defense
                        new_poke.special_defense = response_result.special_defense
                        new_poke.speed = response_result.speed
                        new_poke.health = response_result.health
                        console.log('before', window.Global.player2_all_poke)
                        window.Global.player2_all_poke[u] = new_poke
                        console.log('now', window.Global.player2_all_poke)
                        let tmp_move = new skill
                        tmp_move.skill_type = response_result.skill_type1
                        tmp_move.skill_name = response_result.skill_name1
                        if(tmp_move.skill_type == 0) {
                            tmp_move.effect_info = null
                            tmp_move.attack_info = new Attack
                            tmp_move.attack_info.attack_type = response_result.attack_type1
                            tmp_move.attack_info.power = response_result.attack_power1
                            tmp_move.attack_info.self_damage = response_result.self_damage1
                            tmp_move.attack_info.attribute = response_result.attribute1
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
                            tmp_move.effect_info.effectId = response_result.effect_id1
                            tmp_move.effect_info.effect_result = response_result.effect_result1
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
                        window.Global.player2_all_poke[u].move1 = tmp_move
                        tmp_move = new skill
                        tmp_move.skill_type = response_result.skill_type2
                        tmp_move.skill_name = response_result.skill_name2
                        if(tmp_move.skill_type == 0) {
                            tmp_move.effect_info = null
                            tmp_move.attack_info = new Attack
                            tmp_move.attack_info.attack_type = response_result.attack_type2
                            tmp_move.attack_info.power = response_result.attack_power2
                            tmp_move.attack_info.self_damage = response_result.self_damage2
                            tmp_move.attack_info.attribute = response_result.attribute2
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
                            tmp_move.effect_info.effectId = response_result.effect_id2
                            tmp_move.effect_info.effect_result = response_result.effect_result2
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
                        window.Global.player2_all_poke[u].move2 = tmp_move
                        tmp_move = new skill
                        tmp_move.skill_type = response_result.skill_type3
                        tmp_move.skill_name = response_result.skill_name3
                        if(tmp_move.skill_type == 0) {
                            tmp_move.effect_info = null
                            tmp_move.attack_info = new Attack
                            tmp_move.attack_info.attack_type = response_result.attack_type3
                            tmp_move.attack_info.power = response_result.attack_power3
                            tmp_move.attack_info.self_damage = response_result.self_damage3
                            tmp_move.attack_info.attribute = response_result.attribute3
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
                            tmp_move.effect_info.effectId = response_result.effect_id3
                            tmp_move.effect_info.effect_result = response_result.effect_result3
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
                        window.Global.player2_all_poke[u].move3 = tmp_move
                        tmp_move = new skill
                        tmp_move.skill_type = response_result.skill_type4
                        tmp_move.skill_name = response_result.skill_name4
                        if(tmp_move.skill_type == 0) {
                            tmp_move.effect_info = null
                            tmp_move.attack_info = new Attack
                            tmp_move.attack_info.attack_type = response_result.attack_type4
                            tmp_move.attack_info.power = response_result.attack_power4
                            tmp_move.attack_info.self_damage = response_result.self_damage4
                            tmp_move.attack_info.attribute = response_result.attribute4
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
                            tmp_move.effect_info.effectId = response_result.effect_id4
                            tmp_move.effect_info.effect_result = response_result.effect_result4
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
                        window.Global.player2_all_poke[u].move4 = tmp_move
                        console.log('after', window.Global.player2_all_poke)
                    
                    },
                    'fail': (jsonData) => {
                        alert('failed to load pokemon information')
                    }
                }
                http.request(obj[u])
            }
            window.Global.player2_type = 1
            window.Global.player2_name = '智障训练师'
            this.quickBattle.active = false
            this.aboutBegin()
        }, this)
        
    },


    loadFail() {
        this.disableAllMove()
        this.loadfail.active = false
    },

    start() {

    },

    meetPoke() {
        PokeId = String(Math.floor(Math.random() * 251 + 1))
        if (Math.random() <= chance_json[PokeId]) {
            var obj = {
                'url': Constant.FIGHT_URL,
                'method': 'POST',
                'data': {
                    "pokemon_id": PokeId
                },
                'success': (jsonData) => {
                    var response_result = JSON.parse(jsonData)
                    console.log(response_result)
                    console.log('fightdata', response_result)
                    for(let i in window.Global.player2_all_poke) {
                        window.Global.player2_all_poke[i] = null
                    }
                    let new_poke = new pokemon
                    new_poke.poke_id = response_result.id.padStart(3, '0')
                    new_poke.poke_name = response_result.name
                    new_poke.property = response_result.property1
                    new_poke.second_property = response_result.property2
                    new_poke.attack = response_result.attack
                    new_poke.special_attack = response_result.special_attack
                    new_poke.defense = response_result.defense
                    new_poke.special_defense = response_result.special_defense
                    new_poke.speed = response_result.speed
                    new_poke.health = response_result.health
                    console.log('before', window.Global.player2_all_poke)
                    window.Global.player2_all_poke[0] = new_poke
                    console.log('now', window.Global.player2_all_poke)
                    let tmp_move = new skill
                    tmp_move.skill_type = response_result.skill_type1
                    tmp_move.skill_name = response_result.skill_name1
                    if(tmp_move.skill_type == 0) {
                        tmp_move.effect_info = null
                        tmp_move.attack_info = new Attack
                        tmp_move.attack_info.attack_type = response_result.attack_type1
                        tmp_move.attack_info.power = response_result.attack_power1
                        tmp_move.attack_info.self_damage = response_result.self_damage1
                        tmp_move.attack_info.attribute = response_result.attribute1
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
                        tmp_move.effect_info.effectId = response_result.effect_id1
                        tmp_move.effect_info.effect_result = response_result.effect_result1
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
                    window.Global.player2_all_poke[0].move1 = tmp_move
                    tmp_move = new skill
                    tmp_move.skill_type = response_result.skill_type2
                    tmp_move.skill_name = response_result.skill_name2
                    if(tmp_move.skill_type == 0) {
                        tmp_move.effect_info = null
                        tmp_move.attack_info = new Attack
                        tmp_move.attack_info.attack_type = response_result.attack_type2
                        tmp_move.attack_info.power = response_result.attack_power2
                        tmp_move.attack_info.self_damage = response_result.self_damage2
                        tmp_move.attack_info.attribute = response_result.attribute2
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
                        tmp_move.effect_info.effectId = response_result.effect_id2
                        tmp_move.effect_info.effect_result = response_result.effect_result2
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
                    window.Global.player2_all_poke[0].move2 = tmp_move
                    tmp_move = new skill
                    tmp_move.skill_type = response_result.skill_type3
                    tmp_move.skill_name = response_result.skill_name3
                    if(tmp_move.skill_type == 0) {
                        tmp_move.effect_info = null
                        tmp_move.attack_info = new Attack
                        tmp_move.attack_info.attack_type = response_result.attack_type3
                        tmp_move.attack_info.power = response_result.attack_power3
                        tmp_move.attack_info.self_damage = response_result.self_damage3
                        tmp_move.attack_info.attribute = response_result.attribute3
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
                        tmp_move.effect_info.effectId = response_result.effect_id3
                        tmp_move.effect_info.effect_result = response_result.effect_result3
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
                    window.Global.player2_all_poke[0].move3 = tmp_move
                    tmp_move = new skill
                    tmp_move.skill_type = response_result.skill_type4
                    tmp_move.skill_name = response_result.skill_name4
                    if(tmp_move.skill_type == 0) {
                        tmp_move.effect_info = null
                        tmp_move.attack_info = new Attack
                        tmp_move.attack_info.attack_type = response_result.attack_type4
                        tmp_move.attack_info.power = response_result.attack_power4
                        tmp_move.attack_info.self_damage = response_result.self_damage4
                        tmp_move.attack_info.attribute = response_result.attribute4
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
                        tmp_move.effect_info.effectId = response_result.effect_id4
                        tmp_move.effect_info.effect_result = response_result.effect_result4
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
                    window.Global.player2_all_poke[0].move4 = tmp_move
                    console.log('after', window.Global.player2_all_poke)
                },
                'fail': (jsonData) => {
                    alert('failed to load skill information')
                }
            }
            http.request(obj)
            window.Global.player2_type = 0
            window.Global.player2_name = '野生'
            this.aboutBegin()
        }
    },

    checkPokeInfo() {
        let pokeInfoNode = cc.find('Options/CheckPokeInfo')
        console.log('choosed', choosed_poke)
        pokeInfoNode.active = true
        let infoLayer = pokeInfoNode.getChildByName('InfoLayer')
        cc.resources.load('icon/'+choosed_poke.id, cc.SpriteFrame, (err, spriteFrame) => {
            if(err != null) {
                console.log("failed to load icon")
                return
            }
            let check_icon = pokeInfoNode.getChildByName('icon')
            check_icon.getComponent(cc.Sprite).spriteFrame = spriteFrame
        })
        infoLayer.getChildByName('Name').getComponent(cc.Label).string = choosed_poke.name+' '+choosed_poke.property + ' ' + choosed_poke.second_property
        infoLayer.getChildByName('ID').getComponent(cc.Label).string = 'ID: ' + choosed_poke.id
        infoLayer.getChildByName('Encounter').getComponent(cc.Label).string = '相遇于' + choosed_poke.encounter
        let moveLayer = pokeInfoNode.getChildByName('MoveLayer')
        for(let i = 0; i < 4; i++) {
            let move = moveLayer.getChildByName('Move'+(i+1))
            if (choosed_poke.move[i].skill_type == 0) {
                cc.resources.load("MoveButton/" + choosed_poke.move[i].attack_info.attribute, cc.SpriteFrame, function (err, spriteFrame) {
                    if (err != null) {
                        console.warn("Failed to load img")
                        return
                    }
                    move.getComponent(cc.Sprite).spriteFrame = spriteFrame
                    let move_name = move.getChildByName('Name')
                    move_name = move_name.getComponent(cc.Label)
                    move_name.string = choosed_poke.move[i].skill_name
                    let move_info = move.getChildByName('Intro')
                    move_info = move_info.getComponent(cc.Label)
                    move_info.string = choosed_poke.move[i].introduction
    
        
                })
            } else if (choosed_poke.move[i].skill_type == 1) {
                cc.resources.load("MoveButton/Normal", cc.SpriteFrame, function (err, spriteFrame) {
                    if (err != null) {
                        console.warn("Failed to load img")
                        return
                    }
                    move.getComponent(cc.Sprite).spriteFrame = spriteFrame
                    let move_name = move.getChildByName('Name')
                    move_name = move_name.getComponent(cc.Label)
                    move_name.string = choosed_poke.move[i].skill_name
                    let move_info = move.getChildByName('Intro')
                    move_info = move_info.getComponent(cc.Label)
                    move_info.string = choosed_poke.move[i].introduction
                })
            }
        }
    },

    letgo() {
        var obj = {
            'url': Constant.FREEPOKE_URL,
            'method': 'POST',
            'data': {
                'id': choosed_poke.poke_id,
                'catch_time': choosed_poke.encounter
            },
            'success': (response) => {
                let i = 0
                for(; i < window.Global.all_poke.length; i++) {
                    if(window.Global.all_poke[i] != null) {
                        if(choosed_poke.name == window.Global.all_poke.poke_name && choosed_poke.id == window.Global.all_poke.poke_id) {
                            break
                        }
                    }
                }
                for(let j = i; j < window.Global.all_poke.length; j++) {
                    window.Global.all_poke[j] = (j+1) == window.Global.all_poke.length ? null : window.Global.all_poke[j+1]
                }
                alert('成功放生')
            },
            'fail': (response) => {
                alert('放生失败!请检查网络连接')
            }
        }
    },

    beFirst() {
        let i = 0
        for(; i < window.Global.all_poke.length; i++) {
            if(choosed_poke.name == window.Global.all_poke.poke_name && choosed_poke.id == window.Global.all_poke.poke_id) {
                break
            }
        }
        let temp = window.Global.all_poke[0]
        window.Global.all_poke[0] = window.Global.all_poke[i]
        window.Global.all_poke[i] = temp
    },

    pokeTakeIn() {
        var obj = {
            'url': Constant.TAKEOUT_URL,
            'method': 'POST',
            'data': {
                'id': choosed_poke.id,
                'catch_time': choosed_poke.encounter
            },
            'success': ()=> {
                alert('成功放回仓库')
                let i = 0
                for(; i < window.Global.all_poke.length; i++) {
                    if(window.Global.all_poke[i] != null) {
                        if(choosed_poke.encounter == window.Global.all_poke.encounter && choosed_poke.id == window.Global.all_poke.poke_id) {
                            break
                        }
                    }
                }
                for(let j = i; j < window.Global.all_poke.length; j++) {
                    window.Global.all_poke[j] = (j+1) == window.Global.all_poke.length ? null : window.Global.all_poke[j+1]
                }
            },
            'fail': () => {
                alert('放回失败')
            }
        }
        http.request(obj)
    },

    update(dt) {

        if (this.player_moving) {
            let grassSize = this.grass.getLayerSize()
            for (let i = 0; i < grassSize.width; i++) {
                for (let j = 0; j < grassSize.height; j++) {
                    let grassTile = this.grass.getTiledTileAt(i, j, true)
                    let pcTile = this.pc.getTiledTileAt(i, j, true)
                    if (grassTile.gid != 0 && Math.abs(grassTile.node.x - this.Player.x) * 3 < this.tileSize.width && Math.abs(grassTile.node.y - this.Player.y) * 3 < this.tileSize.height) {
                        // console.log(1)
                        if (Math.random() < 0.8) {
                            if(!no_pokemon) {
                                this.meetPoke()
                            }
                        }
                    }
                    if (pcTile.gid != 0 && Math.abs(pcTile.node.x - this.Player.x) * 1.5 < this.tileSize.width && Math.abs(pcTile.node.y - this.Player.y) * 1.5 < this.tileSize.height) {
                        if (Input[cc.macro.KEY.w]) {
                            cc.director.loadScene('Indoor')
                        }
                    }
                }
            }
        }
    },
});
