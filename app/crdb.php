<?php
function createdb($dbname, $ai, $ac) {

$sql0 = "create table if not exists  codes (
    ai varchar(120),
    ac varchar(120))";
$sql00=
    "insert into codes (ai, ac) values ('" . $ai . "','" . $ac . "')";
        
    

$sql1 = "create table if not exists  cards (
    id integer primary key autoincrement,
    cdate datetime,
    state integer not null,    
    vid_zak_id integer not null,
    type_zak_id integer not null,
    deal_cat integer not null,
    nom_zak varchar(24),
    link_zak varchar(120),
    name_zak varchar(120),
    zakazchik varchar(60),
    nmc integer,
    sroki varchar(60),
    etp varchar(60),
    author integer not null,
    responsible integer not null,
    resp_role_id integer,
    cur_resp integer not null,
    date_end datetime,
    date_vrz datetime,
    date_vpi datetime,
    date_opr datetime,
    etp varchar(40),
    toz integer,
    toi integer
)";

$sql3 = "create table if not exists options (
    userid integer not null,
    folder_id integer not null,
    strictroles integer not null
)";

$sql30 ="
    insert into options (userid, folder_id, strictroles) values (1,1,0);
"; 

$sql4 = "
    drop table if exists vid_zak;
    create table if not exists vid_zak (
    id integer primary key autoincrement,
    vid_zak varchar(60)
)";

$sql5 ="
    insert into vid_zak (vid_zak) values ('аукцион');
    insert into vid_zak (vid_zak) values ('конкурс');
    insert into vid_zak (vid_zak) values ('запрос предложений/цен');
    insert into vid_zak (vid_zak) values ('запрос котировок');
    insert into vid_zak (vid_zak) values ('предварительный квалификационный отбор');
"; 


$sql6 = "
        drop table if exists roles;
        create table roles (
        id integer primary key autoincrement,
        role varchar(60)
        )";

$sql7 = "
    insert into roles (role) values ('role1');
    insert into roles (role) values ('role2');
INSERT INTO  roles (id, role) VALUES (3, 'buh');
INSERT INTO  roles (id, role) VALUES (4, 'admin');
INSERT INTO roles (id, role) VALUES (5, 'manager');
INSERT INTO roles (id, role) VALUES (6, 'team leader');
"; 

$sql8 = "
        create table userroles (
        user_id integer not null,
        role_id integer not null
        )";

$sql9 =
"create table comments (
    card_id integer not null,
    cdate datetime,
    user_id integer,
    whom integer,
    private integer,
    ctype integer,
    state integer,
    action varchar(32),
    msg varchar(2000)
    )";  
// ctype - privatemsg, comment or state change

$sqlA = "
    drop table if exists type_zak;
    create table if not exists type_zak (
    id integer primary key autoincrement,
    type_zak varchar(60)
)";

$sqlA1 ="
    insert into type_zak (type_zak) values ('Тендер');
    insert into type_zak (type_zak) values ('Рабочий Проект');
    insert into type_zak (type_zak) values ('Пред Проект');
    insert into type_zak (type_zak) values ('Экспертиза');
"; 


$sqlB = "
    drop table if exists tzfiles;
    create table if not exists tzfiles (
    card_id integer not null,
    file_id integer not null,
    file_name varchar(255),
    file_url varchar(255)
)";
$sqlC = "
    drop table if exists dzfiles;
    create table if not exists dzfiles (
    card_id integer not null,
    file_id integer not null,
    file_name varchar(255),
    file_url varchar(255)
)";

$sqlC = "
    drop table if exists coresp;
    create table if not exists coresp (
    user_id integer not null,
    card_id integer not null,
    name varchar(60)
)";


$pdo = new PDO( "sqlite:../db/$dbname.sq3");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
try {
    $pdo -> exec($sql0);
    $pdo -> exec($sql00);
    
    $pdo -> exec($sql1);
//    $pdo -> exec($sql2);
    $pdo -> exec($sql3);
    $pdo -> exec($sql30);
    $pdo -> exec($sql4);
    $pdo -> exec($sql5);
    $pdo -> exec($sql6);
    $pdo -> exec($sql7);
    $pdo -> exec($sql8);
    $pdo -> exec($sqlA);
    $pdo -> exec($sqlA1);
    $pdo -> exec($sqlB);
    $pdo -> exec($sqlC);

} catch(PDOException $e) {
    echo "Error: ".$e;
    return $e;
}
return 'ok';

}
