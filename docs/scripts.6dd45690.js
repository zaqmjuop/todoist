parcelRequire=function(e,r,n,t){function i(n,t){function o(e){return i(o.resolve(e))}function c(r){return e[n][1][r]||r}if(!r[n]){if(!e[n]){var l="function"==typeof parcelRequire&&parcelRequire;if(!t&&l)return l(n,!0);if(u)return u(n,!0);if(f&&"string"==typeof n)return f(n);var p=new Error("Cannot find module '"+n+"'");throw p.code="MODULE_NOT_FOUND",p}o.resolve=c;var a=r[n]=new i.Module(n);e[n][0].call(a.exports,o,a,a.exports,this)}return r[n].exports}function o(e){this.id=e,this.bundle=i,this.exports={}}var u="function"==typeof parcelRequire&&parcelRequire,f="function"==typeof require&&require;i.isParcelRequire=!0,i.Module=o,i.modules=e,i.cache=r,i.parent=u;for(var c=0;c<n.length;c++)i(n[c]);if(n.length){var l=i(n[n.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):t&&(this[t]=l)}return i}({7:[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},t=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}();function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var r=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB,a=window.IDBTransaction||window.webkitIDBTransaction||window.msIDBTransaction,o=window.IDBKeyRange||window.webkitIDBKeyRange||window.msIDBKeyRange,i=function(){function i(e){if(n(this,i),!r||!a||!o)throw new Error("您的浏览器不支持indexedDB");return this.name=this.name||e,this.databaseName="myEncapsulation",this}return t(i,[{key:"setDB",value:function(e){var t=this;if(!(e&&e instanceof IDBDatabase))throw new TypeError("参数应是数据库对象");return this.database=e,this.version=this.database.version,this.database.onclose=function(){t.database.isOpen=!1},e}},{key:"closeDB",value:function(){return this.database&&this.database instanceof IDBDatabase&&this.database.close()}},{key:"openDB",value:function(e){var t=this;if(e){if(!Number.isSafeInteger(e))throw new TypeError("版本号只能是整数");if(e<this.version)throw new TypeError("新版本号不能比当前版本号低")}var n=e&&Number.isSafeInteger(e)&&e>this.version?e:this.version;return this.closeDB(),new Promise(function(a,o){var i=e&&Number.isSafeInteger(e)&&e>t.version?r.open(t.databaseName,n):r.open(t.databaseName);i.onsuccess=function(){t.setDB(i.result),t.database.isOpen=!0,a(t.database)},i.onerror=function(e){o(e.target.error)},i.onupgradeneeded=function(e){t.setDB(e.target.result);var n=e.target.transaction;n.objectStoreNames.contains(t.name)||(t.database.createObjectStore(t.name,{keyPath:"id",autoIncrement:!0}),n.objectStore(t.name).createIndex("id","id",{unique:!0}))}})}},{key:"ready",value:function(){var e=this;return this.openDB().then(function(t){return e.setDB(t)})}},{key:"isReady",value:function(){return this.database&&this.database instanceof IDBDatabase&&this.database.isOpen}},{key:"addColumn",value:function(t,n){var a=this;if(!t||"string"!=typeof t)throw new TypeError("索引名称必须存在且为字符串");if(n&&"object"!==(void 0===n?"undefined":e(n)))throw new TypeError("索引选项应是对象类型");var o={};o.unique=n&&n.unique;var i=this.version+1;return this.closeDB(),new Promise(function(e,n){var s=r.open(a.databaseName,i);s.onsuccess=function(){a.setDB(s.result),a.database.isOpen=!0,e(a.database)},s.onerror=function(e){n(e.target.error)},s.onupgradeneeded=function(e){var n=e.target.result,r=e.target.transaction;a.database=n,a.version=a.database.version;var i=r&&r.objectStoreNames.contains(a.name)?r.objectStore(a.name):n.createObjectStore(a.name,{keyPath:"id",autoIncrement:!0});i.indexNames.contains("id")||i.createIndex("id","id",{unique:!0}),i.indexNames.contains(t)||i.createIndex(t,t,{unique:o.unique})}})}},{key:"deleteColumn",value:function(e){var t=this;if(!e||"string"!=typeof e)throw new TypeError("需要一个字符串类型的索引名");this.closeDB();var n=this.version+1;return new Promise(function(a,o){var i=r.open(t.databaseName,n);i.onsuccess=function(){t.setDB(i.result),t.database.isOpen=!0,a(t.database)},i.onerror=function(e){t.database=i.result,t.version=i.result.version,t.database.close(),o(e.target.error)},i.onupgradeneeded=function(n){var r=n.target.result,a=n.target.transaction;t.database=r,t.version=t.database.version;var o=a&&a.objectStoreNames.contains(t.name)?a.objectStore(t.name):r.createObjectStore(t.name,{keyPath:"id",autoIncrement:!0});o.indexNames.contains("id")||o.createIndex("id","id",{unique:!0}),o.indexNames.contains(e)&&o.deleteIndex(e)}})}},{key:"addColumns",value:function(t){var n=this;if(!(t&&t instanceof Array))throw new TypeError("列名组应该是一个数组");var a=[];t.forEach(function(t){var n=void 0===t?"undefined":e(t);if("string"===n)a.push({index:t,unique:!1});else{if("object"!==n)throw new TypeError("索引列格式错误");a.push({index:t.index,unique:t.unique})}}),this.closeDB();var o=this.version+1;return new Promise(function(e,t){var i=r.open(n.databaseName,o);i.onsuccess=function(){n.setDB(i.result),n.database.isOpen=!0,e(n.database)},i.onerror=function(e){n.database=i.result,n.version=i.result.version,n.database.close(),t(e.target.error)},i.onupgradeneeded=function(e){var t=e.target.result,r=e.target.transaction;n.database=t,n.version=n.database.version;var o=r&&r.objectStoreNames.contains(n.name)?r.objectStore(n.name):t.createObjectStore(n.name,{keyPath:"id",autoIncrement:!0});o.indexNames.contains("id")||o.createIndex("id","id",{unique:!0}),a.forEach(function(e){o.indexNames.contains(e.index)||o.createIndex(e.index,e.index,{unique:e.unique})}),n.database=t}})}},{key:"deleteColumns",value:function(e){var t=this;if(!(e&&e instanceof Array))throw new TypeError("需要一个包含索引名的数组");e.forEach(function(e){if(!e||"string"!=typeof e)throw new TypeError("索引名不是字符串类型")}),this.closeDB();var n=this.version+1;return new Promise(function(a,o){var i=r.open(t.databaseName,n);i.onsuccess=function(){t.setDB(i.result),t.database.isOpen=!0,a(t.database)},i.onerror=function(e){t.database=i.result,t.version=i.result.version,t.database.close(),o(e.target.error)},i.onupgradeneeded=function(n){var r=n.target.result,a=n.target.transaction;t.database=r,t.version=t.database.version;var o=a&&a.objectStoreNames.contains(t.name)?a.objectStore(t.name):r.createObjectStore(t.name,{keyPath:"id",autoIncrement:!0});o.indexNames.contains("id")||o.createIndex("id","id",{unique:!0}),e.forEach(function(e){o.indexNames.contains(e)&&o.deleteIndex(e)})}})}},{key:"deleteItem",value:function(e){if(!Number.isSafeInteger(e))throw new TypeError("参数只能是目标数据的id属性值");if(!this.isReady())throw new Error("数据库尚未准备好");var t=this.database.transaction(this.name,"readwrite").objectStore(this.name);return new Promise(function(n,r){var a=t.delete(e);a.onsuccess=function(){n(a.result)},a.onerror=function(e){r(e.target.error)}})}},{key:"deleteItems",value:function(e){var t=this;if(!(e instanceof Array)||0===e.length)throw new TypeError("参数只能是目标数据的id属性值组成的数组且不能为空");e.forEach(function(e){if(!Number.isSafeInteger(e))throw new TypeError("id属性值应是整数")});var n=this.ready();return e.forEach(function(e){n=n.then(function(){return t.deleteItem(e)})}),n}},{key:"delete",value:function(e){var t=Number.isSafeInteger(e),n=e instanceof Array;if(!t&&!n)throw new TypeError("参数只能是目标数据的id属性值或由id组成的数组");var r=void 0;return t?r=this.deleteItem(e):n&&(r=this.deleteItems(e)),r}},{key:"setItem",value:function(t){if(!t||"object"!==(void 0===t?"undefined":e(t)))throw new TypeError("参数只能是一个对象");if(void 0!==t.id&&!Number.isSafeInteger(t.id))throw new TypeError("参数的id属性只能为整数");if(!this.isReady())throw new Error("数据库尚未准备好");var n=this.database.transaction(this.name,"readwrite").objectStore(this.name);return new Promise(function(e,r){var a=n.put(t);a.onsuccess=function(){e(a.result)},a.onerror=function(e){r(e.target.error)}})}},{key:"setItems",value:function(t){var n=this;if(!(t&&t instanceof Array))throw new TypeError("参数应是一个数组");if(t.forEach(function(t){if(!t||"object"!==(void 0===t?"undefined":e(t)))throw new TypeError("参数只能是一个对象")}),!this.isReady())throw new Error("数据库尚未准备好");var r=this.ready();return t.forEach(function(e){r=r.then(function(){return n.setItem(e)})}),r}},{key:"set",value:function(t){var n=t instanceof Array,r="object"===(void 0===t?"undefined":e(t));if(!r&&!n)throw new TypeError("参数只能是目标数据的id属性值或由id组成的数组");var a=void 0;return n?a=this.setItems(t):r&&(a=this.setItem(t)),a}},{key:"getItem",value:function(e){if(!Number.isSafeInteger(e))throw new TypeError("参数只能是目标数据的id属性值");if(!this.isReady())throw new Error("数据库尚未准备好");var t=this.database.transaction(this.name,"readwrite").objectStore(this.name);return new Promise(function(n,r){var a=t.get(e);a.onsuccess=function(){n(a.result)},a.onerror=function(e){r(e.target.error)}})}},{key:"getItems",value:function(e){if(!(e instanceof Array)||0===e.length)throw new TypeError("参数只能是目标数据的id属性值组成的数组且不能为空");e.forEach(function(e){if(!Number.isSafeInteger(e))throw new TypeError("id属性值应是整数")});var t=e.sort(),n=o.bound(t[0],t[t.length-1]);if(!this.isReady())throw new Error("数据库尚未准备好");var r=this.database.transaction(this.name,"readwrite").objectStore(this.name);return new Promise(function(e,t){var a=r.getAll(n);a.onsuccess=function(){e(a.result)},a.onerror=function(e){t(e.target.error)}}).then(function(e){var n=[];return e.forEach(function(e){t.includes(e.id)&&n.push(e)}),n})}},{key:"get",value:function(e){var t=Number.isSafeInteger(e),n=e instanceof Array;if(!t&&!n)throw new TypeError("参数只能是目标数据的id属性值或由id组成的数组");var r=void 0;return t?r=this.getItem(e):n&&(r=this.getItems(e)),r}},{key:"getAll",value:function(e){var t=e||"id";if("string"!=typeof t)throw new TypeError("索引名只能是字符串");if(!this.isReady())throw new Error("数据库尚未准备好");var n=this.database.transaction(this.name,"readwrite").objectStore(this.name).index(t);return new Promise(function(e,t){var r=n.getAll();r.onsuccess=function(){e(r.result)},r.onerror=function(e){t(e.target.error)}})}},{key:"findItems",value:function(t){if(!t||"object"!==(void 0===t?"undefined":e(t)))throw new TypeError("参数应该是一个对象");if(!this.isReady())throw new Error("数据库尚未准备好");var n=this.database.transaction(this.name,"readwrite").objectStore(this.name),r=Object.keys(t),a=n.index(r[0]),i=o.only(t[r[0]]);return new Promise(function(e,t){var n=a.getAll(i);n.onsuccess=function(){e(n.result)},n.onerror=function(e){t(e.target.error)}}).then(function(e){var n=[];return e.forEach(function(e){var a=1;r.forEach(function(n){e[n]!==t[n]&&(a=0)}),a&&n.push(e)}),n})}}],[{key:"openDB",value:function(e){if(!e||"string"!=typeof e)throw new TypeError("数据库名不能为"+e);return new Promise(function(t,n){var a=r.open(e);a.onsuccess=function(){var e=a.result;e.isOpen=!0,e.onclose=function(){e.isOpen=!1},t(e)},a.onerror=function(e){return n(e.target.error)}})}}]),i}();exports.default=i;
},{}],6:[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=void 0,t=require("./store"),n=r(t);function r(e){return e&&e.__esModule?e:{default:e}}var i=new n.default("Missions");i.create=function(e){return i.set(e)},i.save=function(e){return i.set(e)},i.init=function(){return 1===i.init?e:(i.init=1,i.ready().then(function(){return i.addColumns(["date","content","order"])}))},i.init(),exports.default=i;
},{"./store":7}],4:[function(require,module,exports) {
"use strict";var e=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),t=require("./indexeddb/missions"),n=r(t);function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var o=function(e){return e instanceof KeyboardEvent&&13===e.keyCode},a=function(e){return e&&1===e.nodeType},u=function(e){return e&&"string"==typeof e},d=function(e){return!!a(e)&&e.parentNode},s=function(e){if(!a(e))return!1;for(var t=[],n=e,r=0;r<999&&(n=d(n),a(n));r+=1)t.push(n);return t},m={i:0,getIndex:function(){return m.i+=1,m.i}},l=function(){function t(e){if(i(this,t),"string"==typeof e){var n=e.match(/^<(.+)>$/);if(!n)return document.querySelectorAll(e);var r=n[1].toLocaleUpperCase();this.dom=document.createElement(r)}else if(e instanceof t)this.dom=e.dom;else{if(!a(e)&&e!==document)throw console.warn(e),new TypeError("无效参数");this.dom=e}return this}return e(t,[{key:"attr",value:function(e,t){if(!e||!u(e))throw new TypeError("没有key参数");var n=this;return void 0!==t?this.dom.setAttribute(e,""+t):n=this.dom.getAttribute(e),n}},{key:"addClass",value:function(e){var t=this;if(!e||"string"!=typeof e)throw new TypeError("参数应该是字符串");return e.split(" ").forEach(function(e){return t.dom.classList.add(e)}),this}},{key:"removeClass",value:function(e){var t=this;if(!e||"string"!=typeof e)throw new TypeError("参数应该是字符串");return e.split(" ").forEach(function(e){return t.dom.classList.remove(e)}),this}},{key:"hasClass",value:function(e){if(!e||"string"!=typeof e)throw new TypeError("参数应该是字符串");return this.dom.classList.contains(e)}},{key:"append",value:function(e){var n=e instanceof t?e.dom:e;if(!n||1!==n.nodeType)throw new TypeError("参数不是html元素");return this.dom.appendChild(n),this}},{key:"remove",value:function(e){if(e){if(a(e))this.dom.removeChild(e);else if(u(e)){var t=this.dom.querySelector(e);this.dom.removeChild(t)}}else this.dom.remove();return this}},{key:"text",value:function(e){return this.dom.innerText=e,this}},{key:"html",value:function(e){return this.dom.innerHTML=e,this}},{key:"find",value:function(e){return this.dom.querySelector(e)}},{key:"children",value:function(e){return this.dom.querySelectorAll(e)}},{key:"parent",value:function(){var e=this.dom.parentNode;return e&&1===e.nodeType?e:void 0}},{key:"parents",value:function(e){var t=s(this.dom),n=[];e&&u(e)?document.querySelectorAll(e).forEach(function(e){t.includes(e)&&n.push(e)}):n=t;return n}},{key:"on",value:function(e,t){return this.dom.addEventListener(e,t),this}},{key:"off",value:function(e,t){return this.dom.removeEventListener(e,t),this}}],[{key:"of",value:function(e){return new t(e)}}]),t}(),f=l.of;window.$=f;var c=function(){function t(){i(this,t)}return e(t,null,[{key:"prepareBox",value:function(){if(!document.body)throw new ReferenceError("页面加载未完成");var e=f("#alert-box")[0];return e||(e=f("<div>").attr("id","alert-box").dom,f(document.body).append(e)),e}},{key:"alert",value:function(e){if(!e)throw new TypeError("参数不能为"+e);if(!document.body)throw new ReferenceError("页面加载未完成");var n=t.prepareBox(),r=f("<div>").addClass("alert"),i=f("<span>").attr("name","message").html(e),o=f("<span>").attr("name","buttons"),a=f("<a>").attr("name","cancal").text("隐藏");return a.on("click",function(){r.dom.remove()}),o.append(a),r.append(i).append(o),f(n).append(r),r}},{key:"confirm",value:function(e,n,r){if(!e)throw new TypeError("参数不能为"+e);if(!document.body)throw new ReferenceError("页面加载未完成");var i=t.prepareBox(),o=f("<div>").addClass("confirm"),a=f("<span>").attr("name","message").html(e),d=f("<span>").attr("name","buttons"),s=f("<a>").attr("name","submit").text("确定");u(r)&&s.text(r);var m=f("<a>").attr("name","cancal").text("隐藏");return n&&"function"==typeof n&&s.on("click",n),m.on("click",function(){o.dom.remove()}),d.append(m),o.append(a).append(d),f(i).append(o),o}}]),t}(),h=function(){function t(){if(i(this,t),this.element=document.querySelector("#mission"),this.listElement=document.querySelector("#mission-list"),this.formElement=document.querySelector("#mission-form"),this.adderElement=document.querySelector("#add-mission"),!(this.element&&this.listElement&&this.formElement&&this.adderElement))throw new ReferenceError("界面元素不完整");return this.init(),this.loadDB(),this.counter=1,this}return e(t,[{key:"loadDB",value:function(){var e=this;return n.default.ready().then(function(){return n.default.getAll()}).then(function(n){n.sort(function(e,t){return Number(e.order)-Number(t.order)}).forEach(function(n){var r=t.createMissionItem(n.content,n.date,n.id);f(r).attr("order",n.order),f(e.listElement).append(r)})}),this}},{key:"init",value:function(){var e=this;if(1===this.init)return!1;var t=f(this.adderElement).find("*[name=open-form]");f(t).on("click",function(){var t=f(e.adderElement).parent();e.listElement.querySelectorAll(".mission-item").forEach(function(e){return f(e).removeClass("hide")}),t.insertBefore(e.formElement,e.adderElement),f(e.formElement).find("input[name=content]").value="",f(e.formElement).find("input[name=date]").value="",f(e.formElement).find("*[name=submit]").innerText="添加任务",f(e.formElement).attr("data-item-id","").removeClass("hide")});var n=f(this.formElement).find("button[name=submit]");f(n).on("click",function(){f(e.formElement).attr("data-item-id")?e.updateMission():e.createMission()}),f(this.formElement).children("input").forEach(function(e){f(e).on("keypress",function(e){o(e)&&n.click()})});var r=f(this.formElement).find("*[name=hide-form]");return f(r).on("click",function(){f(e.formElement).addClass("hide");var t=f(e.formElement).attr("data-item-id"),n=f("#"+t)[0];f(n).removeClass("hide")}),f(this.listElement).children("*[name=finish]").forEach(function(e){f(e).on("click",function(){var t=f(e).parents(".mission-item")[0];f(t).remove()})}),this.initDocument(),this.init=1,this}},{key:"initDocument",value:function(){var e=this;return!document.supportMission&&(document.ondragover=function(e){e.preventDefault()},document.ondrop=function(e){var t=e.dataTransfer.getData("Text").match(/^item-\d+$/),n=t&&t[0];if(u(n)){var r=f("#"+n)[0];if(!r)return!1;f(r).removeClass("item-curtain").attr("draggable","false")}return!0},document.ondragend=function(){e.listElement.querySelectorAll(".mission-item").forEach(function(e){f(e).removeClass("item-curtain").attr("draggable","false")});var t=f(e.listElement).attr("drag"),r=Number(t.match(/^item-(\d+)$/)[1]),i=f("#"+t)[0],o=i.previousElementSibling,u=i.nextElementSibling,d=0,s=0;if(a(o)){var m=f(o).attr("order"),l=Number(m);if(!m)throw new ReferenceError(o+" 没有order属性");d=l}if(a(u)){var h=f(u).attr("order"),v=Number(h);h?s=v:(e.counter+=1,s=e.counter)}var p=(d+s)/2;n.default.ready().then(function(){return n.default.get(r)}).then(function(e){var t=e;return t.order=p,n.default.set(t)}).then(function(){f(i).attr("order",p),c.alert("位置已改变")}),f(e.listElement).attr("drag","")},f(document).on("click",function(t){if(f(e.formElement).hasClass("hide"))return!1;var n=t.path,r=f(e.formElement).find("*[name=hide-form]"),i=!1;return n.forEach(function(t){a(t)&&e.element.isSameNode(t)&&(i=!0)}),i||r.click(),i}),document.supportMission=1,this)}},{key:"createMission",value:function(){var e=this,r=this.formElement,i=f(r).find("input[name=content]");if(!i.value)return!1;var o=f(r).find("input[type=date]");this.counter+=1;var a={content:i.value,date:o.value,order:this.counter};return n.default.ready().then(function(){return n.default.create(a)}).then(function(n){var r=t.createMissionItem(i.value,o.value,n);i.value="",o.value="",f(e.listElement).append(r)}),f(this.formElement).attr("data-item-id",""),this}},{key:"updateMission",value:function(){var e=this,t=f(this.formElement).attr("data-item-id");if(!t)return!1;var r=f("#"+t)[0];if(!r)throw new ReferenceError("找不到#"+t+"元素");var i=f(this.formElement).find("input[name=content]"),o=f(this.formElement).find("input[name=date]"),a=i.value,u=o.value,d={id:Number(t.match(/^item-(\d+)$/)[1]),content:a,date:u};return n.default.ready().then(function(){return n.default.save(d)}).then(function(){f(r).find("*[name=content]").innerText=a,f(r).find("*[name=date]").innerText=u,f(r).removeClass("hide"),i.value="",o.value="",f(e.formElement).addClass("hide")}),this}}],[{key:"isElementComplete",value:function(){var e=document.querySelector("#mission"),t=document.querySelector("#mission-list"),n=document.querySelector("#mission-form"),r=document.querySelector("#add-mission");return e&&t&&n&&r}},{key:"transformItem",value:function(e){if(!a(e)||!e.classList.contains("mission-item"))throw new TypeError("不是任务列表的子元素");var t=f(e).parent(),n=e.nextSibling,r=f("#mission-form")[0],i=f(e).find("*[name=content]").innerText,o=f(e).find("*[name=date]").innerText,u=t.querySelectorAll(".mission-item"),d=f(r).find("*[name=submit]");return u.forEach(function(t){t.id!==e.id&&f(t).removeClass("hide")}),f(e).addClass("hide"),t.insertBefore(r,n),f(r).removeClass("hide").attr("data-item-id",e.id),f(r).find("input[name=content]").value=i,f(r).find("input[name=date]").value=o,f(d).text("保存"),r}},{key:"createMissionItem",value:function(e,r,i){if(!t.isElementComplete())throw new ReferenceError("界面元素不完整");var o=f("<li>").addClass("mission-item").attr("id","item-"+i),a=f("<div>").addClass("item-before"),u=f("<i>").addClass("fa fa-arrows"),d=f("<div>").addClass("item-left"),s=f("<div>").addClass("item-right"),m=f("<i>").addClass("fa fa-circle-o item-icon fa-lg").attr("name","finish"),l=f("<span>").attr("name","content").text(e),c=f("<span>").attr("name","date").addClass("text-sm-center").text(r),h=f("<a>").append(m);return window.link=h,u.on("mousedown",function(){o.attr("draggable","true")}),l.on("click",function(){t.transformItem(o.dom)}),h.on("click",function(){n.default.ready().then(function(){return n.default.delete(i)}).then(function(){return o.remove()})}),o.on("dragstart",function(e){var t=o.parent();f(t).attr("drag",o.dom.id),e.dataTransfer.setData("Text",o.dom.id),o.addClass("item-curtain")}),o.on("dragover",function(e){e.preventDefault();var t=o.parent(),n=o.dom.nextSibling,r=f(t).attr("drag"),i=f(t).find("#"+r),a={itemIndex:0,dragIndex:0},u=t.children;u.forEach=Array.prototype.forEach,u.forEach(function(e,t){o.dom.isSameNode(e)&&(a.itemIndex=t),i.isSameNode(e)&&(a.dragIndex=t)});var d=a.dragIndex>a.itemIndex?o.dom:n;t.insertBefore(i,d)}),o.on("drop",function(e){e.preventDefault();var t=o.parent(),n=o.dom.nextSibling,r=e.dataTransfer.getData("Text"),i=f(t).find("#"+r),a=i.nextSibling;t.insertBefore(o.dom,a),t.insertBefore(i,n),f(i).removeClass("item-curtain").attr("draggable","false")}),a.append(u),d.append(h).append(l),s.append(c),o.append(a).append(d).append(s),o.dom}},{key:"getElement",value:function(){return document.querySelector("#mission")}}]),t}();document.addEventListener("DOMContentLoaded",function(){var e=new h;window.mission=e,e.createMission(),window.show=function(){return n.default.ready().then(function(){return n.default.getAll()}).then(function(e){return console.log(e)})}});
},{"./indexeddb/missions":6}]},{},[4], null)
//# sourceMappingURL=/scripts.6dd45690.map