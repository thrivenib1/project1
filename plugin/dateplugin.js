var creationInfo = function creationInfo (schema, options) {
    var dt = Date.now;
    schema.add({createdOn: {type: Date, default: dt }});
    schema.add({modifiedOn: {type: Date, default: dt}});
	schema.add({createdOn_epoch: {type: Number, default: dt}});
    schema.add({modifiedOn_epoch: {type: Number, default: dt}});
};

module.exports = creationInfo;