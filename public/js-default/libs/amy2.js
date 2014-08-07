/**
 * https://github.com/Ideafy/Ideafy
 * Proprietary License - All rights reserved
 * Authors: Olivier Wietrich <Olivier.Wietrich@gmail.com> & Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY
 */
var olives = require("./olives"),
      emily = require("./emily"),
      Tools = emily.Tools,
      Amy = {};
       
Amy.DomUtils = function(){
        var hasQuerySelector = function(parent, node, selector) {
                var getNodes = function getNodes(parent, selector) {
                         if (parent instanceof HTMLElement || parent instanceof SVGElement) {
                                if (!parent.parentNode) {
                                        document.createDocumentFragment().appendChild(parent);
                                }
                                return parent.parentNode.querySelectorAll(selector || "*");
                        }
                        else {
                                return false;
                        }
                };
                return Tools.toArray(getNodes(parent, selector)).indexOf(node) > -1;
        };
        return { hasQuerySelector : hasQuerySelector};
};

Amy.TestUtils = function(){
        var _isString = function(string){
		      return (typeof string == "string");
	       },
	       _throw = function(error, message){
		      throw new Error(_isString(message) ? message : error);
	       };

        return {
	       assertIsObject : function(object, message){
		      if(!(object instanceof Object)){
			     _throw("Is not Object", message);
		      }
		      return true;
	       },

	       assertIsObservable : function(observable, message){
		      //literal will allows to configure observable implementation
		      if(!(observable && typeof observable["watch"] == "function" && typeof observable["notify"] == "function")){
			     _throw("Is not Observable", message);
		      }
		      return true;
	       },

	       assertIsString : function(string, message){
		      if(!_isString(string)){
			     _throw("Is not String", message);
		      }
		      return true;
	       }
        };
};

Amy.StackPlugin = function(){
        return function StackPluginConstructor($uis, $destination){
	       var _stack = new Amy.Stack($uis, $destination);
	       this.getStack = function(){
		      return _stack;
	       };

	       this.destination = function(node){
		      _stack.setDestination(node);
	       };
			
	       this.hide = function(){
		      _stack.hide();
	       };

	       this.show = function(node, eventType, attribute, useCapture) {
		      node.addEventListener(eventType, function(event){
		              _stack.show(event.target.getAttribute(attribute));
		      }, (useCapture == "true"));
	       };
        };
};

Amy.EventController = function($scope, $touch){
        var Utils = Amy.TestUtils,
	      Tools = emily.Tools;
        return function EventControllerConstructor($scope, $touch){
                var _scope = ($scope instanceof Object) ? $scope : null,
	               //put in the assert liB? Il faut pouvoir lancer une exception ou non
		      _isBoolean = function(bool){
			     return (typeof bool == "boolean") ? bool : false;
		      },
		      //put in the test lib
		      _isString = function(){
			     var bool = true,l;
			     for(l = arguments.length; l>=0; l--){
				    bool = bool && (typeof arguments[l] == "string");
			     }
			     return bool;
		      },
		      _touch = _isBoolean($touch),
		      //should be a store?
		      _map = {
			     "mousedown" : "touchstart",
			     "mouseup" : "touchend",
			     "mousemove" : "touchmove"
		      };

	       this.addListener = function(node, event, callback, useCapture){
		      //errors are trigerred by addEventListener
		      node.addEventListener(this.map(event), callback, useCapture);
	       };

	       this.call = function(method){
		      _scope[method].apply(_scope, Tools.toArray(arguments).slice(1));
	       };

	       this.isTouch = function(){
		      return _touch;
	       };

	       this.setTouch = function(touch){
		      if(_isBoolean(touch)){
			     _touch = touch;
			     return true;
		      }
		      return false;
	       };

	       this.setMap = function(key, value){
		      if(_isString(key, value)){
			     _map[key] = value;
			     return true;
		      }
		      return false;

	       };

	       this.map = function(key){
		      var value = _map[key];
		      return value && _touch ? value : key;
	       };

	       this.setScope = function(scope){
		      //do we have to throw exception if not object?
		      //on utilse pour l'instance le assterIsObject que dans cet objet..le laisser dans utils?
		      //Utils.assertIsObject(scope, "Scope has to be instance of Object");
		      _scope = scope;
		      return true;

	       };

	       this.scope = function(){
		      return _scope;
	       };
        };
};

