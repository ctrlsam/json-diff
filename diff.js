/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

var Diff = function () {

  return {

    VALUE_CREATED: 'created',
    VALUE_UPDATED: 'updated',
    VALUE_DELETED: 'deleted',
    VALUE_UNCHANGED: 'unchanged',

    // convert change diff to HTML
    formulateHTML: function(change){
      var html = '';
      
      switch(change.type){

        case this.VALUE_CREATED:
          html += '<span class="inserted">';
          html += JSON.stringify(change.newValue, null, 2);
          html += '</span>';
          break;

        case this.VALUE_DELETED:
          html += '<span class="deleted">';
          html += JSON.stringify(change.oldValue, null, 2);
          html += '</span>';
          break;

        case this.VALUE_UNCHANGED:
          html += '<span>';
          html += JSON.stringify(change.oldValue, null, 2);
          html += '</span>';
          break;

        case this.VALUE_UPDATED:
          html += '<span class="deleted">';
          html += JSON.stringify(change.oldValue, null, 2);
          html += '</span>';

          html += '<span class="inserted">';
          html += JSON.stringify(change.newValue, null, 2);
          html += '</span>';
          break;

      }

      return html;

    },

    // check if object is last one with specified change
    isTerminal: function(x) {
      return (('type' in x) && ('oldValue' in x) && ('newValue' in x));
    },

    // create string with spacing
    generateIntent: function(spacing) {
      return ' '.repeat(spacing);
    },

    // convert diff obj to html format
    toHTML: function(diff, indent=4) {

      var html = '{<br>';
      
      for (var key in diff) {
        html += this.generateIntent(indent); // add indent
        html += key + ':';                   // key:
        var value = diff[key];

        if (this.isTerminal(value)) { // base case
          html += this.formulateHTML(value) + ',<br>';
        } else {
          html += this.toHTML(value, indent + 4) + `${this.generateIntent(indent - 4)}<br>`;
        }
      }

      html += this.generateIntent(indent - 4) + '},';
      return html;
    },

    // get changes between two different objects
    map: function(obj1, obj2) {

      if (this.isFunction(obj1) || this.isFunction(obj2)) {
        throw 'Invalid argument. Function given, object expected.';
      }

      if (this.isValue(obj1) || this.isValue(obj2)) {
        return {
          type: this.compareValues(obj1, obj2),
          newValue: obj2,
          oldValue: obj1 === undefined ? obj2 : obj1
        };
      }

      var diff = {};

      for (let key in obj1) {
        if (this.isFunction(obj1[key])) {
          continue;
        }

        var value2 = undefined;
        if (obj2[key] !== undefined) {
          value2 = obj2[key];
        }

        diff[key] = this.map(obj1[key], value2);
      }
      for (let key in obj2) {
        if (this.isFunction(obj2[key]) || diff[key] !== undefined) {
          continue;
        }

        diff[key] = this.map(undefined, obj2[key]);
      }

      return diff;

    },
    
    // checks if values are different
    compareValues: function (value1, value2) {
      if (this.isArray(value1) && this.isArray(value2)){
        // to handle ([] == []) = false
        if (value1.toString() == value2.toString()) {
          return this.VALUE_UNCHANGED;
        }
      }
      if (value1 === value2) {
        return this.VALUE_UNCHANGED;
      }
      if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
        return this.VALUE_UNCHANGED;
      }
      if (value1 === undefined) {
        return this.VALUE_CREATED;
      }
      if (value2 === undefined) {
        return this.VALUE_DELETED;
      }
      return this.VALUE_UPDATED;
    },

    // helper functions
    isFunction: function (x) {
      return Object.prototype.toString.call(x) === '[object Function]';
    },
    isArray: function (x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    },
    isDate: function (x) {
      return Object.prototype.toString.call(x) === '[object Date]';
    },
    isObject: function (x) {
      return Object.prototype.toString.call(x) === '[object Object]';
    },
    isValue: function (x) {
      return !this.isObject(x);
    }
  };
}();