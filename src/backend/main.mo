import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";
import List "mo:core/List";

(with migration = Migration.run)
actor {
  type User = {
    id : Nat;
    name : Text;
    mobile : Text;
    upiId : Text;
    referralCode : Text;
    referredByCode : ?Text;
    registrationStatus : Text; // "pending" or "confirmed"
    walletBalance : Nat; // in paise
    createdAt : Nat;
    ancestors : [Nat];
    utrId : ?Text;
  };

  type Video = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    videoUrl : Text;
    thumbnailUrl : Text;
    uploadedAt : Nat;
  };

  type WalletTransaction = {
    id : Nat;
    userId : Nat;
    amount : Nat;
    description : Text;
    timestamp : Nat;
  };

  type WithdrawalRequest = {
    id : Nat;
    userId : Nat;
    amount : Nat;
    upiId : Text;
    status : Text; // "pending", "approved", "rejected"
    requestedAt : Nat;
    resolvedAt : ?Nat;
  };

  public type UserProfile = {
    userId : Nat;
    name : Text;
  };

  let users = Map.empty<Nat, User>();
  let videos = Map.empty<Nat, Video>();
  let walletTransactions = Map.empty<Nat, WalletTransaction>();
  let withdrawalRequests = Map.empty<Nat, WithdrawalRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let principalToUserId = Map.empty<Principal, Nat>();

  var userIdCounter = 0;
  var videoIdCounter = 0;
  var transactionIdCounter = 0;
  var withdrawalRequestIdCounter = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    principalToUserId.add(caller, profile.userId);
  };

  public shared ({ caller }) func registerUser(name : Text, mobile : Text, upiId : Text, referralCode : ?Text) : async Text {
    // Prevent anonymous registration
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot register");
    };

    if (name.size() == 0 or mobile.size() == 0 or upiId.size() == 0 or mobile.size() != 10) {
      Runtime.trap("Invalid user data");
    };

    if (principalToUserId.containsKey(caller)) {
      Runtime.trap("Already registered");
    };

    userIdCounter += 1;
    let newUserId = userIdCounter;
    let newReferralCode = "REF" # newUserId.toText();

    // Build ancestors
    let ancestors : [Nat] = switch (referralCode) {
      case (null) { [] };
      case (?code) { findAncestors(code) };
    };

    let newUser : User = {
      id = newUserId;
      name;
      mobile;
      upiId;
      referralCode = newReferralCode;
      referredByCode = referralCode;
      registrationStatus = "pending";
      walletBalance = 0;
      createdAt = Time.now().toNat();
      ancestors;
      utrId = null;
    };

    users.add(newUserId, newUser);
    principalToUserId.add(caller, newUserId);
    userProfiles.add(caller, { userId = newUserId; name });
    newReferralCode;
  };

  public shared ({ caller }) func submitUTR(utrId : Text) : async () {
    let userId = getRegisteredUserIdFromPrincipal(caller);
    let user = switch (users.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) { user };
    };

    let updatedUser : User = { user with utrId = ?utrId };
    users.add(userId, updatedUser);
  };

  func findAncestors(referralCode : Text) : [Nat] {
    var ancestorIdArray = List.empty<Nat>();
    for ((_, user) in users.entries()) {
      if (user.referralCode == referralCode) {
        ancestorIdArray.add(user.id);
        if (user.ancestors.size() > 0) {
          // Add ancestors in reverse order (deepest ancestors first)
          let reversedAncestors = user.ancestors.reverse();
          for (ancestor in reversedAncestors.values()) {
            ancestorIdArray.add(ancestor);
          };
        };
      };
    };

    // Convert to array and limit to 15 entries
    let finalArray = ancestorIdArray.toArray();
    if (finalArray.size() >= 15) {
      let reversedArray = finalArray.reverse();
      // Take only the first 15 elements (deepest descendants)
      reversedArray.sliceToArray(0, 15).reverse();
    } else {
      finalArray;
    };
  };

  public shared ({ caller }) func confirmPayment(userId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can confirm payments");
    };

    let user = switch (users.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) { user };
    };

    if (user.registrationStatus != "pending") {
      Runtime.trap("User already confirmed or invalid status");
    };

    let updatedUser : User = { user with registrationStatus = "confirmed" };
    users.add(userId, updatedUser);

    distributeReferralEarnings(userId);
  };

  func distributeReferralEarnings(userId : Nat) {
    let amounts = [10_00, 5_00, 3_00, 2_00, 1_00, 50, 25, 25, 25, 25, 25, 25, 25, 25, 25];

    let user = switch (users.get(userId)) {
      case (null) { return () };
      case (?user) { user };
    };

    for ((ix, ancestorId) in user.ancestors.enumerate()) {
      if (ix >= 15) { return () };
      let amount = amounts[ix];

      if (amount > 0) {
        let ancestor = switch (users.get(ancestorId)) {
          case (null) { return () };
          case (?a) { a };
        };

        let updatedAncestor : User = { ancestor with walletBalance = ancestor.walletBalance + amount };
        users.add(ancestorId, updatedAncestor);

        transactionIdCounter += 1;
        let transaction : WalletTransaction = {
          id = transactionIdCounter;
          userId = ancestorId;
          amount;
          description = "Referral earnings from level " # (ix + 1).toText();
          timestamp = Time.now().toNat();
        };
        walletTransactions.add(transactionIdCounter, transaction);
      };
    };
  };

  public query ({ caller }) func getUserById(userId : Nat) : async ?User {
    let callerUserId = principalToUserId.get(caller);
    let isOwnUser = switch (callerUserId) {
      case (?id) { id == userId };
      case (null) { false };
    };

    if (not (AccessControl.isAdmin(accessControlState, caller)) and not isOwnUser) {
      Runtime.trap("Unauthorized: Can only view your own user data");
    };

    users.get(userId);
  };

  public query ({ caller }) func getUserByReferralCode(referralCode : Text) : async ?User {
    // Require authentication - only registered users or admins can look up referral codes
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can look up referral codes");
    };

    users.values().toArray().find(func(user) { user.referralCode == referralCode });
  };

  public query ({ caller }) func getAllUsers() : async [User] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    users.values().toArray();
  };

  public shared ({ caller }) func uploadVideo(title : Text, description : Text, category : Text, videoUrl : Text, thumbnailUrl : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can upload videos");
    };

    videoIdCounter += 1;
    let videoId = videoIdCounter;

    let newVideo : Video = {
      id = videoId;
      title;
      description;
      category;
      videoUrl;
      thumbnailUrl;
      uploadedAt = Time.now().toNat();
    };

    videos.add(videoId, newVideo);
    videoId;
  };

  public shared ({ caller }) func editVideo(videoId : Nat, title : Text, description : Text, category : Text, videoUrl : Text, thumbnailUrl : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can edit videos");
    };

    let video = switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video does not exist") };
      case (?video) { video };
    };

    let updatedVideo : Video = {
      video with title;
      description;
      category;
      videoUrl;
      thumbnailUrl;
      uploadedAt = Time.now().toNat();
    };
    videos.add(videoId, updatedVideo);
  };

  public shared ({ caller }) func deleteVideo(videoId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete videos");
    };

    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video does not exist") };
      case (?_) {
        videos.remove(videoId);
      };
    };
  };

  func isConfirmedMember(caller : Principal) : Bool {
    let callerUserId = principalToUserId.get(caller);
    switch (callerUserId) {
      case (null) { false };
      case (?userId) {
        let user = users.get(userId);
        switch (user) {
          case (null) { false };
          case (?u) { u.registrationStatus == "confirmed" };
        };
      };
    };
  };

  public query ({ caller }) func getAllVideos() : async [Video] {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not isConfirmedMember(caller)) {
      Runtime.trap("Unauthorized: Only confirmed members can view videos");
    };
    videos.values().toArray();
  };

  public query ({ caller }) func getVideosByCategory(category : Text) : async [Video] {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not isConfirmedMember(caller)) {
      Runtime.trap("Unauthorized: Only confirmed members can view videos");
    };
    let filteredVideos = videos.values().toArray().filter(func(video) { video.category == category });
    filteredVideos;
  };

  public query ({ caller }) func getConfirmedUserWalletDetails(userId : Nat) : async (Nat, [WalletTransaction]) {
    let callerUserId = principalToUserId.get(caller);
    let isOwnUser = switch (callerUserId) {
      case (?id) { id == userId };
      case (null) { false };
    };

    if (not (AccessControl.isAdmin(accessControlState, caller)) and not isOwnUser) {
      Runtime.trap("Unauthorized: Can only view your own wallet details");
    };

    let user = switch (users.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) { user };
    };

    if (user.registrationStatus != "confirmed") {
      Runtime.trap("User is not a confirmed member");
    };

    let userTransactions = walletTransactions.values().toArray().filter(func(tx) { tx.userId == userId });
    (user.walletBalance, userTransactions);
  };

  public shared ({ caller }) func requestWithdrawal(userId : Nat, amount : Nat) : async Nat {
    let callerUserId = principalToUserId.get(caller);
    let isOwnUser = switch (callerUserId) {
      case (?id) { id == userId };
      case (null) { false };
    };

    if (not isOwnUser) {
      Runtime.trap("Unauthorized: Can only request withdrawal for yourself");
    };

    let user = switch (users.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) { user };
    };

    if (user.registrationStatus != "confirmed") {
      Runtime.trap("User is not a confirmed member");
    };

    if (amount < 500_00) {
      Runtime.trap("Minimum withdrawal amount is Rs.500 (50000 paise)");
    };

    if (amount > user.walletBalance) {
      Runtime.trap("Amount cannot be higher than your wallet balance");
    };

    withdrawalRequestIdCounter += 1;
    let requestId = withdrawalRequestIdCounter;

    let newRequest : WithdrawalRequest = {
      id = requestId;
      userId;
      amount;
      upiId = user.upiId;
      status = "pending";
      requestedAt = Time.now().toNat();
      resolvedAt = null;
    };

    withdrawalRequests.add(requestId, newRequest);
    requestId;
  };

  public shared ({ caller }) func processWithdrawalRequest(requestId : Nat, approve : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can process withdrawals");
    };

    let request = switch (withdrawalRequests.get(requestId)) {
      case (null) { Runtime.trap("Request does not exist") };
      case (?r) { r };
    };

    if (request.status != "pending") {
      Runtime.trap("Request already processed");
    };

    let updatedStatus = if (approve) { "approved" } else { "rejected" };

    let updatedRequest : WithdrawalRequest = {
      request with status = updatedStatus;
      resolvedAt = ?Time.now().toNat();
    };

    withdrawalRequests.add(requestId, updatedRequest);

    if (approve) {
      for ((id, user) in users.entries()) {
        if (id == request.userId) {
          if (request.amount > user.walletBalance) {
            Runtime.trap("User does not have enough balance for the withdrawal");
          };
          let updatedUser : User = { user with walletBalance = user.walletBalance - request.amount };
          users.add(id, updatedUser);
        };
      };
    };
  };

  public query ({ caller }) func getPendingWithdrawalRequests() : async [WithdrawalRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view withdrawal requests");
    };
    let filteredRequests = withdrawalRequests.values().toArray().filter(func(request) { request.status == "pending" });
    filteredRequests;
  };

  public query ({ caller }) func getProcessedWithdrawalRequests() : async [WithdrawalRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view withdrawal requests");
    };
    let filteredRequests = withdrawalRequests.values().toArray().filter(func(request) { request.status != "pending" });
    filteredRequests;
  };

  public query ({ caller }) func getReceivedReferralEarnings(userId : Nat) : async ?Nat {
    let callerUserId = principalToUserId.get(caller);
    let isOwnUser = switch (callerUserId) {
      case (?id) { id == userId };
      case (null) { false };
    };

    if (not (AccessControl.isAdmin(accessControlState, caller)) and not isOwnUser) {
      Runtime.trap("Unauthorized: Can only view your own earnings");
    };

    let user = switch (users.get(userId)) {
      case (null) { return null };
      case (?user) { user };
    };

    ?user.walletBalance;
  };

  func getRegisteredUserIdFromPrincipal(caller : Principal) : Nat {
    switch (principalToUserId.get(caller)) {
      case (null) { Runtime.trap("Not a registered user") };
      case (?userId) { userId };
    };
  };
};
