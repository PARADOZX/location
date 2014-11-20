<?php

//MAKE THIS A DAO OBJECT... LOOK IT UP www.sitecrafting.com/blog/php-patterns-part-ii
//THE DAO OBJECT CAN CREATE THE VO OBJECT (VALUE OBJECT-- which holds the values of the retrieved data from the DB).
//alternatively this can be the more complicated ORM (did not research this yet...)
class CoordsDAO
{
	private $pdo;
	private $request;

	function __construct($request, $num_param)
	{
		//confirm correct # of parameters in request
		if (count($request) === $num_param) {
			//confirm each parameter holds a value
			foreach ($request as $key => $value) {
				if ($value == '') throw new Exception('Error retrieving location data.  Please try again.');
			}

			$this->request = $request;	

			try {
				//localhost DB path
				$this->pdo = new PDO('mysql:dbname=location;host=localhost','root','Shiet1sv') or die('FAILED CONNECTION');
				//hosting DB path
				// $this->pdo = new PDO('mysql:dbname=byjames1_location;host=localhost','byjames1_ling','Shiet1sv') or die('FAILED CONNECTION');

				$this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			} catch (PDOException $e){
				echo "Error : " + $e->getMessage();
			}
		} else throw new Exception('Error retrieving location data.  Please try again.');
	}
	public function saveData()
	{
		try {
			$stmt = $this->pdo->prepare("SELECT userID from users WHERE username = ?");
			$stmt->execute(array($this->request['user']));
			$count = $stmt->rowCount();

			//if user doesn't exist create a new user and set userID to last inserted ID.
			if ($count === 0) {
				$stmt = $this->pdo->prepare("INSERT INTO users (username) VALUES (?)");
				$stmt->execute(array($this->request['user']));
				$userID = $this->pdo->lastInsertId();
			//otherwise set userID 
			} else {
				$result = $stmt->fetch();
				$userID = $result['userID'];
			}

			$q = "INSERT INTO locations (userID, lon, lat) VALUES (?, ?, ?)";
			$stmt = $this->pdo->prepare($q);
			if ($stmt->execute(array($userID, $this->request['long'], $this->request['lat']))){
				echo true;
			}
		} catch (PDOException $e){
			echo 'ERROR::' . $e->getMessage();
		}
	}
	public function loadData()
	{
		try {
			$stmt = $this->pdo->prepare("SELECT username FROM users WHERE username = ?");
			$stmt->execute(array($this->request['user']));
			$count = $stmt->rowCount();
			if ($count > 0) {
				$stmt = $this->pdo->prepare("SELECT lon, lat FROM locations as l INNER JOIN users as u ON l.userID = u.userID WHERE username = ?");
				$stmt->execute(array($this->request['user']));
				$results_array = array();

				while ($result = $stmt->fetch()){
					$results_array[] = array('lon'=>$result['lon'], 'lat'=>$result['lat']);
				}			
				echo json_encode($results_array);
			} else {
				echo "Username not found.";
			}
		} catch (PDOException $e) {
			echo 'ERROR::' . $e->getMessage();
		}
	}
}




?>