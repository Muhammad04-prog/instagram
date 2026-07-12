# API_MAP — чек-лист покрытия 57/57 endpoints

`baseURL = https://instagram-api.softclub.tj` · Auth: `Authorization: Bearer <token>` · Ответ: `{ data, errors, statusCode }`

## Account — `services/account.service.ts` (5)

- [ ] `register(dto)` → `POST /Account/register` (json: userName, fullName, email, password, confirmPassword) → `RegisterForm`
- [ ] `login(dto)` → `POST /Account/login` (json: userName, password) → `LoginForm`
- [ ] `forgotPassword(email)` → `DELETE /Account/ForgotPassword?Email=` → `ForgotPasswordForm`
- [ ] `resetPassword(p)` → `DELETE /Account/ResetPassword?Token=&Email=&Password=&ConfirmPassword=` → `ResetPasswordForm`
- [ ] `changePassword(p)` → `PUT /Account/ChangePassword?OldPassword=&Password=&ConfirmPassword=` → `ChangePasswordForm`

## Post — `services/post.service.ts` (12)

- [ ] `getPosts(params)` → `GET /Post/get-posts?UserId&Title&Content&PageNumber&PageSize` → `explore`, `PostGrid`
- [ ] `getReels(params)` → `GET /Post/get-reels?PageNumber&PageSize` → `reels`, `ReelCard`
- [ ] `getPostById(id)` → `GET /Post/get-post-by-id?id` → `post/[postId]`, модалка
- [ ] `getMyPosts()` → `GET /Post/get-my-posts` → `profile/me`
- [ ] `getFollowingPosts(params)` → `GET /Post/get-following-post?UserId&PageNumber&PageSize` → **feed `/`**
- [ ] `addPost(form)` → `POST /Post/add-post` multipart (Title, Content, Images[]) → `PostForm`
- [ ] `deletePost(id)` → `DELETE /Post/delete-post?id` → меню «…»
- [ ] `likePost(postId)` → `POST /Post/like-post?postId` → `LikeButton` (optimistic)
- [ ] `viewPost(postId)` → `POST /Post/view-post?postId` → IntersectionObserver
- [ ] `addComment(dto)` → `POST /Post/add-comment` (json: postId, comment) → `PostComments`
- [ ] `deleteComment(commentId)` → `DELETE /Post/delete-comment?commentId` → `CommentItem`
- [ ] `addPostFavorite(dto)` → `POST /Post/add-post-favorite` (json: postId) → `SaveButton`

## Story — `services/story.service.ts` (8)

- [ ] `getStories()` → `GET /Story/get-stories` → `StoryAvatarList`
- [ ] `getUserStories(userId)` → `GET /Story/get-user-stories/{userId}` → `StoryViewer`
- [ ] `getMyStories()` → `GET /Story/get-my-stories` → «Ваша история»
- [ ] `getStoryById(id)` → `GET /Story/GetStoryById?id` → deep-link
- [ ] `addStory(image, postId?)` → `POST /Story/AddStories?PostId` multipart (Image) → `StoryUploadForm`
- [ ] `likeStory(storyId)` → `POST /Story/LikeStory?storyId` → сердце во вьюере
- [ ] `addStoryView(storyId)` → `POST /Story/add-story-view?StoryId` → авто при показе
- [ ] `deleteStory(id)` → `DELETE /Story/DeleteStory?id` → «…»

## Chat — `services/chat.service.ts` (6)

- [ ] `getChats()` → `GET /Chat/get-chats` → `ChatList`
- [ ] `getChatById(chatId)` → `GET /Chat/get-chat-by-id?chatId` → `ChatWindow`
- [ ] `createChat(receiverUserId)` → `POST /Chat/create-chat?receiverUserId` → `NewChatDialog`
- [ ] `sendMessage(form)` → `PUT /Chat/send-message` multipart (ChatId, MessageText, File) → `MessageInput`
- [ ] `deleteMessage(massageId)` → `DELETE /Chat/delete-message?massageId` → `MessageBubble`
- [ ] `deleteChat(chatId)` → `DELETE /Chat/delete-chat?chatId` → `ChatListItem`

## FollowingRelationShip — `services/followingRelationShip.service.ts` (4)

- [ ] `getSubscribers(userId)` → `GET /FollowingRelationShip/get-subscribers?UserId` → `FollowersList`
- [ ] `getSubscriptions(userId)` → `GET /FollowingRelationShip/get-subscriptions?UserId` → `FollowingList`
- [ ] `follow(followingUserId)` → `POST /FollowingRelationShip/add-following-relation-ship?followingUserId` → `FollowButton`
- [ ] `unfollow(followingUserId)` → `DELETE /FollowingRelationShip/delete-following-relation-ship?followingUserId` → `FollowButton`

## User — `services/user.service.ts` (10)

- [ ] `getUsers(params)` → `GET /User/get-users?UserName&Email&PageNumber&PageSize` → `UserSearch`, `SuggestionsList`
- [ ] `addSearchHistory(text)` → `POST /User/add-search-history?Text`
- [ ] `getSearchHistories()` → `GET /User/get-search-histories`
- [ ] `deleteSearchHistory(id)` → `DELETE /User/delete-search-history?id`
- [ ] `deleteSearchHistories()` → `DELETE /User/delete-search-histories` («Очистить все»)
- [ ] `addUserSearchHistory(userSearchId)` → `POST /User/add-user-search-history?UserSearchId`
- [ ] `getUserSearchHistories()` → `GET /User/get-user-search-histories`
- [ ] `deleteUserSearchHistory(id)` → `DELETE /User/delete-user-search-history?id`
- [ ] `deleteUserSearchHistories()` → `DELETE /User/delete-user-search-histories`
- [ ] `deleteUser(userId)` → `DELETE /User/delete-user?userId` → `DeleteAccountDialog`

## UserProfile — `services/userProfile.service.ts` (7)

- [ ] `getMyProfile()` → `GET /UserProfile/get-my-profile`
- [ ] `getUserProfileById(id)` → `GET /UserProfile/get-user-profile-by-id?id`
- [ ] `getIsFollow(followingUserId)` → `GET /UserProfile/get-is-follow-user-profile-by-id?followingUserId`
- [ ] `updateProfile(dto)` → `PUT /UserProfile/update-user-profile` (json: about, gender 0|1)
- [ ] `updateAvatar(file)` → `PUT /UserProfile/update-user-image-profile` multipart (imageFile)
- [ ] `deleteAvatar()` → `DELETE /UserProfile/delete-user-image-profile`
- [ ] `getPostFavorites(params)` → `GET /UserProfile/get-post-favorites?PageNumber&PageSize` → `profile/favorites`

## Location — `services/location.service.ts` (5)

- [ ] `getLocations(params)` → `GET /Location/get-Locations?City&State&ZipCode&Country&PageNumber&PageSize` → `LocationSelect`
- [ ] `getLocationById(id)` → `GET /Location/get-Location-by-id?id`
- [ ] `addLocation(dto)` → `POST /Location/add-Location` (city, state, zipCode, country)
- [ ] `updateLocation(dto)` → `PUT /Location/update-Location` (locationId + поля)
- [ ] `deleteLocation(id)` → `DELETE /Location/delete-Location?id`

---

**Итого: 5 + 12 + 8 + 6 + 4 + 10 + 7 + 5 = 57 ✅**
