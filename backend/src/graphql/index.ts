export interface UserResponse {
  _id: string;
  email: string;
  name: string;
  status: string;
  posts: string[];
}

export interface PostResponse {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  creator: UserResponse | string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInputData {
  email: string;
  name: string;
  password: string;
}

export interface PostInputData {
  title: string;
  content: string;
  imageUrl: string;
}

export interface CreateUserArgs {
  userInput: UserInputData;
}

export interface CreatePostArgs {
  postInput: PostInputData;
}

export interface UpdatePostArgs {
  id: string;
  postInput: PostInputData;
}

export interface DeletePostArgs {
  id: string;
}

export interface LoginArgs {
  email: string;
  password: string;
}

export interface PostsArgs {
  page?: number;
}

export interface PostArgs {
  id: string;
}

export interface UpdateStatusArgs {
  status: string;
}

export interface AuthData {
  token: string;
  userId: string;
}
