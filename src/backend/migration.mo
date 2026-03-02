import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldUser = {
    id : Nat;
    name : Text;
    mobile : Text;
    upiId : Text;
    referralCode : Text;
    referredByCode : ?Text;
    registrationStatus : Text;
    walletBalance : Nat;
    createdAt : Nat;
    ancestors : [Nat];
  };

  type OldActor = {
    users : Map.Map<Nat, OldUser>;
    // Other old state variables can be added here
  };

  type NewUser = {
    id : Nat;
    name : Text;
    mobile : Text;
    upiId : Text;
    referralCode : Text;
    referredByCode : ?Text;
    registrationStatus : Text;
    walletBalance : Nat;
    createdAt : Nat;
    ancestors : [Nat];
    utrId : ?Text;
  };

  type NewActor = {
    users : Map.Map<Nat, NewUser>;
    // Other new state variables can be added here
  };

  public func run(old : OldActor) : NewActor {
    let newUsers = old.users.map<Nat, OldUser, NewUser>(
      func(_id, oldUser) {
        {
          oldUser with
          utrId = null;
        };
      }
    );
    { users = newUsers };
  };
};
