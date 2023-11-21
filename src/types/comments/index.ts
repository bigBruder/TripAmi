export interface IComment {
  id: string,
  likes: string[],
  dislikes: string[],
  postId: string,
  userName: string,
  userImage: string,
  userId: string,
  createdAt: string,
  text: string,
}
