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
    deal_cat integer not null,
    nom_zak varchar(24),
    link_zak varchar(120),
    name_zak varchar(120),
    zakazchik varchar(60),
    nmc integer,
    sroki varchar(60),
    tz varchar(24),
    etp varchar(60),
    author integer not null,
    responsible integer not null,
    resp_role_id integer,
    cur_resp integer not null,
    date_end date,
    somefile1 integer,
    f1_name varchar(255),
    f1_url varchar(255),
    somefile2 integer,
    f2_name varchar(255),
    f2_url varchar(255)
)";

$sql2 = "create table if not exists  archive (
    id integer primary key autoincrement,
    cdate datetime,
    state integer not null,    
    vid_zak_id integer not null,
    deal_cat integer not null,
    nom_zak varchar(24),
    link_zak varchar(120),
    name_zak varchar(120),
    zakazchik varchar(60),
    nmc integer,
    sroki varchar(60),
    tz varchar(24),
    etp varchar(60),
    author integer not null,
    responsible integer not null,
    cur_resp integer not null,
    date_end date,
    arch_date date,
    arch_state integer
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
    insert into vid_zak (vid_zak) values ('vid1');
    insert into vid_zak (vid_zak) values ('vid2');
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


$pdo = new PDO( "sqlite:../db/$dbname.sq3");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
try {
    $pdo -> exec($sql0);
    $pdo -> exec($sql00);
    
    $pdo -> exec($sql1);
    $pdo -> exec($sql2);
    $pdo -> exec($sql3);
    $pdo -> exec($sql30);
    $pdo -> exec($sql4);
    $pdo -> exec($sql5);
    $pdo -> exec($sql6);
    $pdo -> exec($sql7);
    $pdo -> exec($sql8);
    $pdo -> exec($sql9);

} catch(PDOException $e) {
    echo "Error: ".$e;
    return $e;
}
return 'ok';

}
