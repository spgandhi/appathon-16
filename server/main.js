import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
	shareWardrobe: function(email){
		user = Meteor.users.find({'emails.address': email}).fetch();
		console.log(user.length);
		if(user.length > 0){
			user = user[0];
			if(user.profile && user.profile.sharedBy){
				user.profile.sharedBy.push(Meteor.user()._id);
			}else if(user.profile && !user.profile.sharedBy){
				user.profile.sharedBy = [Meteor.user()._id]
			}else{
				user.profile = {
					sharedBy: [Meteor.user()._id]
				}
			}
		}else{
			return;
		}

		other_id = user._id;
		self_user = Meteor.user();

		if(self_user.profile && self_user.profile.sharedWith){
			self_user.profile.sharedWith.push(other_id);
		}else if(self_user.profile && !self_user.profile.sharedWith){
			self_user.profile.sharedWith = [other_id]
		}else{
			self_user.profile = {
				sharedWith: [other_id]
			}
		}


		Meteor.users.update({_id: user._id}, user);
		Meteor.users.update({_id: Meteor.user()._id}, self_user);
	}
})