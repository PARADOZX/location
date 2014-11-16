<?php

require "API.php";

class LocationAPI extends API
{
	protected function mark()
	{
		try {
			$mark = new CoordsDAO($this->request);
			$mark->saveData();
		} catch (Exception $e) {
			echo $e->getMessage();
		}
	}
}

?>