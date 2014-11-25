/*global Ember*/
/*global DS*/
(function () {

  // TODO: ensure id convention between ember record id and
  //       Dropbox Datastore record id.
  DS.DBXDSSerializer = DS.JSONSerializer.extend({

    /**
      Called after `extractSingle()`. This method is normalizing records
      from Dropbox Datastore. Grouping foreign fields in payload records.
    */
    normalize: function (type, hash) {
      // TODO: attributes or fields ?
      var modelFields = Ember.get(type.typeKey.capitalize(), 'fields').keys.toArray(),
          foreignFields = {},
          newPayload;

      for (var key in hash) {
        if (!modelFields.contains(key)) {
          foreignFields[key] = hash[key];
          delete hash[key];
        }
      }

      hash['foreignFields'] = foreignFields;

      return this._super.apply(this, arguments);
    },

    extractSingle: function (store, type, payload) {
      return this.normalize(type, payload);
    },

    extractArray: function (store, type, payload) {
      return payload.map(function(obj) {
        return this.extractSingle(store, type, obj);
      }, this);
    },

    serialize: function (record, options) {
      var json = this._super.apply(this, arguments);

      json = $.extend(json, json['foreignFields']);
      delete json['foreignFields'];

      return json;
    }

  });

  DS.DBXDSAdapter = DS.Adapter.extend(Ember.Evented, {

    init: function () {
      this._super().apply(this, arguments);
      this.set('datastore', this.openDatastore());
    },

    /**
      Find single record.

      @method find
      @param {DS.Model} type
      @param {Object|String|Integer|null} id
    */
    find: function (store, type, id) {
      var adapter = this;

      return adapter.getTable(type).then(function (dbTable) {
        return Ember.RSVP.resolve(dbTable.get(id));
      }).fail(function(error) {
        return Ember.RSVP.reject(new Error("Couldn't find record of"
                                          + " type '" + type.typeKey
                                          + "' for the id '" + id + "'."));
      });
    },

    /**
      Find All record.

      @method findAll
      @param {DS.Model} type
    */
    findAll: function (store, type) {
      var adapter = this;

      return adapter.getTable(type).then(function (dbTable) {
        return Ember.RSVP.resolve(dbTable.query());
      }).fail(function(error) {
        return Ember.RSVP.reject(new Error(error));
      });
    },

    /**
      Find record with supplied string query.

      @method findAll
      @param {DS.Model} type
      @param {Object|String} query
    */
    findQuery: function (store, type, query) {
      var adapter = this;

      return adapter.getTable(type).then(function (dbTable) {
        return Ember.RSVP.resolve(dbTable.query(query));
      }).fail(function(error) {
        return Ember.RSVP.reject(new Error(error));
      });
    },

    createRecord: function (store, type, record) {
      var adapter = this;

      return adapter.getTable(type).then(function (dbTable) {
        var obj = adapter.serialize(record);
        dbTable.insert(obj);
        return Ember.RSVP.resolve();
      }).fail(function(error) {
        return Ember.RSVP.reject(new Error(error));
      });
    },

    updateRecord: function (store, type, record) {
      var adapter = this;

      return adapter.getTable(type).then(function (dbTable) {
        var dbRecord = dbTable.get(record.id),
            dbFields = adapter.serialize(record);

        // NOTE: Dropbox.Datastore will propagate current values even
        // if no local changes. To prevent echo back of remote changes
        // check if changes are made.
        if (fieldsChanged(dbFields, dbRecord.getFields())) {
          dbRecord.update(dbFields);
        }

        return Ember.RSVP.resolve();
      }).fail(function(error) {
        return Ember.RSVP.reject(new Error(error));
      });
    },

    deleteRecord: function (store, type, record) {
      var adapter = this;

      return adapter.getTable(type).then(function (dbTable) {
        var dbRecord = dbTable.get(record.id);
        dbRecord.deleteRecord();
        return Ember.RSVP.resolve();
      }).fail(function(error) {
        return Ember.RSVP.reject(new Error(error));
      });
    },

    // get Dropbox Datastore table based on pluralized Ember model type key
    getTable: function (type) {
      var datastore = this.get('datastore');

      return new Ember.RSVP.Promise(function (resolve, reject) {
        datastore.then(function (datastore) {
          var tableName = Ember.Inflector.inflector.pluralize(type.typeKey);
          resolve(datastore.getTable(tableName));
        }, function (reason) {
          reject(reason);
        });
      });
    },

    // open Dropbox Datastore
    openDatastore: function () {
      var adapter = this;

      return new Ember.RSVP.Promise(function (resolve, reject) {
        if (adapter.client.isAuthenticated()) {
          var datastoreManager = client.getDatastoreManager();
          datastoreManager.openDefaultDatastore(function (error, datastore) {
            if (error) {
              // alert('Error opening default datastore: ' + error);
              reject(error);
            } else {
              adapter.observeRemoteChanges(datastore);
              resolve(datastore);
            }
          });
        } else {
          reject("Please authenticate Dropbox.Client first.");
        }
      });
    },

    fieldsChanged: function (localFields, remoteFields) {
      for (var k in localFields) {
        if (localFields[k] != remoteFields[k]) {
          return true;
        }
      }
      return false;
    },

    // observe data at Dropbox Datastore
    observeRemoteChanges: function (datastore) {
      // TODO: find a way for not using App reference
      datastore.recordsChanged.addListener(function (event) {
        if (!event.isLocal()) {
          var dbRecords = event.affectedRecordsByTable();
          for (var dbTableName in dbRecords) {
            dbRecords[dbTableName].forEach(function (dbRecord) {
              var modelName = Ember.Inflector.inflector.singularize(dbTableName);
              // http://stackoverflow.com/a/19406357/338986
              var store = App.__container__.lookup('store:main');
              store.find(modelName, dbRecord.getId()).then(function (record) {
                if (record) {
                  if (dbRecord.isDeleted()) {
                    // delete
                    record.deleteRecord();
                  } else {
                    // update
                    record.setProperties(dbRecord.getFields());
                  }
                } else {
                  // insert
                  // NOTE: find() just get the job done. It seems nothing to do here.
                }
              });
            });
          }
        }
      });
    }

  });

}());
