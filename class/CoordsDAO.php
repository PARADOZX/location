<?php




//MAKE THIS A DAO OBJECT... LOOK IT UP www.sitecrafting.com/blog/php-patterns-part-ii
//THE DAO OBJECT CAN CREATE THE VO OBJECT (VALUE OBJECT-- which holds the values of the retrieved data from the DB).
//alternatively this can be the more complicated ORM (did not research this yet...)
class CoordsDAO
{
	private $pdo;
	private $request;

	function __construct($request)
	{
		//confirm 3 parameters in request
		if (count($request) === 3) {
			//confirm each parameter holds a value
			foreach ($request as $key => $value) {
				if ($value == '') throw new Exception('Error retrieving location data.  Please try again.');
			}

			$this->request = $request;	

			try {
				$this->pdo = new PDO('mysql:dbname=location;host=localhost','root','Shiet1sv');
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
				echo "Location saved.";
			}
		} catch (PDOException $e){
			echo 'ERROR::' . $e->getMessage();
		}
	}
}




?>