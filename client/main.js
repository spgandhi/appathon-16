import angular from 'angular';
import angularMeteor from 'angular-meteor';
 
import WardrobeTemplate from '/client/wardrobe.html';
import WardrobeAddTemplate from '/client/wardrobe-add.html';
import RatingAddTemplate from '/client/rating-add.html';
import HomeTemplate from '/client/home.html';

var app = angular.module('socially', [
    angularMeteor,
    'accounts.ui',
    'ui.router'
  ]);

app.config(function($stateProvider) {
  
  var home = {
    name: 'home',
    url: '/home',
    templateUrl: HomeTemplate,
    controller: 'Home'
  }

  var wardrobeAdd = {
    name: 'wardrobe-add',
    url: '/wardrobe/add',
    templateUrl: WardrobeAddTemplate,
    controller: 'WardrobeAdd'
  }

  var wardrobe = {
    name: 'Wardrobe',
    url: '/wardrobe/view/:id',
    templateUrl: WardrobeTemplate,
    controller: 'Wardrobe'
  }

  var ratingAdd = {
    name: 'RatingAdd',
    url: '/rating/add',
    templateUrl: RatingAddTemplate,
    controller: 'RatingAdd'
  }

  $stateProvider.state(home);
  $stateProvider.state(wardrobe);
  $stateProvider.state(wardrobeAdd);
  $stateProvider.state(ratingAdd);

  
});

app.controller('Wardrobe', ['$scope', '$stateParams', function ($scope, $stateParams) {
  requested_user = Meteor.users.find({_id: $stateParams.id}).fetch();
  if(requested_user.length == 0){
    $scope.message = 'User does not exist';
    return;
  }
  
  if($stateParams.id == Meteor.user()._id){
    $scope.items = Wardrobe.find({user: $stateParams.id}).fetch();
    if($scope.items.length == 0)
      $scope.message = "No wardrobe items";
  }else{
    if(Meteor.user().profile && Meteor.user().profile.sharedBy.indexOf($stateParams.id) > -1){
      $scope.items = Wardrobe.find({user: $stateParams.id}).fetch();
    }else{
      $scope.message = 'Not Allowed';
    }
  }
  console.log($scope.items);

}])

app.controller('WardrobeAdd', ['$scope', function ($scope) {
  console.log('in add');
  $scope.newItem = {};
  $scope.addItem = function(){
      $scope.newItem.user = Meteor.user()._id;
      Wardrobe.insert($scope.newItem);
      $scope.newItem = {};
    }
}])

app.controller('RatingAdd', ['$scope', function ($scope) {
  console.log('in raitng');
  $scope.addRating = function(){
    $scope.newRating.result = {
      item1: 0,
      item2: 0,
      voted_by : [] //end time
    }
    Ratings.insert($scope.newRating);
    $scope.newRating = {};
  }
}])

app.controller('Home', ['$scope', function($scope) {
    console.log('in home');
    $scope.answer = '';
    $scope.noMorePosts=false;

    $scope.currentRatingItem = 0;

    $scope.fetchdata = function(){
      $scope.ratings = Ratings.find({voted_by: { "$ne" : Meteor.user()._id} }).fetch(); //Condition
      if($scope.ratings.length == 0){
        $scope.noMorePosts=true;
        return;
      }

      console.log($scope.ratings);
      $scope.rating = $scope.ratings[$scope.currentRatingItem];

    }

    $scope.submitRating = function(){
      if($scope.answer=='1'){
        $scope.rating.result.item1++;
      }else if($scope.answer=='2'){
        $scope.rating.result.item2++;
      }
      $scope.answer = '';
      $scope.rating.result.voted_by.push(Meteor.user()._id);
      //update ratings.voted_by with user
      Ratings.update({_id: $scope.rating._id}, $scope.rating);
      $scope.currentRatingItem++;
      if($scope.currentRatingItem < $scope.ratings.length)
        $scope.rating = $scope.ratings[$scope.currentRatingItem];
      else
         $scope.noMorePosts=true;
    }

    $scope.shareWardrobe = function(){
      console.log($scope.shareWardrobeWith);
      Meteor.call('shareWardrobe', $scope.shareWardrobeWith);
    }

   
  }]);
