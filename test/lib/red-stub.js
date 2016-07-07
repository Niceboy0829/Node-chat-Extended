var _ = require('underscore');
var ChatContext = require('../../lib/chat-context.js');

module.exports = function() {

  var _cbInput = null;
  var _type = null;
  var _factory = null;
  var _node = null;
  var _config = null;
  var _message = null;
  var _flow = {};

  var RED = {

    environment: {
      chat: function(chatId, obj) {
        var chatContext = ChatContext(chatId);
        _flow['chat:' + chatId] = chatContext;
        _(obj).map(function(value, key) {
          chatContext.set(key, value);
        });
      }
    },

    createMessage: function(payload) {
      var msg = {
        originalMessage: {
          chat: {
            id: 42
          },
          message_id: 72
        },
        payload: 'I am the original message'
      };
      if (payload != null) {
        msg.payload = payload;
      }
      return msg;
    },

    events: {
      on: function() {

      }
    },

    node: {
      config: function(config) {
        _config = config;
      },
      message: function(idx) {
        if (_.isArray(_message)) {
          return idx != null ? _message[idx] : _message[0];
        } else {
          return _message;
        }
      },
      get: function(idx) {
        return idx != null ? _node[idx] : _node;
      }
    },

    nodes: {
      registerType: function(type, factory) {
        _type = type;
        _factory = factory;
        factory(_config);
      },

      createNode: function(node, config) {

        node.on = function(eventName, cb) {
          if (eventName == 'input') {
            _cbInput = cb;
          }
        };
        node.emit = function(eventName, msg) {
          if (eventName == 'input') {
            _message = null;
            _cbInput(msg);
          }
        };
        node.send = function(msg) {
          _message = msg;
        };
        node.error = function(msg) {
          console.log(msg);
        };
        node.context = function() {
          return {
            flow: {
              get: function(key) {
                return _flow[key];
              }
            }
          };
        };
        node.wires = [{}, null];

        _node = node;

      }
    }

  };

  return RED;
};
