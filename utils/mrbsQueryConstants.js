var Query = function () {
};


Query.INSERT_INTO_MRBS_ENTRY = 'Insert into mrbs_entry ' +
    '(start_time,end_time,entry_type,repeat_id,room_id,timestamp,create_by,name,type,description) ' +
    'values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)';

Query.GET_ROOM_NAMES = 'select id,area_id,room_name,description from mrbs_room';

Query.GET_AREA = 'select * from mrbs_area';

Query.GET_MRBS_ENTRY_ID = 'select last_value from mrbs_entry_id_seq';










module.exports = Query;