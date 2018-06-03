<?php
$dbname = 'test';
$pdo = new PDO( "sqlite:../db/$dbname.sq3");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


$sql1 = "
    drop table if exists vid_zak;
    create table if not exists vid_zak (
    id integer primary key autoincrement,
    vid_zak varchar(60)
)";

$sql2 ="
    insert into vid_zak (vid_zak) values ('vid1');
    insert into vid_zak (vid_zak) values ('vid2');
"; 




try {
    $pdo -> exec($sql1);
    $pdo -> exec($sql2);

} catch(PDOException $e) {
    echo "Error: ".$e;
    return $e;
}
    return 'ok';

