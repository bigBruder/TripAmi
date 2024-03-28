export interface Notification {
  id: string;
  targetUserId: string;
  postId: string;
  type: NotificationType;
  text: string;
}

export enum NotificationType {
  NewPost = 'new post',
  CommentPost = 'comment post',
  NewTrip = 'new trip',
  CommentTrip = 'comment trip',
  NewReply = 'new reply',
}
