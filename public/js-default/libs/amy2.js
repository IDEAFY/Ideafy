/**
 * https://github.com/Ideafy/Ideafy
 * Proprietary License - All rights reserved
 * Authors: Olivier Wietrich <Olivier.Wietrich@gmail.com> & Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY
 */
var olives = require("./olives"),
      emily = require("./emily"),
      Tools = emily.Tools,
      Store = emily.Store,
      Observer = emily.Observable,
      OObject = olives.OObject,
      Amy = {};
       
var hasQuerySelector = function(parent, node, selector) {
        var getNodes = function(el, sel) {
                         if (el instanceof HTMLElement || el instanceof SVGElement) {
                                if (!el.parentNode) {
                                        document.createDocumentFragment().appendChild(el);
                                }
                                return el.parentNode.querySelectorAll(sel || "*");
                        }
                        else {
                                return false;
                        }
                };
        return Tools.toArray(getNodes(parent, selector)).indexOf(node) > -1;
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

Amy.StackPlugin = function StackPluginConstructor($uis, $destination){
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

Amy.EventController = function EventControllerConstructor($scope, $touch){
        var Utils = Amy.TestUtils,
              _scope = ($scope instanceof Object) ? $scope : null,
              _isBoolean = function(bool){
		      return (typeof bool == "boolean") ? bool : false;
	       },
	       _isString = function(){
	               var bool = true,l;
		      for(l = arguments.length; l>=0; l--){
			     bool = bool && (typeof arguments[l] == "string");
		      }
		      return bool;
	       },
	       _touch = _isBoolean($touch),
	       _map = {
		      "mousedown" : "touchstart",
		      "mouseup" : "touchend",
		      "mousemove" : "touchmove"
	       };

        this.addListener = function(node, event, callback, useCapture){
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
	       _scope = scope;
	       return true;
        };

        this.scope = function(){
	       return _scope;
        };
};

var DelegatePluginConstructor = function(){
        //factorize useCapture?
        this.listen = function(node, type, listener, useCapture) {
                var that = this;
                this.addListener(node, type, function(event){that.call(listener, event, node);}, (useCapture=="true"));
        };

        this.selector = function(node, selector, type, listener, useCapture){
	       var that = this;
	       //maper le noeur avec les event listener histoire d'optimiser le nombre de listener
	       this.addListener(node, type, function(event){
		      if(hasQuerySelector(node, event.target, selector)) that.call(listener, event, node);
	       }, (useCapture=="true"));
        };
};

Amy.DelegatePlugin = function DelegatePluginFactory($scope, $touch){
        DelegatePluginConstructor.prototype = new Amy.EventController($scope, $touch);
        return new DelegatePluginConstructor();
};
        
var ControlPluginConstructor =  function(){
        var _current = null;
              
        this.init = function(node){
	       _current = node;
        };

        this.radio = function(node, query, className, type, callback, useCapture){
	       var that = this;
	       this.addListener(node, type, function(event){
	               var target = event.target;
		      if(hasQuerySelector(node, target, query)) {
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

        this.toggle = function(node, query, className, type, callback, useCapture){
	       var that = this;
	       this.addListener(node, type, function(event){
		      var target = event.target;
		      if(hasQuerySelector(node, target, query)) {
		              that.toggleClass(target, className);
			     that.call(callback, event);
		      }
	       }, (useCapture == "true"));
        };
};
        
Amy.ControlPlugin = function ControlPluginFactory($scope, $touch){
	       ControlPluginConstructor.prototype = new Amy.EventController($scope, $touch);
	       return new ControlPluginConstructor();
};

Amy.Stack = function ScreensConstructor($uis, $default) {

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

module.exports = Amy;