Amy.DelegatePlugin = function(){
        var Controller = Amy.EventController,
	       Utils = Amy.DomUtils;
        function DelegatePluginConstructor(){

	       //factorize useCapture?
	       this.listen = function(node, type, listener, useCapture) {
		      var that = this;
		      this.addListener(node, type, function(event){
			     that.call(listener, event, node);
		      }, (useCapture=="true"));
	       };

	       this.selector = function(node, selector, type, listener, useCapture){
		      var that = this;
		      //maper le noeur avec les event listener histoire d'optimiser le nombre de listener
		      this.addListener(node, type, function(event){
			     if(Utils.hasQuerySelector(node, event.target, selector)) {
				    that.call(listener, event, node);
			     }
		      }, (useCapture=="true"));
	       };
        };

        return function DelegatePluginFactory($scope, $touch){
	       DelegatePluginConstructor.prototype = new Controller($scope, $touch);
	       return new DelegatePluginConstructor();
        };
};

Amy.ControlPlugin =  function(){
        var Controller = Amy.EventController,
	      Utils = Amy.DomUtils;
        function ControlPluginConstructor(){

                var _current = null;

                //mettre peut être la classe
	       this.init = function(node){
		      _current = node;
	       };

	       this.radio = function(node, query, className, type, callback, useCapture){
		      var that = this;
		      this.addListener(node, type, function(event){
			     var target = event.target;
			     if(Utils.hasQuerySelector(node, target, query)) {
				    that.radioClass(target, _current, className);
				    _current = target;
				    that.call(callback, event);
			     }
		      }, (useCapture == "true"));
	       };

	       this.radioClass = function(node, previous, className){
		      node.classList.add(className);
		      if(previous && previous != node){
			     previous.classList.remove(className);
		      }
	       };

                this.toggleClass = function(node, className){
		      return node.classList.toggle(className);
	       };

                //delete listener??
	       this.toggle = function(node, query, className, type, callback, useCapture){
		      var that = this;
		      this.addListener(node, type, function(event){
			     var target = event.target;
			     if(Utils.hasQuerySelector(node, target, query)) {
				    that.toggleClass(target, className);
				    that.call(callback, event);
			     }
		      }, (useCapture == "true"));
	       };
        };

        //we don't care about arguments because it event controller whioch handle that
        return function ControlPluginFactory($scope, $touch){
	       ControlPluginConstructor.prototype = new Controller($scope, $touch);
	       return new ControlPluginConstructor();
        };
};

Amy.Stack = function Screens($uis, $default) {
        var Store = emily.Store,
	       OObject = olives.OObject,
	       Tools = emily.Tools,
	       Observer = emily.Observable;
        return function ScreensConstructor($uis, $default) {

	       var _store = new Store($uis),
		      _observer = new Observer(),
		      _destination = $default,
		      _currentName = "",
		      _currentScreen = null;
			

	       this.setDestination = function setDestination(destination) {
		      if (destination instanceof HTMLElement || destination instanceof SVGElement) {
			     _destination = destination;
			     return true;
		      } else {
			     return false;
		      }
	       };

	       this.getDestination = function getDestination() {
		      return _destination;
	       };

	       this.setCurrentScreen = function setCurrentScreen(ui) {
		      _currentScreen = ui;
		      _observer.notify("StackChange", ui);
	       };

	       this.getCurrentScreen = function getCurrentScreen() {
		      return _currentScreen;
	       };

	       this.add = function add(name, ui) {
		      if (typeof name == "string" && ui instanceof OObject) {
			     _store.set(name, ui);
			     this.hide(ui);
			     return true;
		      } else {
			     return false;
		      }
	       };

	       this.get = function get(name) {
		      return _store.get(name);
	       };
			
	       this.del = function del(name) {
		      return _store.del(name);      
	       };
			
	       this.reset = function reset(uis){
		      return _store.reset(uis);      
	       };
			
	       this.getCurrentName = function getCurrentName(){
		      return _currentName;        
	       };

	       this.show = function show(name) {
		      var ui = this.get(name);

		      if (ui && name !== _currentName) {
		              ui.place(_destination);
			     //empty string passe aussi
			     _currentScreen && this.hide(_currentScreen);
			     this.setCurrentScreen(ui);
			     _currentName = name;
			     return true;
		      } else {
			     return false;
		      }
	       };

	       this.hide = function hide(ui) {
		      ui.place(document.createDocumentFragment());
	       };
			
	       this.getObserver = function getObserver(){
		       return _observer;
	       };
        };
};

module.exports = Amy;