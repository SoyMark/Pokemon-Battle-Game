// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

var http = require('http')
var Constant = require("Constant")

cc.Class({
    extends: cc.Component,

    properties: {
        login_node: {
            default: null,
            type: cc.Node
        },
        signin_button: {
            default: null,
            type: cc.Button            
        },
        login_button: {
            default: null,
            type: cc.Button
        },
        ID_input: {
            default: null,
            type: cc.EditBox
        },
        Player_Name_input: {
            default: null,
            type: cc.EditBox
        },
        Password_input: {
            default: null,
            type: cc.EditBox
        },
    },

    // LIFE-CYCLE CALLBACKS:

    trySignin () {
        var encrypt = require("encryptjs")
        this.ID = this.ID_input.string
        var secretkey = this.ID
        var dataString = JSON.stringify(this.Password_input.string)
        var encrypted = encrypt.encrypt(dataString, secretkey, 256)

        var result = JSON.parse(encrypt.decrypt(encrypted, secretkey, 256))     // result存储了经过sha256算法加密的密码，密钥为ID
        this.PassWord = result
        this.Name = this.Player_Name_input.string
        this._startSignin()
    },

    tryLogin () {
        this.login_node.active = true
        this.node.active = false
    },

    onLoad () {
        this.signinsignal = cc.find('SigninSignal')
        this.signin_button.node.on('click', this.trySignin, this)
        this.login_button.node.on('click', this.tryLogin, this)
    },

    start () {
        
    },

    update (dt) {
        if (this.ID_input.string != "" && this.Player_Name_input.string != "" && this.Password_input != "") {
            this.signin_button.interactable = true
        } else {
            this.signin_button.interactable = false
        }
    },

    _startSignin: function() {
        this.signin_button.node.off('click', this.trySignin, this)
        this.login_button.node.off('click', this.tryLogin, this)
        var obj = {
            'url': Constant.REGISTER_URL,
            'method': 'POST',
            'data': {
                'id': this.ID,
                'password': this.PassWord,
                'name': this.Name,
                'login': 1,
                'superuser': 0,
                'createdb': 1,
                'createrole': 0,
                'inherit': 1,
                'replication': 1

            },
            'success': function(jsonData) {
                this._onSigninSuccess(jsonData)
            }.bind(this),

            'fail': function(jsonData) {
                this._onSigninFail(jsonData) 
            }.bind(this)
            //http://localhost:8080/register -X POST -d '{"id":"ssyl4","password":"123","name":"test","login":1,"password":1,"superuser":1,"createdb":1,"createrole":1,"inherit":1}'
        }
        http.request(obj)
    },
    
    _onSigninSuccess(jsonData) {
        this.signinsignal.active = true
        // this.signinsignal.getChildByName('Success').node.active = true
        // this.signinsignal.getChildByName('Fail').node.active = false
        var success = this.signinsignal.getChildByName('Success')
        success.active = true
        var button = success.getChildByName('Confirm')
        button.on('click', ()=>{
            success.active = false
            this.signinsignal.active = false
            this.tryLogin()
        }, this)

    },

    _onSigninFail(jsonData) {
        this.signinsignal.active = true
        var fail = this.signinsignal.getChildByName('Fail')
        fail.active = true
        var button = fail.getChildByName('Confirm')
        button.on('click', function() {
            this.signin_button.node.on('click', this.trySignin, this)
            this.login_button.node.on('click', this.tryLogin, this)
            this.signinsignal.active = false
        }, this)

    },

    
});
