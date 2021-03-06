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
    
    protected function deleteFilesFromDisk($files) {
        $obB24Disk = new \Bitrix24\Disk\Disk($this->obB24App);
        $obB24Disk -> delete($this, $files);
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
                try {
                    if ($role_id && $strictroles) {
                        $sql = 'select c.*, v.vid_zak, t.type_zak
                        from cards c 
                        join vid_zak v on c.vid_zak_id=v.id
                        join type_zak t on c.type_zak_id=t.id
                        where c.state != 80 
                        and (resp_role_id = ? or responsible = ?)
                        limit ?,?';  // 80 - archived
                        $q = $this -> pdo->prepare($sql);
                        $q->execute([$role_id, $user_id, $npage * $rcount, $rcount]);
                    } elseif($role_id) {
                        $sql = 'select c.*, v.vid_zak, t.type_zak 
                        from cards c 
                        join vid_zak v on c.vid_zak_id=v.id
                        join type_zak t on c.type_zak_id=t.id
                        where c.state != 80 
                        and (resp_role_id != ? or responsible = ?)
                        limit ?,?';  // 80 - archived
                        $q = $this -> pdo->prepare($sql);
                        $q->execute([$role_id, $user_id, $npage * $rcount, $rcount]);
                    } else { // No access here!
                        $sql = 'select c.*, v.vid_zak, t.type_zak 
                        from cards c 
                        join vid_zak v on c.vid_zak_id=v.id
                        join type_zak t on c.type_zak_id=t.id
                        where c.state != 80 and (0=1  or responsible = ?)
                        limit ?,?';  // 80 - archived
                        $q = $this -> pdo->prepare($sql);
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
                
                $sql1 = 'select * from vid_zak';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $this -> pdo->prepare($sql1);
                    $q->execute();
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;

            case 'getTypeZak':
                
                $dbname = $params['dbname'];
                $sql1 = 'select * from type_zak';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $this -> pdo->prepare($sql1);
                    $q->execute();
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
            
            case 'getArchive':
                
                $sql1 = 'select * from cards where state=80';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $this -> pdo->prepare($sql1);
                    $q->execute();
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;            
            
            case 'getRoles':                
                
                $sql1 = 'select * from roles';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $this -> pdo->prepare($sql1);
                    $q->execute();
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;

            case 'getUserRoles':                
                $sql1 = 'select * from userroles';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $this -> pdo->prepare($sql1);
                    $q->execute();
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
            
            case 'getComments':                
                
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
                    $q = $this -> pdo->prepare($sql1);
                    $q->execute([$id, $id, $user_id, $user_id]);
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
            
            case 'loadFiles':
                
                $id = $params['card_id'];
                $table = $params['table'];
                
                $sql1 = 'select * from ' . $table . '
                        where card_id=?';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $this -> pdo->prepare($sql1);
                    $q->execute([$id]);
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;

            case 'loadCoresp':
                
                $id = $params['card_id'];
                $table = 'coresp';
                
                $sql1 = 'select * from ' . $table . '
                        where card_id=?';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $this -> pdo->prepare($sql1);
                    $q->execute([$id]);
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
            
            case 'setRole':                
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
                    
                    $q = $this -> pdo->prepare($sql1);
                    $q->execute([$user]);
                    $res = $q->fetchColumn();
//$this -> log -> debug('set role 2', $res);                       
                    $sql1 = $res ? $sql3 : $sql2;
                    $q = $this -> pdo->prepare($sql1);
                    $q->execute([$role, $user]);
                    
                    $status = 'success';
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
            
            case 'getGraph':
                /// $this -> log -> debug('gg params', $params);
                $file = '../db/states.json';
                $status = 'success';
                $cmt = $file;
                try {
                    $res = json_decode(join(' ', file($file)));
                } catch (Exception $e) {
                    $status = 'error';
                    $res = $e;
                }
                break;
            
// .............................................................................
            
            case 'saveandnext':
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
                
                $new_state = $next === 'next' ? $so : $so_cur;
                
                try {
                    //  begin transaction
                    $this -> pdo->beginTransaction();
                    //if($action === 'archive' && $next === 'next') {
                    if ($resp_role_id) {
                        $sql = 'update cards set '
                                . 'state=?,nom_zak=?,link_zak=?,resp_role_id=? '
                                . 'where id=?';
                        $q = $this -> pdo->prepare($sql);
                        $q->execute([$new_state,
                            $rec['nom_zak'],
                            $rec['link_zak'],
                            $resp_role_id,
                            $id]);
                    } else { // must be ERROR!
                        $sql = 'update cards '
                                . 'set '
                                . 'state=?,nom_zak=?,link_zak=?,resp_role_id=NULL where id=?';
                        $q = $this -> pdo->prepare($sql);
                        $q->execute([$new_state, $rec['nom_zak'], $rec['link_zak'], $id]);
                    }
                    $status = 'success';

                    $today = date("Y-m-d H:i:s");
                    $msg = "$so_cur TO $so";
                    $sql = 'insert into comments (card_id, cdate, user_id, 
                        whom, private, state, msg)
                              values (?,?,?,?,?,?,?)'
                    ;
                    $q = $this -> pdo->prepare($sql);
                    $q->execute(
                            [$id, $today, $author, 0, 0, $new_state, $msg]);
                    // send messages to roles    
                    if ($nextresp) {
                        if (!is_array($nextresp)) {  // array must be ERROR!
                            $nextresp = [$nextresp];
                        }

                        foreach ($nextresp as $n) {

                            $sql = 'select id from roles where role = ?';
                            $q = $this -> pdo->prepare($sql);
                            $q->execute([$n]);
                            $res = $q->fetchAll(PDO::FETCH_ASSOC);
//$this -> log -> debug('NEXTRESP 1', [$n, $res]);                            
                            if ($res) {
                                $role_id = $res[0]['id'];
                                if ($role_id) {
                                    $sql = 'select * from userroles where role_id=?';
                                    $q = $this -> pdo->prepare($sql);
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
                    } else {
                        
                    }
                    $this -> pdo->commit();
                } catch (PDOException $e) {
                    $status = 'error';
                    $res = $e;
                    $this -> pdo->rollback();
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
                $dbname = $params['dbname'];
                $folder_id = $params['folder_id'];
                //$values = $params['values'];
                $values = $params;
                
                $coresp_list = $params['coresp_list'] ? json_decode(
                        $params['coresp_list'], true) : [];
                
                $this->log->debug('CORESP LIST', $coresp_list);
                
                $this -> pdo->beginTransaction();
                
                
                $namezak = $values['namezak'];
                $typezak = $values['typezak'];
                $zakazchik = $values['zakazchik'];
                $resp = $values['resp'];

                $res = 'n/a';
                $status = 'success';
                $cmt = $values;

                $sql = 'insert into cards '
                        . '(cdate,state,vid_zak_id, type_zak_id, nom_zak,'
                        . 'link_zak,name_zak,zakazchik,'
                        . 'deal_cat,author,responsible, resp_role_id, '
                        . 'cur_resp,date_end, '
                        . 'date_vrz,date_vpi,date_opr,nmc,sroki,etp,toz,toi) '
                        . 'values '
                        . '(?,?,?,?,?,?,?,'
                        . '?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                
                $today = date("Y-m-d H:i:s");    
                
                $dateend = $this -> reformat_date($values['dateend']);
                $date_vrz = $this -> reformat_date($values['date_vrz']);
                $date_vpi = $this -> reformat_date($values['date_vpi']);
                $date_opr = $this -> reformat_date($values['date_opr']);

                $nmc = $values['nmc'];
                $sroki = $values['sroki'];
                $etp = $values['etp'];
                $toz = $values['toz'];
                $toi = $values['toi'];
                
                
                try {
                    $q = $this -> pdo->prepare($sql);

                    $q->execute([
                        $today,
                        $values['state'],
                        $values['vidzak'],
                        $typezak,
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
                        $date_vrz, $date_vpi, $date_opr, $nmc, $sroki, $etp, $toz, $toi
                    ]);

                    $today = date("Y-m-d H:i:s");
                    $msg = "New card";
                    $id = $this -> pdo->lastInsertId();


                    foreach ($coresp_list as $co) {
                        $sql = 'insert into coresp (card_id, user_id, name)'
                                . 'values '
                                . '(?,?,?)';
                        $q = $this -> pdo->prepare($sql);
                        $q->execute([$id, $co['ID'], $co['NAME']]);
                    }
///  files
                    if (isset($_FILES)) {
                        $this->log->debug('FILES', $_FILES);

                        $obB24Disk = new \Bitrix24\Disk\Disk($this->obB24App);
                        //$this->log->debug('DISK', [$obB24Disk]);
                        // here cycle for FILES
                        $ffield = '';
                        foreach ($_FILES as $k => $v) {
                            $table = '';
                            $somefile_id = '';
                            $somefile_name = '';
                            $somefile_url = '';

                            $af = preg_split('/_/', $k);
                            if ($af[0] === 'somefile1') {
                                // somefile1 - Техзадание
                                $table = 'tzfiles';
                                $disk_file_id = $obB24Disk->getChildIdByName(
                                        $this, $folder_id, $_FILES[$k]['name']);

                                $this->log->debug('DISKFILEID', [$disk_file_id, $_FILES[$k]['name']]);

                                $res = $obB24Disk->upload(
                                        $this, $folder_id, $_FILES[$k]);
                                if (!$res) {
                                    $res = 'upload 1';
                                    $status = 'error';
                                    $cmt = '';
                                    break;
                                }

                                $somefile_id = $res['ID'];
                                $somefile_name = $res['NAME'];
                                $somefile_url = $res['DETAIL_URL'];
                            } elseif ($af[0] === 'somefile2') {
                                $table = 'dzfiles';
                                $res = $obB24Disk->upload(
                                        $this, $params['folder_id'], $_FILES[$k]);
                                if (!$res) {
                                    $res = 'upload 1';
                                    $status = 'error';
                                    $cmt = '';
                                    break;
                                }

                                $somefile_id = $res['ID'];
                                $somefile_name = $res['NAME'];
                                $somefile_url = $res['DETAIL_URL'];
                            } else {
                                //
                            }

                            if ($table) {
                                $sql = 'insert into ' . $table .
                                        ' (card_id, file_id, file_name, file_url) '
                                        . 'values '
                                        . '(?,?,?,?)';
                                $q = $this -> pdo->prepare($sql);
                                $q->execute([$id, $somefile_id, $somefile_name, $somefile_url]);
                            }
                        }
                    } else {
                        $this->log->debug('NO FILES', []);
                    }
///
                    $sql = 'insert into comments 
                        (card_id, cdate, user_id, whom, private, state, msg)
                              values (?,?,?,?,?,?,?)'
                    ;
                    $q = $this -> pdo->prepare($sql);
                    $q->execute(
                            [$id,
                                $today,
                                $values['author'], 0, 0, $values['state'], $msg]);

                    $this -> pdo->commit();

                    $sql = 'select role from roles where id = ?';
                    $q = $this -> pdo->prepare($sql);
                    $q->execute([$values['resp_role_id']]);
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    $role = 'UNDEF!';
                    if ($res) {
                        $role = $res[0]['role'];
                    }

                    $sql = 'select * from userroles where role_id=?';
                    $q = $this -> pdo->prepare($sql);
                    $q->execute([$values['resp_role_id']]);
                    $res = $q->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($res as $k => $v) {
                        $message = "YOUR ROLE is $role.\n" .
                                'You have got responsibilirty for the ato record ID ' .
                                $id;
                        $this->sendMsg($v['user_id'], $message);
                    }
                } catch (PDOException $e) {
                    $this -> pdo->rollBack();
                    $status = 'error';
                    $res = $e;
                }

                break;
            //
                
            case 'addFiles':
                $this->log->debug('ADD FILES PARAMETERS', $params);
                $dbname = $params['dbname'];
                $id = $params['id'];
                $state = $params['state'];
                $user_id = $params['user_id'];
                $folder_id = $params['folder_id'];
                $table = $params['table'];
                $coresp_list = $params['coresp_list'] ? 
                        json_decode($params['coresp_list'], true) : '';
                
                $cmt = '';
                
                $this -> pdo ->beginTransaction();
                ///  files
                try {
                    $this->log->debug('addFiles FILES', $_FILES);

                    $obB24Disk = new \Bitrix24\Disk\Disk($this->obB24App);
                    //$this->log->debug('DISK', [$obB24Disk]);
                    // here cycle for FILES
                    $ffield = '';
                    foreach ($_FILES as $k => $v) {
                        $af = preg_split('/_/', $k);
                        $res = $obB24Disk->upload(
                                $this, $folder_id, $_FILES[$k]);
                        if (!$res) {
                            $res = 'upload 1';
                            $status = 'error';
                            $cmt = '';
                            $this -> pdo ->rollBack();
                            break;
                        }

                        $somefile_id = $res['ID'];
                        $somefile_name = $res['NAME'];
                        $somefile_url = $res['DETAIL_URL'];

                        $sql = 'insert into ' . $table .
                                ' (card_id, file_id, file_name, file_url) '
                                . 'values '
                                . '(?,?,?,?)';
                        $q = $this -> pdo->prepare($sql);
                        $q->execute([$id, $somefile_id, $somefile_name, $somefile_url]);
                    }
                    
                    // TODO:
                    // add comments
                    $today = date("Y-m-d H:i:s");
                    $msg = "Files added";
                    
                    $sql = 'insert into comments 
                        (card_id, cdate, user_id, whom, private, state, msg)
                              values (?,?,?,?,?,?,?)'
                    ;
                    $q = $this -> pdo->prepare($sql);
                    $q->execute(
                            [$id,
                                $today,
                                $user_id, 0, 0, $state, $msg]);
                    
                    foreach ($coresp_list as $v) {
                        $message = "" .
                        'Files added to the ato record ID ' .
                        $id;
                        $this->sendMsg($v['user_id'], $message);
                    }
                    $this -> pdo ->commit();
                    $status = 'success';
                }
                catch(Exception $e) {
                    $this -> pdo ->rollBack();
                    $status = 'error';
                    $res = e;
                }
///                    
                break;

            case 'deleteCard':
                
                $dbname = $params['dbname'];
                $id = $params['id'];
                $author = $params['author'];
                $this -> pdo ->beginTransaction();
                $sql = 'delete from cards where id=?';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $this -> pdo->prepare($sql);
                    $q->execute([$id]);
                    
                    $sql = 'delete from comments where card_id=?';
                    
                    $q = $this -> pdo->prepare($sql);
                    $q->execute([$id]);
                    
                    // TODO: delete files from disk
                    
                    $sql = 'select file_id from tzfiles where card_id=?';
                    $q = $this -> pdo->prepare($sql);
                    $q->execute([$id]);
                    $res = $q->fetchAll(PDO::FETCH_COLUMN);
                    if($res) $this -> deleteFilesFromDisk($res);        
                            
                    $sql = 'select file_id from dzfiles where card_id=?';
                    $q = $this -> pdo->prepare($sql);
                    $q->execute([$id]);
                    $res = $q->fetchAll(PDO::FETCH_COLUMN);
                    if($res) $this -> deleteFilesFromDisk($res);        
                    
                    $sql = 'delete from tzfiles where card_id=?';
                    
                    $q = $this -> pdo->prepare($sql);
                    $q->execute([$id]);
                    $sql = 'delete from dzfiles where card_id=?';
                    
                    $q = $this -> pdo->prepare($sql);
                    $q->execute([$id]);
                    
                    $status = 'success';
                    $cmt = 'deleted';
                    
                    // TODO:
                    // add comments
                    // send messages
                                        
                    $this -> pdo ->commit();
                } catch (PDOException $e) {
                    $this -> pdo ->rollBack();
                    $status = 'error';
                    $res = $e;
                }
                break;

            case 'deleteFile':
                
                $dbname = $params['dbname'];
                $id = $params['id'];
                
                $card_id = $params['card_id'];
                $state = $params['state'];
                $user_id = $params['user_id'];
                $coresp_list = $params['coresp_list'] ? 
                        json_decode($params['coresp_list'], true) : '';
                
                $this -> pdo ->beginTransaction();
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $sql = 'delete from tzfiles where file_id=?';
                    $q = $this -> pdo->prepare($sql);
                    $q->execute([$id]);
                    $sql = 'delete from dzfiles where file_id=?';
                    $q = $this -> pdo->prepare($sql);
                    $q->execute([$id]);
                    $this ->deleteFilesFromDisk([$id]);
                    
                    $today = date("Y-m-d H:i:s");
                    $msg = "File deleted";
                    
                    $sql = 'insert into comments 
                        (card_id, cdate, user_id, whom, private, state, msg)
                              values (?,?,?,?,?,?,?)'
                    ;
                    $q = $this -> pdo->prepare($sql);
                    $q->execute(
                            [$card_id,
                                $today,
                                $user_id, 0, 0, $state, $msg]);
                    
                    foreach ($coresp_list as $v) {
                        $message = "" .
                        'File deleted from the ato record ID ' .
                        $id;
                        $this->sendMsg($v['user_id'], $message);
                    }
                    
                    
                    $this -> pdo -> commit();
                    $res = 'n/a';
                    $status = 'success';
                    $cmt = 'deleted';
                    
                } catch (PDOException $e) {
                    $this -> pdo ->rollBack();
                    $status = 'error';
                    $res = $e;
                }
                break;
                
            // options only for admin
            case 'getOptions':
                
                $dbname = $params['dbname'];
                $userId = $params['userId'];
                $this -> log->debug('userId', [$userId]);
                
                $sql = 'select * from options where userid=1';
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $this -> pdo->prepare($sql);
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
                $res = '';
                $status = '';
                $cmt = '';
                try {
                    $q = $this -> pdo->prepare($sql);
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
                try {
                    $today = date("Y-m-d H:i:s"); 
                    $sql = 'insert into comments 
                        (card_id, cdate, user_id, whom, private, state, action, msg)
                              values (?,?,?,?,?,?,?,?)'
                            ;
                        $q = $this -> pdo->prepare($sql);
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
