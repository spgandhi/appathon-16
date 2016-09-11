import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
 
import WardrobeTemplate from '/client/wardrobe.html';
import WardrobeAddTemplate from '/client/wardrobe-add.html';
import RatingAddTemplate from '/client/rating-add.html';
import HomeTemplate from '/client/home.html';
import toaster from 'angularjs-toaster'
import WardrobeShareTemplate from '/client/wardrobe-share.html';
import AccountsTemplate from '/client/accounts.html';

import RatingTemplate from '/client/ratings.html';

var app = angular.module('socially', [
    angularMeteor,
    'accounts.ui',
    'ui.router',
    toaster
  ]);

app.config(function($stateProvider, $urlRouterProvider) {
  
  var home = {
    name: 'home',
    url: '/home',
    templateUrl: HomeTemplate,
    controller: 'Home',
    
  }

  var wardrobeAdd = {
    name: 'wardrobe-add',
    url: '/wardrobe/add',
    templateUrl: WardrobeAddTemplate,
    controller: 'WardrobeAdd',
    
  }

  var wardrobe = {
    name: 'Wardrobe',
    url: '/wardrobe/view/:id',
    templateUrl: WardrobeTemplate,
    controller: 'Wardrobe',
    
  }

  var wardrobeShare = {
      name: 'WardrobeShare',
      url: '/wardrobe/share',
      templateUrl: WardrobeShareTemplate,
      controller: 'WardrobeShare',
      
  }


  var ratingAdd = {
    name: 'RatingAdd',
    url: '/rating/add',
    templateUrl: RatingAddTemplate,
    controller: 'RatingAdd',
    
  }

  var rating = {
    name: 'Rating',
    url: '/rating',
    templateUrl: RatingTemplate,
    controller: 'Rating',
   
  }

  var accounts = {
    name: 'accounts',
    url: '/accounts',
    templateUrl: AccountsTemplate
  }

  $stateProvider.state(accounts);
  $stateProvider.state(home);
  $stateProvider.state(wardrobe);
  $stateProvider.state(wardrobeAdd);
  $stateProvider.state(ratingAdd);
  $stateProvider.state(rating);
  $stateProvider.state(wardrobeShare);

  $urlRouterProvider.otherwise("/home");

  
});

app.controller('WardrobeShare', ['$scope', '$location', 'toaster', function ($scope, $location, toaster) {
  console.log(Meteor.user());
  
  $scope.toWardrobe  = function(){
    console.log('to wardrovbe');
    $location.path('/wardrobe/view/'+Meteor.user()._id);
  }

  $scope.fetchData = function(){
    $scope.sharedBy = Meteor.user().profile.sharedBy;
    $scope.sharedWith = Meteor.user().profile.sharedWith;
    console.log($scope.sharedWith);
  }

  $scope.shareWardrobe = function(){
    console.log($scope.shareWardrobeWith);
    Meteor.call('shareWardrobe', $scope.shareWardrobeWith);
    toaster.pop('success',"Success","Shared");
  }
    
}])

app.controller('Wardrobe', ['$scope', '$stateParams', function ($scope, $stateParams) {

  $scope.fetchData = function(){
    requested_user = Meteor.users.find({_id: $stateParams.id}).fetch();
    if(requested_user.length == 0){
      $scope.message = 'User does not exist';
      return;
    }

    // $scope.wardrobeUser = requested_user[0].emails[0].address;
    
    if($stateParams.id == Meteor.user()._id){
      $scope.items = Wardrobe.find({user: $stateParams.id}).fetch();
      if($scope.items.length == 0)
        $scope.message = "No Wardrobe items";
    }else{
      if(Meteor.user().profile && Meteor.user().profile.sharedBy.indexOf($stateParams.id) > -1){
        $scope.items = Wardrobe.find({user: $stateParams.id}).fetch();
      }else{
        $scope.message = 'Not Allowed';
      }
    }
    console.log($scope.items);  
  }
  

}])

app.controller('WardrobeAdd', ['$scope', 'toaster', function ($scope, toaster) {
  console.log('in add');
  $scope.newItem = {};
  $scope.addItem = function(){
      
      console.log($scope.newItem);
      if($scope.newItem.name === undefined || $scope.newItem.type === undefined || $scope.newItem.url === undefined ||  $scope.newItem.name == '' || $scope.newItem.type=='' || $scope.newItem.url==''){ 
        toaster.pop('error', "Error", "please fill all the fields"); 
        return;
      }

      $scope.newItem.user = Meteor.user()._id;
      Wardrobe.insert($scope.newItem);
      toaster.pop('success', "Success", "Item Added");
      $scope.newItem = {};
    }
}])

app.controller('RatingAdd', ['$scope', 'toaster', function ($scope, toaster) {
  console.log('in raitng');
  $scope.newRating = {};

  $scope.addRating = function(){
    

    
    if($scope.newRating.question === undefined || $scope.newRating.url1 === undefined || $scope.newRating.url2 === undefined || $scope.newRating.question=='' || $scope.newRating.url1=='' || $scope.newRating.url2==''){ 
      toaster.pop('error', "Error", "please fill all the fields"); 
      return;
    }
    
    $scope.newRating.result = {
      user: Meteor.user()._id,
      item1: 0,
      item2: 0,
      voted_by : [] //end time
    }

    Ratings.insert($scope.newRating);
    toaster.pop('success', "Success", "added");
    $scope.newRating = {};
  }
}])

app.controller('Home', ['$scope', 'toaster', function($scope, toaster) {
    $scope.answer = '';
    $scope.noMorePosts=false;

    $scope.currentRatingItem = 0;

    $scope.fetchData = function(){
      $scope.ratings = Ratings.find({'result.voted_by': { "$nin" : [Meteor.user()._id]} }).fetch(); //Condition
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
      }else{
        toaster.pop('error', "Error", 'Please select an option!');
        return;
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

   
  }]);

app.run(run);

function run($rootScope, $state) {
  'ngInject';
 
  $rootScope.$on('$stateChangeError',
    (event, toState, toParams, fromState, fromParams, error) => {
      console.log('erroe');
      console.log(error);
      if (error === 'AUTH_REQUIRED') {
        $state.go('accounts');
      }
    }
  );
}

app.controller('Main', ['$scope', '$stateParams', '$location', function ($scope, $stateParams, $location) {
  
}])

app.controller('Rating', ['$scope', '$stateParams', '$location', function ($scope, $stateParams, $location) {
    $scope.fetchData = function(){
      $scope.ratings = Ratings.find({'result.user': Meteor.user()._id}).fetch();
    }
}])