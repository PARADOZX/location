<?php

require "API.php";

class LocationAPI extends API
{
	protected function mark()
	{
		try {
			$mark = new CoordsDAO($this->request, 3);
			$mark->saveData();
		} catch (Exception $e) {
			echo $e->getMessage();
		}
	}
	protected function locate()
	{
		try {
			$locate = new CoordsDAO($this->request, 1);
			$locate->loadData();
		} catch (Exception $e) {
			echo $e->getMessage();
		}
	}
}

?>