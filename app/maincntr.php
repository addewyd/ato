<?php

mb_internal_encoding("UTF-8");

require __DIR__ . '/../vendor/autoload.php';
require_once '../defines.php';

require_once '../app/Auxb24.php';
require_once 'b24disk.php';
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

// create a log channel
$log = new Logger('ato');
$log->pushHandler(new StreamHandler(LOG_DIR, Logger::DEBUG));
$log->debug('start', [HTTP_HOST]);

class Maincntr extends AuxBase {

    //public function __construct($log) {
      //  $this->log = $log;
    //}

    public function returnResult($answer) {

        ob_start();
        ob_end_clean();
        Header('Cache-Control: no-cache');
        Header('Pragma: no-cache');
        header('Content-type: application/json; charset=UTF-8');
        echo json_encode($answer);
    }
    
    public function sendMsg($userid, $msg) {
        $m = new Auxb24($this -> log, $_REQUEST);
        $m -> sendMsg($userid, $msg);
    }

    public function manage($operation, $params) {
        
        $this->log->debug('operation', [$operation]);
        switch ($operation) {
            case 'getGridData':
                $res = '';
                $status = '';
                $cmt = '';
                
                $dbname = $params['dbname'];
                $npage = $params['npage'];
                $rcount = $params['rcount'];
                $role_id = $params['role_id'];
                $user_id = $params['user_id'];
                $strictroles = $params['strictroles'];
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                try {
                    if ($role_id && $strictroles) {
                        $sql = 'select c.*, v.vid_zak from cards c 
                        join vid_zak v on c.vid_zak_id=v.id
                        where c.state != 80 
                        and (resp_role_id = ? or responsible = ?)
                        limit ?,?';  // 80 - archived
                        $q = $pdo->prepare($sql);
                        $q->execute([$role_id, $user_id, $npage * $rcount, $rcount]);
                    } elseif($role_id) {
                        $sql = 'select c.*, v.vid_zak from cards c 
                        join vid_zak v on c.vid_zak_id=v.id
                        where c.state != 80 
                        and (resp_role_id != ? or responsible = ?)
                        limit ?,?';  // 80 - archived
                        $q = $pdo->prepare($sql);
                        $q->execute([$role_id, $user_id, $npage * $rcount, $rcount]);
                    } else { // No access here!
                        $sql = 'select c.*, v.vid_zak from cards c 
                        join vid_zak v on c.vid_zak_id=v.id
                        where c.state != 80 and (0=1  or responsible = ?)
                        limit ?,?';  // 80 - archived
                        $q = $pdo->prepare($sql);
                        $q->execute([$user_id, $npage * $rcount, $rcount]);
                        
                    }
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                    $cmt = json_encode($params);
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
            
            case 'getVZak':
                
                $dbname = $params['dbname'];
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                $sql1 = 'select * from vid_zak';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $pdo->prepare($sql1);
                    $q->execute();
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;

            case 'getArchive':
                
                $dbname = $params['dbname'];
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                $sql1 = 'select * from cards where state=80';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $pdo->prepare($sql1);
                    $q->execute();
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;            
            
            case 'getRoles':                
                $dbname = $params['dbname'];
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                $sql1 = 'select * from roles';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $pdo->prepare($sql1);
                    $q->execute();
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;

            case 'getUserRoles':                
                $dbname = $params['dbname'];
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                $sql1 = 'select * from userroles';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $pdo->prepare($sql1);
                    $q->execute();
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
            
            case 'getComments':                
                $dbname = $params['dbname'];
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                $id = $params['id'];
                $user_id = $params['user_id'];
                
                $sql1 = 'select * from comments 
                        where (card_id=? 
                        and 
                        private = 0)
                        or 
                        (card_id=? and private=1 and (user_id=? or whom=?))
                        order by cdate desc';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $pdo->prepare($sql1);
                    $q->execute([$id, $id, $user_id, $user_id]);
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
            
            case 'setRole':                
                $dbname = $params['dbname'];
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$this -> log -> debug('set role', $params);                
                $user = $params['user'];
                $role = $params['role'];
                if(!$role) {
                    $role = '0';
                }
                
                $sql1 = 'select count(*) from userroles where user_id=?';
                $sql2 = 'insert into userroles (role_id, user_id) values (?,?)';
                $sql3 = 'update userroles set role_id=? where user_id=?';
                
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    
                    $q = $pdo->prepare($sql1);
                    $q->execute([$user]);
                    $res = $q->fetchColumn();
//$this -> log -> debug('set role 2', $res);                       
                    $sql1 = $res ? $sql3 : $sql2;
                    $q = $pdo->prepare($sql1);
                    $q->execute([$role, $user]);
                    
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
            
            case 'getGraph':
                $this -> log -> debug('gg params', $params);
                $file = '../db/states.json';
                $status = 'success';
                $cmt = $file;
                //$res = file_get_contents($file);
                $res = json_decode(join(' ', file($file)));
                break;

            case 'saveandnext':
                $dbname = $params['dbname'];
                $next = $params['next'];
                $so = $params['so'];
                $so_cur = $params['so_cur'];
                $id = $params['id'];
                $state = $params['state'];
                $author = $params['author'];
                $rec = $params['rec'];
                $nextresp = $params['nextresp'];
                $resp_role_id = $params['resp_role_id'];

                $action = $state['action'];

                $res = 'n/a';
                $status = 'none';
                $cmt = 'none';
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                $new_state = $next === 'next' ? $so : $so_cur;
                
                try {
                    //  begin transaction
                    $pdo->beginTransaction();
                    //if($action === 'archive' && $next === 'next') {
                        if($resp_role_id) {
                            $sql = 'update cards set '
                                    . 'state=?,nom_zak=?,link_zak=?,resp_role_id=? '
                                    . 'where id=?';
                            $q = $pdo->prepare($sql);
                            $q->execute([$new_state, 
                                $rec['nom_zak'], 
                                $rec['link_zak'], 
                                $resp_role_id,
                                $id]);
                            
                        }
                        else { // must be ERROR!
                            $sql = 'update cards set state=?,nom_zak=?,link_zak=?,resp_role_id=NULL where id=?';
                            $q = $pdo->prepare($sql);
                            $q->execute([$new_state, $rec['nom_zak'], $rec['link_zak'], $id]);
                        }
                        $status = 'success';
                        
                    //}
                    //else {
                    //    $sql = 'update cards set state=?,nom_zak=?,link_zak=? where id=?';
                    //    $q = $pdo->prepare($sql);
                    //    $q->execute([$new_state, $rec['nom_zak'], $rec['link_zak'], $id]);
                    //    $status = 'success';
                    //}
                    $today = date("Y-m-d H:i:s"); 
                    $msg = "$so_cur TO $so";
                    $sql = 'insert into comments (card_id, cdate, user_id, 
                        whom, private, state, msg)
                              values (?,?,?,?,?,?,?)'
                            ;
                        $q = $pdo->prepare($sql);
                        $q->execute(
                                [$id, $today, $author, 0, 0, $new_state, $msg]);
                    // send messages to roles    
                    if($nextresp) {
                        if(!is_array($nextresp)) {  // array must be ERROR!
                            $nextresp = [$nextresp];
                        }
                        
                        foreach ($nextresp as $n) {

                            $sql = 'select id from roles where role = ?';
                            $q = $pdo->prepare($sql);
                            $q->execute([$n]);
                            $res = $q->fetchAll(PDO::FETCH_ASSOC);
//$this -> log -> debug('NEXTRESP 1', [$n, $res]);                            
                            if ($res) {
                                $role_id = $res[0]['id'];
                                if ($role_id) {
                                    $sql = 'select * from userroles where role_id=?';
                                    $q = $pdo->prepare($sql);
                                    $q->execute([$role_id]);
                                    $res = $q->fetchAll(PDO::FETCH_ASSOC);

                                    foreach ($res as $k => $v) {
                                        $message = "YOUR ROLE is $n.\n" .
                                                'You have got responsibilirty for the ato record ID ' .
                                                $rec['id'];
                                        $this->sendMsg($v['user_id'], $message);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        
                    }
                    $pdo->commit();
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                    $pdo->rollback();
                }
                
                break;

            case 'savenew':
                $this->log->debug('SAVE PARAMETERS', $params);
                $somefile1_id = '';
                $somefile1_name = '';
                $somefile1_url = '';
                $somefile2_id = '';
                $somefile2_name = '';
                $somefile2_url = '';
                
                if(isset($_FILES)) {
                    $this->log->debug('FILES', $_FILES);
                    
                    $obB24Disk = new \Bitrix24\Disk\Disk($this->obB24App);
                    //$this->log->debug('DISK', [$obB24Disk]);
                    if(isset($_FILES['somefile1'])) {
                        // somefile1 - Техзадание
                        $res = $obB24Disk -> upload(
                                $this, $params['folder_id'],$_FILES['somefile1']);
                        if(!$res) {
                            $res = 'upload 1';
                            $status = 'error';
                            $cmt = '';
                            break;
                        }                   
                    
                        $somefile1_id = $res['ID'];
                        $somefile1_name = $res['NAME'];
                        $somefile1_url = $res['DOWNLOAD_URL'];
                    }

                    if(isset($_FILES['somefile2'])) {
                        $res = $obB24Disk -> upload(
                                $this, $params['folder_id'],$_FILES['somefile2']);
                        if(!$res) {
                            $res = 'upload 1';
                            $status = 'error';
                            $cmt = '';
                            break;
                        }                   
                    
                        $somefile2_id = $res['ID'];
                        $somefile2_name = $res['NAME'];
                        $somefile2_url = $res['DOWNLOAD_URL'];
                    }
                    
                } else {
                    $this->log->debug('NO FILES', []);    
                }
                $dbname = $params['dbname'];
                //$values = $params['values'];
                $values = $params;
                
                $namezak = $values['namezak'];
                $zakazchik = $values['zakazchik'];
                $resp = $values['resp'];

                $res = 'n/a';
                $status = 'success';
                $cmt = $values;

                $sql = 'insert into cards '
                        . '(cdate,state,vid_zak_id, nom_zak,'
                        . 'link_zak,name_zak,zakazchik,'
                        . 'deal_cat,author,responsible, resp_role_id, '
                        . 'cur_resp,date_end,somefile1, f1_url,f1_name,'
                        . 'somefile2, f2_url,f2_name) '
                        . 'values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $today = date("Y-m-d H:i:s");                                 
                $dateend = $this -> reformat_date($values['dateend']);
                
                try {
                    $q = $pdo->prepare($sql);

                    $q->execute([
                        $today,
                        $values['state'],
                        $values['vidzak'],
                        $values['nomzak'],
                        $values['linkzak'],
                        $namezak,
                        $zakazchik,
                        $values['dealcat'],
                        $values['author'],
                        $resp,
                        $values['resp_role_id'],
                        $values['resp'],
                        $dateend,
                        $somefile1_id,
                        $somefile1_url,
                        $somefile1_name,
                        $somefile2_id,
                        $somefile2_url,
                        $somefile2_name
                    ]);
                
                    $today = date("Y-m-d H:i:s"); 
                    $msg = "New card";
                    $id = $pdo ->lastInsertId();
                    
                    $sql = 'insert into comments (card_id, cdate, user_id, whom, private, state, msg)
                              values (?,?,?,?,?,?,?)'
                            ;
                        $q = $pdo->prepare($sql);
                        $q->execute(
                                [$id, 
                                    $today, 
                                    $values['author'], 0, 0, $values['state'], $msg]);                        
                    
                    $sql = 'select role from roles where id = ?';
                    $q = $pdo->prepare($sql);
                    $q->execute([$values['resp_role_id']]);
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $role = 'UNDEF!';
                    if($res) {
                        $role = $res[0]['role'];
                    }
                    
                    $sql = 'select * from userroles where role_id=?';
                    $q = $pdo->prepare($sql);
                    $q->execute([$values['resp_role_id']]);
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($res as $k => $v) {
                        $message = "YOUR ROLE is $role.\n" .
                                'You have got responsibilirty for the ato record ID ' .
                                $id;
                        $this->sendMsg($v['user_id'], $message);
                    }
                                    
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                
                break;
            //

            case 'deleteCard':
                
                $dbname = $params['dbname'];
                $id = $params['id'];
                $author = $params['author'];
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                $sql = 'delete from cards where id=?';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $pdo->prepare($sql);
                    $q->execute([$id]);
                    
                    $sql = 'delete from comments where card_id=?';
                    
                    $q = $pdo->prepare($sql);
                    $q->execute([$id]);
                    
                    
                    $status = 'success';
                    $cmt = 'deleted';
                    
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
                        
            // options only for admin
            case 'getOptions':
                
                $dbname = $params['dbname'];
                $userId = $params['userId'];
                $this -> log->debug('userId', [$userId]);
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                $sql = 'select * from options where userid=1';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $pdo->prepare($sql);
                    $q->execute();
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
            
            case 'saveOptions':
                $dbname = $params['dbname'];
                $userId = $params['userId'];
                $folder_id = $params['folder_id'];
                $strictroles = $params['strictroles'];
                $this -> log ->debug('userId', [$userId]);
                $sql = 'update options set folder_id=?, strictroles=? where userid=1';
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $pdo->prepare($sql);
                    $q->execute([$folder_id, $strictroles]);
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                
                $res = 'n/a';
                $status = 'success';
                $cmt = 'none';
                break;
            
            case 'saveMessage':
                $dbname = $params['dbname'];
                $author = $params['author'];
                $author_name = $params['user_name'];
                $id = $params['id'];
                $state = $params['state'];
                $whom = $params['whom'];
                $private = $params['private'];
                $message = $params['message'];
                $action = $params['action'];
                
                $res = 'n/a';
                $status = 'success';
                $cmt = 'none';
                $pdo = new PDO("sqlite:../db/$dbname.sq3");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                try {
                    $today = date("Y-m-d H:i:s"); 
                    $sql = 'insert into comments 
                        (card_id, cdate, user_id, whom, private, state, action, msg)
                              values (?,?,?,?,?,?,?,?)'
                            ;
                        $q = $pdo->prepare($sql);
                        $q->execute(
                                [
                                    $id, 
                                    $today, 
                                    $author, $whom, 
                                    $private, $state, $action, $message]);
                        
                        if($private && $whom) {
                            
                            $msg = 'New private message from ATO ' .
                                    "Card Id $id <br /> Author id $author name $author_name <br /> Text $message";
                            $this -> sendMsg($whom, $msg);                            
                        }
                
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
                
            default:
                $res = 'unknown op';
                $status = 'error';
                $cmt = $operation;
                break;
        }
        $this->returnResult(array('status' => $status, 'result' => $res, 'cmt' => $cmt));
    }
}

$manager = new Maincntr($log, $_REQUEST);

if (!empty($_REQUEST) && isset($_REQUEST['operation'])) {
    $manager->manage($_REQUEST['operation'], $_REQUEST);
}
?>
