var Query = function () {
};

Query.GET_ESS_QUESTIONS = "SELECT * FROM survey ORDER  BY left(ques_code, 1), substring(ques_code, '\\d+')::int NULLS FIRST, ques_code";
Query.GET_ESS_RATINGS = 'select * from rating order by rat_code,rat_value';
Query.GET_ESS_IMPORTANCE = 'select * from importance order by imp_code';
Query.GET_ESS_ATTITUDE = 'select * from attitude order by att_code';
Query.INSERT_ESS_RATING_AND_IMPORTANCE = 'insert into survey_ques ($,$,$,$,) values ()';
Query.GET_ESS_REFNUM = 'select inc from inc';
Query.INSERT_ESS_SURVEY_QUE_DUMMY_RATING = 'Insert into survey_ques_dummy (ref_no ,login,rate_imp, a1 , a2 , b1 , b2 , b3 , b4 ,b5, c1 , c2 , c3 , c4 , c5 , c6 , d1 , d2 , e1 , e2 , e3 , e4 , e5 , e6 ,e7, h1 , h2 , h3 , h4 ,h5, i1 , i2 , i3 ,i4,i5, j1 , j2 , k1 , k2 ,k3,k4,k5, l1 , l2 , l3 ,l4,l5,l6, m1 , m2 , m3 , m4 , m5 , m6 , m7 , m8 , m9 , m10 , m11 , n1 , n2 , n3 ,n4) ' +
    'values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,'+
    '$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,$62,$63)';
Query.INSERT_ESS_SURVEY_QUE_DUMMY_IMPORTANT = 'Insert into survey_ques_dummy (ref_no ,login,rate_imp, a1 , a2 , b1 , b2 , b3 , b4 ,b5, c1 , c2 , c3 , c4 , c5 , c6 , d1 , d2 , e1 , e2 , e3 , e4 , e5 , e6 ,e7, h1 , h2 , h3 , h4 ,h5, i1 , i2 , i3 ,i4,i5, j1 , j2 , k1 , k2 ,k3,k4,k5, l1 , l2 , l3 ,l4,l5,l6, m1 , m2 , m3 , m4 , m5 , m6 , m7 , m8 , m9 , m10 , m11 , n1 , n2 , n3 ,n4) ' +
    'values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,'+
    '$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,$62,$63)';

Query.INSERT_ESS_SURVEY_COM_DUMMY = 'Insert into survey_com_dummy (ref_no,attitude,comments1,comments2,comments3,comments4) values($1,$2,$3,$4,$5,$6)';
Query.INSERT_ESS_SURVEY_COM = 'Insert into survey_com (ref_no,sur_date,attitude,comments1,comments2,comments3,comments4) values($1,$2,$3,$4,$5,$6,$7)';


Query.INSERT_ESS_SURVEY_QUE_RATING = 'Insert into survey_ques (ref_no,a1,a2,b1,b2,b3,b4,c1,c2,c3,c4,c5,c6,d1,d2,e1,e2,e3,e4,e5,e6,h1,h2,h3,h4,i1,i2,i3,j1,j2,k1,k2,l1,l2,l3,m1,m2,m3,m4,m5,m6,m7,m8,m9,m10,m11,n1,n2,n3,rate_imp,login,b5,e7,k3,k4,n4,h5,i4,i5,l4,l5,l6,k5) ' +
    'values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,'+
    '$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,$62,$63)';
Query.INSERT_ESS_SURVEY_QUE_IMPORTANT = 'Insert into survey_ques (ref_no,a1,a2,b1,b2,b3,b4,c1,c2,c3,c4,c5,c6,d1,d2,e1,e2,e3,e4,e5,e6,h1,h2,h3,h4,i1,i2,i3,j1,j2,k1,k2,l1,l2,l3,m1,m2,m3,m4,m5,m6,m7,m8,m9,m10,m11,n1,n2,n3,rate_imp,login,b5,e7,k3,k4,n4,h5,i4,i5,l4,l5,l6,k5) ' +
    'values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,'+
    '$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,$62,$63)';

Query.GET_QUE_BY_QUE_CODE = 'select * from survey where ques_code in ($1)';
Query.UPDATE_ESS_REFNUM = 'update inc set inc=$1';

Query.SELECT_ESS_SURVEY_QUE_DUMMY_RATING = 'select * from survey_ques_dummy where ref_no=$1 and rate_imp=$2';
Query.SELECT_ESS_SURVEY_QUE_DUMMY_IMPORTANT = 'select * from survey_ques_dummy where ref_no=$1 and rate_imp=$2';
Query.UPDATE_ESS_POLL_FLAG = 'update survey_com set poll=$1 where ref_no=$2';
Query.DELETE_ESS_SURVEY_QUES_DUMMY = 'delete from survey_ques_dummy  where ref_no=$1';
Query.SELECT_FROM_SURVEY_COM_DUMMY = 'select * from survey_com_dummy  where ref_no=$1';
Query.DELETE_ESS_SURVEY_COM_DUMMY = 'delete from survey_com_dummy  where ref_no=$1';








module.exports = Query;