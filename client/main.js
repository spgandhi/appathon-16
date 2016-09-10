import angular from 'angular';
import angularMeteor from 'angular-meteor';
 
angular.module('socially', [
    angularMeteor,
    'accounts.ui'
  ])
  .controller('PartiesListCtrl', ['$scope', function($scope) {
  	
  	$scope.answer = '';
  	$scope.newItem = {};
  	$scope.currentRatingItem = 0;
  	$scope.addItem = function(){
  		$scope.newItem.user = Meteor.user()._id;
  		Wardrobe.insert($scope.newItem);
  	}

  	$scope.fetchdata = function(){
  		$scope.items = Wardrobe.find().fetch();
  		console.log($scope.items);
  		$scope.ratings = Ratings.find().fetch(); //Condition
  		$scope.rating = $scope.ratings[$scope.currentRatingItem];
  	}

  	$scope.addRating = function(){
  		$scope.newRating.result = {
  			item1: 0,
  			item2: 0
  		}
  		Ratings.insert($scope.newRating);
  	}

  	$scope.submitRating = function(){
  		if($scope.answer=='1'){
  			$scope.rating.result.item1++;
  		}else if($scope.answer=='2'){
  			$scope.rating.result.item2++;
  		}
  		$scope.answer = '';
  		//update ratings.voted_by with user id
  		Ratings.update({_id: $scope.rating._id}, $scope.rating);
  		$scope.currentRatingItem++;
  		if($scope.currentRatingItem < $scope.ratings.length)
  			$scope.rating = $scope.ratings[$scope.currentRatingItem];
  	}

   
  }]);
